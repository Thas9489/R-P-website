'use client'

import { useState } from 'react'
import { ResumeData } from '@/types'

interface PDFDownloadProps {
  resumeData: ResumeData
  template: string
  fileName?: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  Coordinate system
//
//  The resume template always renders at RENDER_W = 595 CSS-px wide.
//
//  At 72 DPI (PDF native), 595 pt = 595/72 in = 8.264 in = 210.01 mm — which
//  is exactly A4 width.  Therefore every CSS-px in the template corresponds to
//  exactly PX_TO_MM mm in the PDF.
//
//  A4:  210 mm wide  ×  297 mm tall
//       595 CSS-px   ×  841.5 CSS-px   (297 / 0.35294 = 841.5)
//
//  html2canvas is captured at CANVAS_SCALE = 2 for crisp output.
//  All canvas pixel values are divided by CANVAS_SCALE to get CSS-px.
//
//  We use jsPDF unit:'mm' + format:'a4' — the only combination that reliably
//  produces an exactly 210×297 mm PDF page.  Previous approach used
//  unit:'px' + hotfixes:['px_scaling'] which multiplied all coordinates by 0.75
//  and produced a ~157×222 mm page (not A4).
// ─────────────────────────────────────────────────────────────────────────────

const RENDER_W     = 595                        // template CSS-px width (= A4 width in pt)
const PAGE_W_MM    = 210                        // A4 width  in mm
const PAGE_H_MM    = 297                        // A4 height in mm
const CANVAS_SCALE = 2                          // html2canvas resolution multiplier

// 1 CSS-px → mm conversion (derived from A4 geometry: 210 mm / 595 px)
const PX_TO_MM   = PAGE_W_MM / RENDER_W         // 0.352941… mm/px
const MM_TO_PX   = RENDER_W / PAGE_W_MM         // 2.833333… px/mm

// How many CSS-px of content fills one full A4 page.
// 297 / 0.352941 = 841.5 → floor so a slice never exceeds the PDF page.
const PAGE_H_PX  = Math.floor(PAGE_H_MM * MM_TO_PX)  // 841

// ── Single-page thresholds ────────────────────────────────────────────────────
// Content ≤ PAGE_H_PX + TOLERANCE is treated as one page.  The tolerance (≈1mm)
// absorbs the 1–3 px that sub-pixel border/gap rounding adds to what should be
// an 841-px-tall template — preventing a blank or near-blank second page.
const TOLERANCE_PX        = Math.ceil(1 * MM_TO_PX)   // 1 mm ≈ 3 px
const SINGLE_PAGE_MAX_PX  = PAGE_H_PX + TOLERANCE_PX  // 844

// If content exceeds SINGLE_PAGE_MAX_PX, we go multi-page.
// BUT: if the last page would be < MIN_LAST_FILL of a full page we collapse
// everything to a single compressed page (avoids "mostly-blank second page").
const MIN_LAST_FILL           = 0.35   // last page must be ≥ 35 % full, else collapse
const FORCE_SINGLE_MAX_PX     = 1400   // don't force-single above this (text gets too tiny)

// ── Icons ─────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.sp{animation:spin .8s linear infinite;transform-origin:center}`}</style>
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path className="sp" d="M12 2a10 10 0 0110 10" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Collect safe page-break CSS-px positions from [data-pdf-break] elements.
 * Templates mark section wrappers and individual entries so the slicer never
 * cuts mid-entry.  Multi-column templates only mark the main column, preventing
 * cross-column cuts.
 */
function collectSafeBreaks(root: HTMLElement, cloneTop: number): number[] {
  const set = new Set<number>([0])
  root.querySelectorAll('[data-pdf-break]').forEach((el) => {
    const top = Math.round((el as HTMLElement).getBoundingClientRect().top - cloneTop)
    if (top > 5) set.add(top)
  })
  return Array.from(set).sort((a, b) => a - b)
}

/**
 * Crop a horizontal strip from a 2× canvas.
 * yCssPx / hCssPx are in CSS-px (1× space); multiplied by CANVAS_SCALE internally.
 */
function cropCanvas(src: HTMLCanvasElement, yCssPx: number, hCssPx: number): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width  = src.width
  out.height = Math.max(1, Math.round(hCssPx * CANVAS_SCALE))
  const ctx  = out.getContext('2d')!
  ctx.drawImage(
    src,
    0, Math.round(yCssPx * CANVAS_SCALE),   // source y (2× space)
    src.width, out.height,                    // source w, h (2× space)
    0, 0,                                     // dest x, y
    src.width, out.height,                    // dest w, h
  )
  return out
}

