'use client'

import { useState } from 'react'
import { ResumeData } from '@/types'

interface PDFDownloadProps {
  resumeData: ResumeData
  template: string
  fileName?: string
}

// ── PDF geometry (jsPDF "px" unit at 72 DPI → A4) ──────────────────────────
const PAGE_W  = 595
const PAGE_H  = 842
const MARGIN  = 20
const INNER_W = PAGE_W - MARGIN * 2   // 555
const INNER_H = PAGE_H - MARGIN * 2   // 802

// The clone always renders at exactly this CSS width (matches live preview).
const RENDER_W = PAGE_W  // 595

// Horizontal CSS-px → PDF-px ratio.
const SCALE = INNER_W / RENDER_W  // 555/595 ≈ 0.9328

// ── Page-capacity constants (integers, no float surprises) ───────────────────
// floor(INNER_H / SCALE) = floor(802 / 0.9328) = 859.  A slice of exactly
// PAGE_CAPACITY CSS-px maps to 859 × 0.9328 = 801.1 PDF-px ≤ INNER_H ✓
const PAGE_CAPACITY = 859

// Content ≤ this CSS height → single page (≤ 23 % compression at worst).
const SINGLE_PAGE_LIMIT = 1117  // ≈ PAGE_CAPACITY × 1.3

// When the LAST page of a multi-page layout would be less than this fraction
// full, collapse everything to a single compressed page (avoids "mostly-blank
// second page" for resumes that are only slightly over one page long).
const SPARE_PAGE_THRESHOLD = 0.40   // 40 % of INNER_H

// Don't force single-page for content longer than this — the compression would
// make text unreadably small (~60 % of original size at this limit).
const FORCE_SINGLE_MAX_H = 1350

// ── Icon components ──────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Collect page-break candidates from elements that templates mark with
 * data-pdf-break.  Returns sorted CSS-px offsets from the clone top.
 * Templates control exactly where breaks are allowed — critical for multi-column
 * layouts where a geometric cut would slice across both columns simultaneously.
 */
function collectSafeBreaks(root: HTMLElement, cloneTop: number): number[] {
  const set = new Set<number>([0])
  root.querySelectorAll('[data-pdf-break]').forEach((el) => {
    const top = Math.round((el as HTMLElement).getBoundingClientRect().top - cloneTop)
    if (top > 10) set.add(top)
  })
  return Array.from(set).sort((a, b) => a - b)
}

/** Crop a 2× canvas.  y and h are in 1× (CSS / RENDER_W) pixels. */
function cropCanvas(src: HTMLCanvasElement, y: number, h: number): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width  = src.width
  out.height = Math.max(1, Math.round(h * 2))
  const ctx = out.getContext('2d')!
  ctx.drawImage(src, 0, Math.round(y * 2), src.width, out.height, 0, 0, src.width, out.height)
  return out
}

/** Wait for all <img> in root to finish loading (profile photo, icons). */
async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  if (!imgs.length) return
  await Promise.race([
    Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) { resolve(); return }
            img.addEventListener('load',  () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          }),
      ),
    ),
    // Never stall the export for a single broken image
    new Promise<void>((resolve) => setTimeout(resolve, 4000)),
  ])
}

/**
 * Simulate the multi-page layout and return an array of {start, end} slices
 * in CSS-px coordinates.  Uses the same break-selection logic as the real
 * render so we can inspect the result (e.g. last-page fullness) before
 * committing to any PDF operations.
 */
function simulatePages(
  contentH: number,
  breaks: number[],
): Array<{ start: number; end: number }> {
  const pages: Array<{ start: number; end: number }> = []
  let cursor = 0

  while (cursor < contentH) {
    const remaining    = contentH - cursor
    const remainingPdf = remaining * SCALE

    if (remainingPdf <= INNER_H) {
      pages.push({ start: cursor, end: contentH })
      break
    }

    const pageBottom = cursor + PAGE_CAPACITY
    const safeEnd    =
      breaks.filter((b) => b > cursor && b <= pageBottom).pop() ?? pageBottom

    pages.push({ start: cursor, end: safeEnd })
    cursor = safeEnd
  }

  return pages
}

// ── Component ────────────────────────────────────────────────────────────────

