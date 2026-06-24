'use client'

import { useState } from 'react'
import { ResumeData } from '@/types'

interface PDFDownloadProps {
  resumeData: ResumeData
  template: string
  fileName?: string
}

function DownloadIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner { animation: spin 0.8s linear infinite; transform-origin: center; }
      `}</style>
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path className="spinner" d="M12 2a10 10 0 0110 10" />
    </svg>
  )
}

export function PDFDownload({ resumeData, template, fileName }: PDFDownloadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultFileName = fileName || `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`

  async function handleDownload() {
    setIsLoading(true)
    setError(null)

    try {
      // Attempt html2pdf.js approach (dynamic import for SSR safety)
      const html2pdfModule = await import('html2pdf.js').catch(() => null)

      if (html2pdfModule) {
        const html2pdf = html2pdfModule.default

        // Find the resume DOM element
        const element = document.getElementById('resume-preview-root')
        if (!element) {
          throw new Error('Resume element not found. Make sure ResumePreview is mounted.')
        }

        // Clone the element at 1:1 scale so PDF captures full content
        const clone = element.cloneNode(true) as HTMLElement
        clone.style.transform = 'none'
        clone.style.position = 'fixed'
        clone.style.top = '-9999px'
        clone.style.left = '-9999px'
        clone.style.width = '595px'
        clone.style.zIndex = '-1'
        document.body.appendChild(clone)

        const options = {
          margin: 0,
          filename: defaultFileName,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 595,
            windowWidth: 595,
          },
          jsPDF: {
            unit: 'px',
            format: [595, 842],
            orientation: 'portrait',
            hotfixes: ['px_scaling'],
          },
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (html2pdf() as any).set(options).from(clone).save()
        document.body.removeChild(clone)
      } else {
        // Fallback: window.print() with print styles
        fallbackPrint(defaultFileName)
      }
    } catch (err) {
      console.error('PDF generation error:', err)
      // Fallback to print dialog
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
        body > *:not(#resume-print-wrapper) { display: none !important; }
        #resume-print-wrapper {
          display: block !important;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 99999;
        }
        #resume-preview-root {
          transform: none !important;
          width: 595px !important;
          box-shadow: none !important;
        }
        @page {
          size: A4;
          margin: 0;
        }
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

    // Cleanup
    setTimeout(() => {
      document.title = originalTitle
      const s = document.getElementById('__resume-print-style')
      if (s) s.remove()
      if (wrapper) wrapper.remove()
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
        onMouseEnter={(e) => {
          if (!isLoading)
            (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'
        }}
        onMouseLeave={(e) => {
          if (!isLoading)
            (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6'
        }}
        aria-label="Download resume as PDF"
      >
        {isLoading ? <LoadingSpinner /> : <DownloadIcon />}
        <span>{isLoading ? 'Generating PDF…' : 'Download PDF'}</span>
      </button>

      {error && (
        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