/** Block until every <img> inside root has loaded (or 4-second timeout). */
async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'))
  if (!imgs.length) return
  await Promise.race([
    Promise.all(
      imgs.map((img) =>
        new Promise<void>((res) => {
          if (img.complete && img.naturalWidth > 0) { res(); return }
          img.addEventListener('load',  () => res(), { once: true })
          img.addEventListener('error', () => res(), { once: true })
        }),
      ),
    ),
    new Promise<void>((res) => setTimeout(res, 4000)),
  ])
}

/**
 * Compute page-slice boundaries in CSS-px, always respecting safe-break
 * positions so sections are never cut mid-entry.
 * Each slice fits within PAGE_H_PX (841 px = 297 mm).
 */
function computeSlices(
  contentH: number,
  breaks: number[],
): Array<{ start: number; end: number }> {
  const slices: Array<{ start: number; end: number }> = []
  let cursor = 0

  while (cursor < contentH) {
    const remaining = contentH - cursor

    if (remaining <= PAGE_H_PX) {
      slices.push({ start: cursor, end: contentH })
      break
    }

    // Latest safe break at or before the page boundary
    const pageBottom = cursor + PAGE_H_PX
    const safeEnd    =
      breaks.filter((b) => b > cursor && b <= pageBottom).pop() ?? pageBottom

    slices.push({ start: cursor, end: safeEnd })
    cursor = safeEnd
  }

  return slices
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PDFDownload({ resumeData, template, fileName }: PDFDownloadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const defaultFileName =
    fileName ?? `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`

  async function handleDownload() {
    setIsLoading(true)
    setError(null)

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const element = document.getElementById('resume-preview-root')
      if (!element) throw new Error('Resume element not found.')

      // ── 1. Off-screen clone at RENDER_W = 595 px ───────────────────────────
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.transform = 'none'
      clone.style.position  = 'fixed'
      clone.style.top       = '0'
      clone.style.left      = '-9999px'
      clone.style.width     = `${RENDER_W}px`
      clone.style.minHeight = 'unset'   // inner template divs still have minHeight:842
      clone.style.overflow  = 'visible'
      clone.style.zIndex    = '-1'
      document.body.appendChild(clone)

      // Two rAF cycles: clone is fully painted + deferred CSS resolved
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
      // Wait for profile images / icons (cross-origin assets)
      await waitForImages(clone)

      // ── 2. Collect safe break positions ─────────────────────────────────────
      const cloneTop = clone.getBoundingClientRect().top
      const breaks   = collectSafeBreaks(clone, cloneTop)

      // ── 3. Capture at 2× resolution ─────────────────────────────────────────
      const canvas = await html2canvas(clone, {
        scale:       CANVAS_SCALE,
        useCORS:     true,
        allowTaint:  true,
        logging:     false,
        width:       RENDER_W,
        windowWidth: RENDER_W,
      })
      document.body.removeChild(clone)

      // ── 4. Recover CSS-px dimensions (undo 2× scale) ────────────────────────
      //   canvas.height = contentH * CANVAS_SCALE  → contentH = canvas.height / CANVAS_SCALE
      const contentH   = Math.round(canvas.height / CANVAS_SCALE)
      const contentHMm = +(contentH * PX_TO_MM).toFixed(3)      // mm, 3 dp
      const overflowPx = contentH - PAGE_H_PX
      const overflowMm = +(overflowPx * PX_TO_MM).toFixed(3)

      // ── STEP 2: DEBUG LOGS ───────────────────────────────────────────────────
      console.group('📄 PDF Export — Debug')
      console.log('canvas.width  (2×) :', canvas.width,  'px')
      console.log('canvas.height (2×) :', canvas.height, 'px')
      console.log('content width (1×) :', RENDER_W,      'CSS-px  →', PAGE_W_MM,    'mm')
      console.log('content height(1×) :', contentH,      'CSS-px  →', contentHMm,   'mm')
      console.log('A4 page height(1×) :', PAGE_H_PX,     'CSS-px  →', PAGE_H_MM,    'mm')
      console.log('PX → MM factor     :', PX_TO_MM.toFixed(6), 'mm/px')
      console.log('CANVAS_SCALE       :', CANVAS_SCALE, '× (applied to canvas, divided out for layout)')
      console.log('overflow from A4   :', overflowPx,  'px =', overflowMm, 'mm')
      console.log('raw page estimate  :', Math.ceil(contentH / PAGE_H_PX))
      console.log('safe breaks found  :', breaks.length - 1, '(excluding y=0 origin)')

      // ── 5. Build PDF with mm units — exact A4, no hotfix distortion ─────────
      const doc     = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const fullImg = canvas.toDataURL('image/jpeg', 0.95)

      // ── PATH A: Single page ──────────────────────────────────────────────────
      //   Content is at most PAGE_H_PX + TOLERANCE_PX CSS-px.
      //   Cap image height at PAGE_H_MM so jsPDF never auto-creates a page 2.
      //   This tolerates the 1–3 px that sub-pixel font/border rendering adds to
      //   what should be a 841-px template (minHeight: 842 rounds to 841.5 CSS-px).
      if (contentH <= SINGLE_PAGE_MAX_PX) {
        const imgH = Math.min(contentHMm, PAGE_H_MM)

        console.log('─── PATH A: single page ───')
        console.log('image height in PDF:', imgH.toFixed(2), 'mm  (capped at', PAGE_H_MM, 'mm)')
        console.groupEnd()

        doc.addImage(fullImg, 'JPEG', 0, 0, PAGE_W_MM, imgH)
        doc.save(defaultFileName)
        return
      }

      // ── PATH B: Multi-page — simulate first, then decide ────────────────────
      const slices    = computeSlices(contentH, breaks)
      const lastSlice = slices[slices.length - 1]
      const lastHPx   = lastSlice.end - lastSlice.start
      const lastRatio = (lastHPx * PX_TO_MM) / PAGE_H_MM   // fraction of a full page

      console.log('─── PATH B: multi-page ───')
      console.log('slice count        :', slices.length)
      slices.forEach(({ start, end }, i) => {
        const hPx = end - start
        const pct = ((hPx * PX_TO_MM / PAGE_H_MM) * 100).toFixed(0)
        console.log(`  page ${i + 1}/${slices.length}: y=${start}–${end} px`, `(${(hPx * PX_TO_MM).toFixed(1)} mm, ${pct}% full)`)
      })
      console.log('last page fill     :', (lastRatio * 100).toFixed(1), '%  (min', (MIN_LAST_FILL * 100).toFixed(0), '% to justify)')

      // If the last page would be too sparse and the resume isn't so long that
      // compression would make text tiny, collapse everything onto one page.
      if (lastRatio < MIN_LAST_FILL && contentH <= FORCE_SINGLE_MAX_PX) {
        console.log('→ COLLAPSE to single page (last page too sparse)')
        console.groupEnd()
        doc.addImage(fullImg, 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM)
        doc.save(defaultFileName)
        return
      }

      console.log('→ RENDER', slices.length, 'pages')
      console.groupEnd()

      // ── PATH C: Genuine multi-page — slice canvas per A4 chunk ─────────────
      //   Each slice is cropped from the 2× canvas and placed at (0,0) on its own
      //   A4 page.  This gives the sharpest output: no full-canvas rescaling.
      //   Slice height ≤ PAGE_H_PX CSS-px → ≤ PAGE_H_MM mm in the PDF.
      let firstPage = true
      for (const { start, end } of slices) {
        if (!firstPage) doc.addPage()
        firstPage = false

        const hCssPx = end - start
        if (hCssPx <= 0) continue

        const hMm   = Math.min(hCssPx * PX_TO_MM, PAGE_H_MM)
        const slice = cropCanvas(canvas, start, hCssPx)
        doc.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, PAGE_W_MM, hMm)
      }

      doc.save(defaultFileName)

    } catch (err) {
      console.error('PDF generation error:', err)
      setError('PDF generation failed — please try again.')
      fallbackPrint(defaultFileName)
    } finally {
      setIsLoading(false)
    }
  }

  function fallbackPrint(name: string) {
    const style = document.createElement('style')
    style.id = '__resume-print-style'
    style.textContent = `
      @media print {
        body > *:not(#__resume-print-wrapper) { display: none !important; }
        #__resume-print-wrapper {
          display: block !important; position: fixed;
          top: 0; left: 0; right: 0; bottom: 0; z-index: 99999;
        }
        #resume-preview-root { transform: none !important; width: 100% !important; box-shadow: none !important; }
        @page { size: A4; margin: 0; }
      }
    `
    document.head.appendChild(style)
    const resumeEl = document.getElementById('resume-preview-root')
    let wrapper: HTMLDivElement | null = null
    if (resumeEl) {
      wrapper = document.createElement('div')
      wrapper.id = '__resume-print-wrapper'
      wrapper.style.display = 'none'
      const cloned = resumeEl.cloneNode(true) as HTMLElement
      cloned.style.transform = 'none'
      wrapper.appendChild(cloned)
      document.body.appendChild(wrapper)
    }
    const orig = document.title
    document.title = name
    window.print()
    setTimeout(() => {
      document.title = orig
      document.getElementById('__resume-print-style')?.remove()
      wrapper?.remove()
    }, 1000)
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px',
          background: isLoading ? '#6b7280' : '#3b82f6',
          color: '#fff', border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'background 0.15s ease',
          opacity: isLoading ? 0.8 : 1,
          boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
        }}
        onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#2563eb' }}
        onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6' }}
        aria-label="Download resume as PDF"
      >
        {isLoading ? <LoadingSpinner /> : <DownloadIcon />}
        <span>{isLoading ? 'Generating PDF…' : 'Download PDF'}</span>
      </button>
      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444', fontFamily: 'system-ui, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  )
}