export function PDFDownload({ resumeData, template, fileName }: PDFDownloadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const defaultFileName =
    fileName || `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`

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

      // ── Clone at RENDER_W = 595 px (matching the live preview element) ──────
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.transform  = 'none'
      clone.style.position   = 'fixed'
      clone.style.top        = '0'
      clone.style.left       = '-9999px'
      clone.style.width      = `${RENDER_W}px`
      clone.style.minHeight  = 'unset'
      clone.style.overflow   = 'visible'
      clone.style.zIndex     = '-1'
      document.body.appendChild(clone)

      // Two animation frames → clone has fully laid out in the DOM.
      // Then wait for profile image / icon assets to load.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
      await waitForImages(clone)

      // ── Collect safe break positions ────────────────────────────────────────
      const cloneTop = clone.getBoundingClientRect().top
      const breaks   = collectSafeBreaks(clone, cloneTop)

      // ── Capture at 2× for crisp output ─────────────────────────────────────
      const canvas = await html2canvas(clone, {
        scale:       2,
        useCORS:     true,
        allowTaint:  true,
        logging:     false,
        width:       RENDER_W,
        windowWidth: RENDER_W,
      })
      document.body.removeChild(clone)

      // Round to integer to eliminate float drift
      const contentH = Math.round(canvas.height / 2)

      // ── Build PDF ───────────────────────────────────────────────────────────
      const doc = new jsPDF({
        unit:        'px',
        format:      [PAGE_W, PAGE_H],
        orientation: 'portrait',
        hotfixes:    ['px_scaling'],
      })

      const fullImg = canvas.toDataURL('image/jpeg', 0.98)

      // ── Path 1 — single page ────────────────────────────────────────────────
      // Content up to SINGLE_PAGE_LIMIT fits naturally on one A4 page with at
      // most ~23 % compression, which is imperceptible at normal print sizes.
      if (contentH <= SINGLE_PAGE_LIMIT) {
        const pdfH = Math.min(Math.round(contentH * SCALE), INNER_H)
        doc.addImage(fullImg, 'JPEG', MARGIN, MARGIN, INNER_W, pdfH)
        doc.save(defaultFileName)
        return
      }

      // ── Path 2 — simulate multi-page; decide whether to collapse ────────────
      const pages = simulatePages(contentH, breaks)

      const lastPage      = pages[pages.length - 1]
      const lastPageH     = lastPage.end - lastPage.start
      const lastPageRatio = (lastPageH * SCALE) / INNER_H

      // If the last page would be sparsely filled AND the resume isn't so long
      // that single-page compression would make text tiny, collapse to one page.
      const shouldForceSingle =
        contentH <= FORCE_SINGLE_MAX_H && lastPageRatio < SPARE_PAGE_THRESHOLD

      if (shouldForceSingle) {
        doc.addImage(fullImg, 'JPEG', MARGIN, MARGIN, INNER_W, INNER_H)
        doc.save(defaultFileName)
        return
      }

      // ── Path 3 — genuine multi-page render ─────────────────────────────────
      let firstPage = true

      for (const page of pages) {
        if (!firstPage) doc.addPage()
        firstPage = false

        const sliceH = page.end - page.start
        if (sliceH <= 0) continue

        // Per-page scale preserves aspect ratio (no cross-page squishing)
        const pdfH  = Math.min(Math.round(sliceH * SCALE), INNER_H)
        const slice = cropCanvas(canvas, page.start, sliceH)

        doc.addImage(
          slice.toDataURL('image/jpeg', 0.98),
          'JPEG',
          MARGIN,
          MARGIN,
          INNER_W,
          pdfH,
        )
      }

      doc.save(defaultFileName)
    } catch (err) {
      console.error('PDF generation error:', err)
      fallbackPrint(defaultFileName)
    } finally {
      setIsLoading(false)
    }
  }

  function fallbackPrint(name: string) {
    const style = document.createElement('style')
    style.id    = '__resume-print-style'
    style.textContent = `
      @media print {
        body > *:not(#__resume-print-wrapper) { display: none !important; }
        #__resume-print-wrapper {
          display: block !important; position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 99999; padding: ${MARGIN}px; box-sizing: border-box;
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
      wrapper.id    = '__resume-print-wrapper'
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
