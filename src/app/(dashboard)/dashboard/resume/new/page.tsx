'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { ResumeTemplate } from '@/types'

// ─── Template definitions ─────────────────────────────────────────────────────

const TEMPLATES: {
  value: ResumeTemplate
  label: string
  description: string
  gradient: string
}[] = [
  { value: 'modern',    label: 'Modern',    description: 'Clean lines, blue accents. Great for tech & startups.', gradient: 'from-blue-500 to-blue-700' },
  { value: 'minimal',   label: 'Minimal',   description: 'Black & white. Timeless, professional, distraction-free.', gradient: 'from-gray-500 to-gray-700' },
  { value: 'creative',  label: 'Creative',  description: 'Bold color sidebar. Perfect for designers & creatives.', gradient: 'from-purple-500 to-pink-600' },
  { value: 'developer', label: 'Developer', description: 'Dark terminal aesthetic. Built for engineers.', gradient: 'from-green-500 to-emerald-700' },
  { value: 'executive', label: 'Executive', description: 'Elegant, sophisticated. For senior professionals.', gradient: 'from-amber-500 to-orange-600' },
]

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({ template, selected, onSelect }: {
  template: (typeof TEMPLATES)[number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 overflow-hidden ${
        selected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-md'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${template.gradient} mb-3 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 flex flex-col justify-center px-4 gap-1.5 opacity-30">
          <div className="w-1/2 h-1.5 bg-white rounded-full" />
          <div className="w-4/5 h-1 bg-white rounded-full" />
          <div className="w-3/4 h-1 bg-white rounded-full" />
          <div className="w-2/3 h-1 bg-white rounded-full" />
        </div>
        <span className="text-white text-xs font-bold tracking-widest uppercase relative z-10 opacity-70">{template.label}</span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{template.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{template.description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
          {selected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewResumePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    const trimmed = title.trim()
    if (!trimmed) { toast.error('Please enter a title for your resume'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed, template: selectedTemplate }),
      })
      if (!res.ok) throw new Error()
      const { resume } = await res.json()
      toast.success('Resume created!')
      router.push(`/dashboard/resume/${resume.id}`)
    } catch {
      toast.error('Failed to create resume. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/resume"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to resumes
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create a New Resume</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {step === 1 ? 'Choose a template to get started.' : 'Give your resume a title.'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step === s ? 'bg-blue-600 text-white scale-110 shadow-md' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {step > s ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                ) : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 rounded-full transition-colors duration-300 ${step > s ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((t) => (
                <TemplateCard key={t.value} template={t} selected={selectedTemplate === t.value} onSelect={() => setSelectedTemplate(t.value)} />
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm">
                Next: Name Your Resume
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="max-w-md mx-auto">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TEMPLATES.find((t) => t.value === selectedTemplate)?.gradient} flex-shrink-0`} />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Selected template</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{TEMPLATES.find((t) => t.value === selectedTemplate)?.label}</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Change</button>
            </div>
            <div className="mb-6">
              <label htmlFor="resume-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Resume Title</label>
              <input
                id="resume-title" type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Software Engineer — Meta Application"
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                autoFocus
              />
              <p className="mt-1.5 text-xs text-gray-400">You can change this later. Keep it specific to the role you&apos;re targeting.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-3 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Back</button>
              <button onClick={handleCreate} disabled={loading || !title.trim()} className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Creating…</>
                ) : (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Create Resume</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
