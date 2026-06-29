'use client'

import { useState } from 'react'
import { ResumeData } from '@/types'

interface PDFDownloadProps {
  resumeData: ResumeData
  template: string
  fileName?: string
}

const PAGE_W = 595        // A4 width px
const PAGE_H = 842        // A4 height px
const MARGIN = 24         // margin on every side (px)
const INNER_W = PAGE_W - MARGIN * 2   // 547
const INNER_H = PAGE_H - MARGIN * 2   // 794

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

export function PDFDownload({ resumeData, template, fileName }: PDFDownloadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultFileName = fileName ||
    `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`

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

      // Clone at true 1:1, render width = INNER_W so margins appear naturally
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.transform = 'none'
      clone.style.position = 'fixed'
      clone.style.top = '0'
      clone.style.left = '-9999px'
      clone.style.width = `${INNER_W}px`
      clone.style.minHeight = 'unset'
      clone.style.overflow = 'visible'
      clone.style.zIndex = '-1'
      document.body.appendChild(clone)

      // Two rAF so layout fully settles before measuring
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

      // Collect top positions of every block-level child (section boundaries)
      const cloneTop = clone.getBoundingClientRect().top
      const breakCandidates = new Set<number>([0])
      clone.querySelectorAll('div, p, ul, li, section').forEach((el) => {
        const top = Math.round(el.getBoundingClientRect().top - cloneTop)
        if (top > 0) breakCandidates.add(top)
      })
      const breaks = Array.from(breakCandidates).sort((a, b) => a - b)

      // Render the full clone as one tall canvas (2× for retina sharpness)
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: INNER_W,
        windowWidth: INNER_W,
      })

      document.body.removeChild(clone)

      const contentH = canvas.height / 2   // actual px height of content

      const doc = new jsPDF({
        unit: 'px',
        format: [PAGE_W, PAGE_H],
        orientation: 'portrait',
        hotfixes: ['px_scaling'],
      })

      // Allow up to 20% overflow before going multi-page.
      // Content in that band is scaled down to fit — text shrinks ≤ 17%
      // which is imperceptible for typical resume fonts.
      const SINGLE_PAGE_LIMIT = Math.round(INNER_H * 1.2)  // ~952px

      if (contentH <= SINGLE_PAGE_LIMIT) {
        // ── Single page ───────────────────────────────────────────────────────
        // If content exactly fits use its real height; if slightly over, scale
        // it down to INNER_H so nothing is clipped and no 2nd page appears.
        const displayH = contentH <= INNER_H ? contentH : INNER_H
        const img = canvas.toDataURL('image/jpeg', 0.98)
        doc.addImage(img, 'JPEG', MARGIN, MARGIN, INNER_W, displayH)
      } else {
        // ── Multi-page: slice at safe section boundaries ──────────────────────
        let pageStart = 0
        let firstPage = true

        while (pageStart < contentH) {
          if (!firstPage) doc.addPage()
          firstPage = false

          const pageBottom = pageStart + INNER_H
          const remaining = contentH - pageStart

          // All remaining content fits on this page — take it and stop
          if (remaining <= INNER_H) {
            const sliceCanvas = cropCanvas(canvas, pageStart, remaining)
            doc.addImage(sliceCanvas.toDataURL('image/jpeg', 0.98),
              'JPEG', MARGIN, MARGIN, INNER_W, remaining)
            break
          }

          // Find the latest safe break-point before the page edge
          const safeEnd = breaks
            .filter((b) => b > pageStart && b <= pageBottom)
            .pop() ?? pageBottom

          // If the leftover after this break would be tiny (< 80px), absorb it
          // onto the current page by scaling slightly rather than creating a
          // near-blank extra page.
          const leftover = contentH - safeEnd
          if (leftover > 0 && leftover < 80) {
            const sliceCanvas = cropCanvas(canvas, pageStart, remaining)
            doc.addImage(sliceCanvas.toDataURL('image/jpeg', 0.98),
              'JPEG', MARGIN, MARGIN, INNER_W, INNER_H)
            break
          }

          const sliceH = safeEnd - pageStart
          const sliceCanvas = cropCanvas(canvas, pageStart, sliceH)
          doc.addImage(sliceCanvas.toDataURL('image/jpeg', 0.98),
            'JPEG', MARGIN, MARGIN, INNER_W, sliceH)

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

  /** Crop a 2× canvas slice: y and h are in 1× (CSS) px */
  function cropCanvas(
    src: HTMLCanvasElement,
    y: number,
    h: number,
  ): HTMLCanvasElement {
    const out = document.createElement('canvas')
    out.width = src.width
    out.height = Math.round(h * 2)
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
          display: block !important;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 99999;
          padding: ${MARGIN}px;
          box-sizing: border-box;
        }
        #resume-preview-root {
          transform: none !important;
          width: 100% !important;
          box-shadow: none !important;
        }
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

    const originalTitle = document.title
    document.title = name
    window.print()

    setTimeout(() => {
      document.title = originalTitle
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
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: isLoading ? '#6b7280' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'background 0.15s ease, opacity 0.15s ease',
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
