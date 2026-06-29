'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Portfolio, Resume, PortfolioTheme, ResumeData } from '@/types'
import ModernTheme from '@/components/portfolio/themes/ModernTheme'
import MinimalTheme from '@/components/portfolio/themes/MinimalTheme'
import DeveloperTheme from '@/components/portfolio/themes/DeveloperTheme'
import CreativeTheme from '@/components/portfolio/themes/CreativeTheme'

// ─── Constants ────────────────────────────────────────────────────────────────

const THEMES: { value: PortfolioTheme; label: string; description: string; preview: string }[] = [
  { value: 'modern',    label: 'Modern',    description: 'Clean, bold, blue accents',     preview: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  { value: 'minimal',   label: 'Minimal',   description: 'Elegant black & white',         preview: 'bg-gradient-to-br from-gray-700 to-gray-900' },
  { value: 'developer', label: 'Developer', description: 'Dark terminal, green accents',  preview: 'bg-gradient-to-br from-green-700 to-emerald-900' },
  { value: 'creative',  label: 'Creative',  description: 'Vibrant, colorful, expressive', preview: 'bg-gradient-to-br from-purple-500 to-pink-600' },
]

// ─── Theme preview renderer ───────────────────────────────────────────────────

function PortfolioPreview({ theme, resumeData, slug }: { theme: PortfolioTheme; resumeData: ResumeData; slug: string }) {
  const props = { resumeData, slug }
  switch (theme) {
    case 'minimal':   return <MinimalTheme {...props} />
    case 'developer': return <DeveloperTheme {...props} />
    case 'creative':  return <CreativeTheme {...props} />
    default:          return <ModernTheme {...props} />
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
        copied
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {copied ? (
        <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Copied!</>
      ) : (
        <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>Copy URL</>
      )}
    </button>
  )
}

function ShareModal({ url, onClose }: { url: string; onClose: () => void }) {
  const shareLinks = [
    { label: 'LinkedIn', color: 'bg-[#0077B5] hover:bg-[#006097]', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, icon: 'in' },
    { label: 'Twitter/X', color: 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check+out+my+portfolio!`, icon: 'X' },
    { label: 'WhatsApp', color: 'bg-[#25D366] hover:bg-[#20BD5A]', href: `https://wa.me/?text=${encodeURIComponent('Check out my portfolio: ' + url)}`, icon: 'W' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">Share Portfolio</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 mb-5">
          <p className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-mono">{url}</p>
          <CopyButton text={url} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Share on</p>
        <div className="flex gap-3">
          {shareLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors ${link.color}`}>
              <span className="font-bold text-xs">{link.icon}</span>{link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function SettingsPanel({
  portfolio,
  resumes,
  onUpdate,
  onDelete,
}: {
  portfolio: Portfolio
  resumes: Resume[]
  onUpdate: (u: Partial<Portfolio>) => void
  onDelete: () => void
}) {
  const [slug, setSlug] = useState(portfolio.slug)
  const [theme, setTheme] = useState<PortfolioTheme>(portfolio.theme as PortfolioTheme)
  const [isPublic, setIsPublic] = useState(portfolio.isPublic)
  const [resumeId, setResumeId] = useState(portfolio.resumeId)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setSlug(portfolio.slug)
    setTheme(portfolio.theme as PortfolioTheme)
    setIsPublic(portfolio.isPublic)
    setResumeId(portfolio.resumeId)
  }, [portfolio.id, portfolio.slug, portfolio.theme, portfolio.isPublic, portfolio.resumeId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = { theme, isPublic, slug }
      if (resumeId !== portfolio.resumeId) body.resumeId = resumeId

      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to save')
      }
      const { portfolio: updated } = await res.json()
      onUpdate(updated)
      toast.success('Portfolio settings saved')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch('/api/portfolio', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Portfolio deleted')
      onDelete()
    } catch {
      toast.error('Failed to delete portfolio')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
        Portfolio Settings
      </h3>

      {/* Theme */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button key={t.value} onClick={() => setTheme(t.value)} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${theme === t.value ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <div className={`w-6 h-6 rounded-lg flex-shrink-0 ${t.preview}`} />
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Resume selector */}
      {resumes.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Resume</label>
          <select
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* URL Slug */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL Slug</label>
        <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <span className="px-3 py-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">/portfolio/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, ''),
              )
            }
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="your-name"
          />
        </div>
      </div>

      {/* Public toggle */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Public Portfolio</p>
          <p className="text-xs text-gray-400 mt-0.5">Anyone with the link can view it</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(!isPublic)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isPublic ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {saving ? (
          <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Saving…</>
        ) : 'Save Settings'}
      </button>

      {/* Delete zone */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <AnimatePresence>
          {confirmDelete && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-red-600 dark:text-red-400 mb-2"
            >
              This will permanently delete your portfolio. Click again to confirm.
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors disabled:opacity-60 ${
              confirmDelete
                ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                : 'border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
          >
            {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete Portfolio'}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'loaded'>('loading')
  const [selectedResume, setSelectedResume] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<PortfolioTheme>('modern')
  const [generating, setGenerating] = useState(false)
  const [showShare, setShowShare] = useState(false)
  // Always use window.location.origin so the share link reflects the actual
  // domain the app is deployed on (works in both dev and production).
  const [appUrl, setAppUrl] = useState('')

  useEffect(() => {
    setAppUrl(window.location.origin)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [portfolioRes, resumesRes] = await Promise.all([fetch('/api/portfolio'), fetch('/api/resumes')])
      const { portfolio: p } = await portfolioRes.json()
      const { resumes: r } = await resumesRes.json()
      setPortfolio(p || null)
      setResumes(r || [])
      if (r?.length > 0) setSelectedResume(r[0].id)
    } catch { toast.error('Failed to load portfolio data') }
    finally { setLoadState('loaded') }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleGenerate = async () => {
    if (!selectedResume) { toast.error('Please select a resume'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResume, theme: selectedTheme }),
      })
      if (!res.ok) throw new Error()
      const { portfolio: p } = await res.json()
      setPortfolio(p)
      toast.success('Portfolio generated!')
    } catch { toast.error('Failed to generate portfolio') }
    finally { setGenerating(false) }
  }

  // Full absolute URL (for copy/share) — available once appUrl is resolved
  const publicUrl = portfolio && appUrl ? `${appUrl}/portfolio/${portfolio.slug}` : ''
  // Relative path — always safe to use as an href (browser resolves against current origin)
  const portfolioPath = portfolio ? `/portfolio/${portfolio.slug}` : ''
  const resumeData = (portfolio?.resume?.data as ResumeData | undefined) ?? null

  if (loadState === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Portfolio</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your public-facing web portfolio, generated from your resume.</p>
      </div>

      <AnimatePresence mode="wait">
        {!portfolio ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generate Your Portfolio</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Turn your resume into a stunning public portfolio website in seconds.</p>
              <div className="mb-4 text-left">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Resume</label>
                {resumes.length === 0 ? (
                  <p className="text-sm text-gray-400">No resumes found. <a href="/dashboard/resume/new" className="text-blue-600 dark:text-blue-400 hover:underline">Create one first.</a></p>
                ) : (
                  <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                )}
              </div>
              <div className="mb-6 text-left">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Choose Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => (
                    <button key={t.value} onClick={() => setSelectedTheme(t.value)} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${selectedTheme === t.value ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className={`w-5 h-5 rounded-md flex-shrink-0 ${t.preview}`} />
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating || !selectedResume} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
                {generating
                  ? (<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Generating…</>)
                  : (<><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>Generate Portfolio</>)
                }
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="exists" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: stats + URL bar + portfolio preview */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard
                  icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  label="Total Views" value={portfolio.views.toLocaleString()}
                />
                <StatCard
                  icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                  label="Last Updated" value={new Date(portfolio.updatedAt).toLocaleDateString()}
                />
                <StatCard
                  icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
                  label="Status" value={portfolio.isPublic ? 'Public' : 'Private'}
                />
              </div>

              {/* Public URL bar */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Public URL</p>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 flex-wrap">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate font-mono">
                    {publicUrl || portfolioPath}
                  </span>
                  <div className="flex gap-2">
                    {/* Copy needs the full absolute URL */}
                    {publicUrl && <CopyButton text={publicUrl} />}
                    {/* Open always works — relative path resolves against current origin */}
                    <a href={portfolioPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Open
                    </a>
                    {publicUrl && (
                      <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        Share
                      </button>
                    )}
                  </div>
                </div>
                {!portfolio.isPublic && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    Portfolio is private — enable &ldquo;Public Portfolio&rdquo; in settings so others can view it
                  </p>
                )}
              </div>

              {/* Portfolio preview — renders the theme component directly */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono truncate flex-1 text-center">
                    {publicUrl || `/portfolio/${portfolio.slug}`}
                  </span>
                </div>

                {/* Theme rendered directly — scroll to explore */}
                <div className="h-[480px] overflow-y-auto overflow-x-hidden">
                  {resumeData ? (
                    <PortfolioPreview
                      key={`${portfolio.theme}-${portfolio.resumeId}`}
                      theme={portfolio.theme as PortfolioTheme}
                      resumeData={resumeData}
                      slug={portfolio.slug}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                      <svg className="w-10 h-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <p className="text-sm">No resume attached</p>
                      <p className="text-xs">Select a resume in settings and save</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: settings */}
            <div className="lg:col-span-1">
              <SettingsPanel
                portfolio={portfolio}
                resumes={resumes}
                onUpdate={(updates) => setPortfolio((prev) => prev ? { ...prev, ...updates } : prev)}
                onDelete={() => setPortfolio(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShare && portfolio && publicUrl && (
          <ShareModal url={publicUrl} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
