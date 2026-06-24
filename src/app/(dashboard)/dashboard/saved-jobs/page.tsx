'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getMatchScoreColor, timeAgo } from '@/lib/utils'
import type { Job, SavedJob } from '@/types'

type SortKey = 'savedAt' | 'matchScore'

function SavedJobCard({ savedJob, onUnsave }: { savedJob: SavedJob; onUnsave: (id: string) => void }) {
  const job = savedJob.jobData as Job
  const [unsaving, setUnsaving] = useState(false)
  const handleUnsave = async () => {
    setUnsaving(true)
    await onUnsave(savedJob.id)
    setUnsaving(false)
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-base font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex-shrink-0">{job.company.charAt(0)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{job.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company} &middot; {job.location}</p>
        </div>
        {job.matchScore !== undefined && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${getMatchScoreColor(job.matchScore)}`}>{job.matchScore}%</span>}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">{job.type}</span>
        {job.remote && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">Remote</span>}
        {job.salary && <span className="text-xs text-gray-500 dark:text-gray-400">{job.salary}</span>}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">{job.description}</p>
      {job.tags && job.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          {job.tags.slice(0, 4).map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">{tag}</span>)}
        </div>
      )}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <span className="text-xs text-gray-400 flex-1">Saved {timeAgo(savedJob.savedAt)}</span>
        <button onClick={handleUnsave} disabled={unsaving} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          {unsaving ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>}
          Unsave
        </button>
        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
          Apply<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </motion.div>
  )
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortKey>('savedAt')

  useEffect(() => {
    fetch('/api/jobs/save')
      .then((r) => r.json())
      .then(({ savedJobs: s }) => setSavedJobs(s || []))
      .catch(() => toast.error('Failed to load saved jobs'))
      .finally(() => setLoading(false))
  }, [])

  const handleUnsave = async (savedJobId: string) => {
    try {
      const res = await fetch('/api/jobs/save', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ savedJobId }) })
      if (!res.ok) throw new Error()
      setSavedJobs((prev) => prev.filter((s) => s.id !== savedJobId))
      toast.success('Job removed from saved')
    } catch { toast.error('Failed to remove job') }
  }

  const sorted = useMemo(() => {
    const copy = [...savedJobs]
    if (sort === 'matchScore') return copy.sort((a, b) => ((b.jobData as Job).matchScore ?? 0) - ((a.jobData as Job).matchScore ?? 0))
    return copy.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
  }, [savedJobs, sort])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Saved Jobs</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</p>
        </div>
        {savedJobs.length > 0 && (
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition w-fit">
            <option value="savedAt">Sort: Saved Date</option>
            <option value="matchScore">Sort: Match Score</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse h-52">
              <div className="flex gap-3 mb-3"><div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" /><div className="flex-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" /></div></div>
              <div className="space-y-2"><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" /><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" /></div>
            </div>
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved jobs yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">Browse jobs and save the ones that interest you. They&apos;ll appear here for easy access.</p>
          <a href="/dashboard/jobs" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Browse Jobs
          </a>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {sorted.map((savedJob) => <SavedJobCard key={savedJob.id} savedJob={savedJob} onUnsave={handleUnsave} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
