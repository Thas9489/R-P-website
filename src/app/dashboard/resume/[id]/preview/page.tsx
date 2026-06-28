'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Resume } from '@/types'
import { ResumePreview } from '@/components/resume/ResumePreview'

type LoadState = 'loading' | 'loaded' | 'error'

export default function ResumePreviewPage() {
  const params = useParams()
  const id = params.id as string

  const [resume, setResume] = useState<Resume | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/resumes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(({ resume: r }) => {
        setResume({
          id: r.id,
          title: r.title,
          template: r.template,
          data: r.data,
          userId: r.userId,
          isPublic: r.isPublic,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })
        setLoadState('loaded')
      })
      .catch(() => {
        setLoadState('error')
        toast.error('Failed to load resume preview')
      })
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!resume) return
    setPdfLoading(true)

    const source = document.getElementById('resume-preview-root')
    if (!source) {
      toast.error('Resume not ready — please wait a moment')
      setPdfLoading(false)
      return
    }

    // Place the clone at position (0,0) in the viewport so html2canvas can
    // render it without any page-layout interference (no windowWidth distortion).
    // The loading overlay (z-200) hides it from the user.
    const wrapper = document.createElement('div')
    wrapper.style.cssText =
      'position:fixed;top:0;left:0;width:595px;background:#fff;z-index:150;pointer-events:none;overflow:visible;'

    const clone = source.cloneNode(true) as HTMLElement
    clone.style.transform = 'none'
    clone.style.width = '595px'
    clone.style.minHeight = 'auto'
    clone.style.boxShadow = 'none'
    clone.style.overflow = 'visible'
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    // Two animation frames so the browser paints the clone before capture
    await new Promise<void>((r) => { requestAnimationFrame(() => { requestAnimationFrame(() => r()) }) })

    try {
      const { default: html2pdf } = await import('html2pdf.js')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (html2pdf() as any)
        .set({
          margin: 0,
          filename: `${resume.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          // Shift whole blocks to the next page instead of cutting mid-element
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(clone)
        .save()
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.error('PDF generation failed — opening print dialog instead')
      handlePrint()
    } finally {
      document.body.removeChild(wrapper)
      setPdfLoading(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview…</p>
        </div>
      </div>
    )
  }

  if (loadState === 'error' || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load preview</h2>
          <Link
            href="/dashboard/resume"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to resumes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-950 print:bg-white">
      {/* Full-screen overlay while PDF is generating — hides the transform removal flash */}
      {pdfLoading && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center print:hidden">
          <div className="bg-white dark:bg-gray-900 rounded-2xl px-8 py-6 flex items-center gap-3 shadow-2xl">
            <svg className="w-5 h-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Generating PDF…</span>
          </div>
        </div>
      )}

      {/* Floating toolbar — hidden when printing */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden"
      >
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 px-3 py-2">
          {/* Back */}
          <Link
            href={`/dashboard/resume/${id}`}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Edit
          </Link>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {pdfLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {pdfLoading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </motion.div>

      {/* Preview area */}
      <div className="py-12 px-4 flex justify-center print:py-0 print:px-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[800px] bg-white shadow-2xl print:shadow-none print:max-w-full"
        >
          <ResumePreview resumeData={resume.data} template={resume.template} />
        </motion.div>
      </div>
    </div>
  )
}
