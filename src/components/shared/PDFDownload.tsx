'use client'

import { useState } from 'react'
import { ResumeData } from '@/types'

interface PDFDownloadProps {
  resumeData: ResumeData
  template: string
  fileName?: string
}

const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 20
const INNER_W = PAGE_W - MARGIN * 2   // 555
const INNER_H = PAGE_H - MARGIN * 2   // 802
const RENDER_W = PAGE_W               // render at full 595 to match preview
const SCALE = INNER_W / RENDER_W      // ~0.932

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

/**
 * Collect page-break candidates from elements explicitly marked by templates.
 *
 * Templates add data-pdf-break="before" to any element whose TOP is a safe
 * cut point (i.e. we may start a new page there).  This avoids all DOM
 * geometry guessing and gives each template full control over where breaks
 * are allowed — critical for multi-column layouts where a geometric cut
 * would slice through the other column's content mid-entry.
 */
function collectSafeBreaks(root: HTMLElement, cloneTop: number): number[] {
  const set = new Set<number>([0])
  const markers = root.querySelectorAll('[data-pdf-break]')
  markers.forEach((el) => {
    const top = Math.round((el as HTMLElement).getBoundingClientRect().top - cloneTop)
    if (top > 10) set.add(top)
  })
  return Array.from(set).sort((a, b) => a - b)
}

export function PDFDownload({ resumeData, template, fileName }: PDFDownloadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // ── Clone at RENDER_W = 595px (same as live preview) ─────────────────
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.transform = 'none'
      clone.style.position = 'fixed'
      clone.style.top = '0'
      clone.style.left = '-9999px'
      clone.style.width = `${RENDER_W}px`
      clone.style.minHeight = 'unset'
      clone.style.overflow = 'visible'
      clone.style.zIndex = '-1'
      document.body.appendChild(clone)

      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

      // ── Collect break candidates (flex-row-aware) ─────────────────────────
      const cloneTop = clone.getBoundingClientRect().top
      const breaks = collectSafeBreaks(clone, cloneTop)

      // ── Render full clone to 2× canvas ───────────────────────────────────
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: RENDER_W,
        windowWidth: RENDER_W,
      })
      document.body.removeChild(clone)

      // Content height in RENDER_W (595px) space
      const contentH = canvas.height / 2
      // How much 595px content fits on one PDF page (accounting for margins+scale)
      const pageCapacity = INNER_H / SCALE   // ~860px

      // ── Build PDF ─────────────────────────────────────────────────────────
      const doc = new jsPDF({
        unit: 'px',
        format: [PAGE_W, PAGE_H],
        orientation: 'portrait',
        hotfixes: ['px_scaling'],
      })

      // Single-page limit: 1.3× page capacity.
      // Content in that band is scaled down to fit — at most ~23% smaller,
      // imperceptible at normal print sizes.  Prevents a near-blank 2nd page.
      const SINGLE_PAGE_LIMIT = pageCapacity * 1.3

      if (contentH <= SINGLE_PAGE_LIMIT) {
        // ── Single page ───────────────────────────────────────────────────
        const pdfH = Math.min(contentH * SCALE, INNER_H)
        const img = canvas.toDataURL('image/jpeg', 0.98)
        doc.addImage(img, 'JPEG', MARGIN, MARGIN, INNER_W, pdfH)
      } else {
        // ── Multi-page: slice only at flex-row-aware safe breaks ──────────
        let pageStart = 0   // in 595px space
        let firstPage = true

        while (pageStart < contentH) {
          if (!firstPage) doc.addPage()
          firstPage = false

          const remaining = contentH - pageStart
          const remainingPdf = remaining * SCALE

          // Everything left fits on this page
          if (remainingPdf <= INNER_H) {
            const slice = cropCanvas(canvas, pageStart, remaining)
            doc.addImage(slice.toDataURL('image/jpeg', 0.98),
              'JPEG', MARGIN, MARGIN, INNER_W, remainingPdf)
            break
          }

          const pageBottom = pageStart + pageCapacity

          // Latest SAFE break before the page edge
          const safeEnd = breaks
            .filter((b) => b > pageStart && b <= pageBottom)
            .pop() ?? pageBottom

          // If leftover after the break is tiny, absorb it onto this page
          const leftoverPdf = (contentH - safeEnd) * SCALE
          if (leftoverPdf > 0 && leftoverPdf < 100) {
            const slice = cropCanvas(canvas, pageStart, remaining)
            doc.addImage(slice.toDataURL('image/jpeg', 0.98),
              'JPEG', MARGIN, MARGIN, INNER_W, INNER_H)
            break
          }

          const sliceH = safeEnd - pageStart
          const slice = cropCanvas(canvas, pageStart, sliceH)
          doc.addImage(slice.toDataURL('image/jpeg', 0.98),
            'JPEG', MARGIN, MARGIN, INNER_W, sliceH * SCALE)

          pageStart = safeEnd
        }
      }

      doc.save(defaultFileName)
    } catch (err) {
      console.error('PDF generation error:', err)
      fallbackPrint(defaultFileName)
    } finally {
      setIsLoading(false)
    }
  }

  /** Crop a 2× canvas: y and h are in 1× (CSS / RENDER_W) pixels */
  function cropCanvas(src: HTMLCanvasElement, y: number, h: number): HTMLCanvasElement {
    const out = document.createElement('canvas')
    out.width = src.width
    out.height = Math.max(1, Math.round(h * 2))
    const ctx = out.getContext('2d')!
    ctx.drawImage(src, 0, Math.round(y * 2), src.width, out.height, 0, 0, src.width, out.height)
    return out
  }

  function fallbackPrint(name: string) {
    const style = document.createElement('style')
    style.id = '__resume-print-style'
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
