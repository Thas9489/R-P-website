'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { resumeCompletionScore, timeAgo } from '@/lib/utils'
import type { Resume, ResumeTemplate } from '@/types'

// ─── Template config ──────────────────────────────────────────────────────────

const TEMPLATE_META: Record<ResumeTemplate, { label: string; color: string; bg: string }> = {
  modern:    { label: 'Modern',    color: 'text-blue-700 dark:text-blue-300',   bg: 'from-blue-500 to-blue-700' },
  minimal:   { label: 'Minimal',   color: 'text-gray-700 dark:text-gray-300',   bg: 'from-gray-400 to-gray-600' },
  creative:  { label: 'Creative',  color: 'text-purple-700 dark:text-purple-300', bg: 'from-purple-500 to-pink-600' },
  developer: { label: 'Developer', color: 'text-green-700 dark:text-green-300', bg: 'from-green-500 to-emerald-700' },
  executive: { label: 'Executive', color: 'text-amber-700 dark:text-amber-300', bg: 'from-amber-500 to-orange-600' },
}

type SortKey = 'updatedAt' | 'createdAt' | 'title'

// ─── Delete confirmation dialog ───────────────────────────────────────────────

function DeleteDialog({
  resumeTitle,
  onConfirm,
  onCancel,
  loading,
}: {
  resumeTitle: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Delete Resume?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              &ldquo;{resumeTitle}&rdquo; will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Resume Card ──────────────────────────────────────────────────────────────

function ResumeCard({
  resume,
  onDeleteRequest,
}: {
  resume: Resume
  onDeleteRequest: (id: string, title: string) => void
}) {
  const meta = TEMPLATE_META[resume.template] ?? TEMPLATE_META.modern
  const completion = resumeCompletionScore(resume.data)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* Colored header bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${meta.bg}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Template badge + completion ring */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${meta.color}`}>
            {meta.label}
          </span>
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
              <circle
                cx="16" cy="16" r="12" fill="none" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - completion / 100)}`}
                className={completion >= 80 ? 'text-green-500' : completion >= 50 ? 'text-amber-500' : 'text-blue-500'}
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-400">
              {completion}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 mb-1">
          {resume.title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Updated {timeAgo(resume.updatedAt)}
        </p>

        {/* Completion bar */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
            <span>Completion</span>
            <span>{completion}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-amber-400' : 'bg-blue-500'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Link
            href={`/dashboard/resume/${resume.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Link>
          <Link
            href={`/dashboard/resume/${resume.id}/preview`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Link>
          <button
            onClick={() => onDeleteRequest(resume.id, resume.title)}
            className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            title="Delete resume"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6 shadow-sm">
        <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No resumes yet</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        Create your first AI-powered resume in minutes. Stand out from the crowd with beautifully designed templates.
      </p>
      <Link
        href="/dashboard/resume/new"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create your first resume
      </Link>
    </motion.div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

export default function ResumeListClient({ initialResumes }: { initialResumes: Resume[] }) {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('updatedAt')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const filtered = useMemo(() => {
    let result = resumes.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
    result = [...result].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return result
  }, [resumes, search, sort])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
        setResumes((prev) => prev.filter((r) => r.id !== id))
        toast.success('Resume deleted')
        router.refresh()
      } catch {
        toast.error('Failed to delete resume')
      } finally {
        setDeleteTarget(null)
      }
    })
  }

  return (
    <>
      {/* Search & Sort toolbar */}
      {resumes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resumes…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          >
            <option value="updatedAt">Sort: Last Updated</option>
            <option value="createdAt">Sort: Created Date</option>
            <option value="title">Sort: Name</option>
          </select>
        </div>
      )}

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filtered.length === 0 && search ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16 text-gray-400"
            >
              No resumes match &ldquo;{search}&rdquo;
            </motion.div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDeleteRequest={(id, title) => setDeleteTarget({ id, title })}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            resumeTitle={deleteTarget.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={isDeleting}
          />
        )}
      </AnimatePresence>
    </>
  )
}
