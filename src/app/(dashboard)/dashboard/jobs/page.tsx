'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getMatchScoreColor, timeAgo } from '@/lib/utils'
import type { Job, SavedJob, JobType } from '@/types'

type ActiveTab = 'search' | 'saved'

interface SearchParams {
  keyword: string
  location: string
  type: JobType | 'all'
  remote: boolean
}

function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-3" />
          <div className="flex gap-2"><div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" /><div className="h-5 w-12 bg-gray-100 dark:bg-gray-800 rounded-full" /></div>
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, selected, savedJobId, onSelect, onSave, onUnsave }: {
  job: Job; selected: boolean; savedJobId?: string
  onSelect: () => void; onSave: () => void; onUnsave: (id: string) => void
}) {
  const [actionLoading, setActionLoading] = useState(false)
  const isSaved = !!savedJobId
  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(true)
    if (savedJobId) { await onUnsave(savedJobId) } else { await onSave() }
    setActionLoading(false)
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }}
      onClick={onSelect} className={`bg-white dark:bg-gray-900 rounded-xl border-2 p-4 cursor-pointer transition-all ${selected ? 'border-blue-600 shadow-md' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">{job.company.charAt(0)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company} &middot; {job.location}</p>
            </div>
            <button onClick={handleSaveToggle} disabled={actionLoading} className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'} disabled:opacity-50`} title={isSaved ? 'Unsave' : 'Save'}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">{job.type}</span>
            {job.remote && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">Remote</span>}
            {job.salary && <span className="text-xs text-gray-500 dark:text-gray-400">{job.salary}</span>}
            {job.matchScore !== undefined && <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${getMatchScoreColor(job.matchScore)}`}>{job.matchScore}% match</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{timeAgo(job.postedAt)}</p>
        </div>
      </div>
    </motion.div>
  )
}

function JobDetail({ job, savedJobId, onSave, onUnsave }: { job: Job; savedJobId?: string; onSave: () => void; onUnsave: (id: string) => void }) {
  const [actionLoading, setActionLoading] = useState(false)
  const isSaved = !!savedJobId
  const handleSaveToggle = async () => {
    setActionLoading(true)
    if (savedJobId) { await onUnsave(savedJobId) } else { await onSave() }
    setActionLoading(false)
  }
  return (
    <motion.div key={job.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-full overflow-auto">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xl font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex-shrink-0">{job.company.charAt(0)}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company} &middot; {job.location}</p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">{job.type}</span>
            {job.remote && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">Remote</span>}
            {job.salary && <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{job.salary}</span>}
            {job.matchScore !== undefined && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getMatchScoreColor(job.matchScore)}`}>{job.matchScore}% match</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Apply Now
        </a>
        <button onClick={handleSaveToggle} disabled={actionLoading} className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl border-2 transition-all disabled:opacity-60 ${isSaved ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
          {isSaved ? 'Saved' : 'Save Job'}
        </button>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Job Description</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Requirements</h3>
        <ul className="space-y-1.5">
          {job.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {req}
            </li>
          ))}
        </ul>
      </div>
      {job.tags && job.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">{job.tags.map((tag) => <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium">{tag}</span>)}</div>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">via {job.source} &middot; {timeAgo(job.postedAt)}</p>
    </motion.div>
  )
}

function FiltersPanel({ params, onChange }: { params: SearchParams; onChange: (p: Partial<SearchParams>) => void }) {
  const types: { value: JobType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' }, { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' }, { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }, { value: 'remote', label: 'Remote' },
  ]
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
        Filters
      </h3>
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Job Type</p>
        <div className="space-y-1">
          {types.map((t) => (
            <button key={t.value} onClick={() => onChange({ type: t.value })} className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${params.type === t.value ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Remote only</p>
        <button type="button" role="switch" aria-checked={params.remote} onClick={() => onChange({ remote: !params.remote })} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${params.remote ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${params.remote ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('search')
  const [jobs, setJobs] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams>({ keyword: '', location: '', type: 'all', remote: false })
  const [keywordInput, setKeywordInput] = useState('')
  const [locationInput, setLocationInput] = useState('')

  const fetchSavedJobs = useCallback(async () => {
    try { const res = await fetch('/api/jobs/save'); const { savedJobs: s } = await res.json(); setSavedJobs(s || []) } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchSavedJobs() }, [fetchSavedJobs])

  const fetchJobs = useCallback(async (params: SearchParams, p = 1, append = false) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ keyword: params.keyword, location: params.location, type: params.type, remote: params.remote ? 'true' : 'false', page: String(p), limit: '6' })
      const res = await fetch(`/api/jobs?${qs}`)
      const data = await res.json()
      setJobs((prev) => append ? [...prev, ...data.jobs] : data.jobs)
      setHasMore(data.hasMore)
      setPage(p)
      if (!append && data.jobs.length > 0) setSelectedJob(data.jobs[0])
    } catch { toast.error('Failed to fetch jobs') }
    finally { setLoading(false) }
  }, [])

  const handleSearch = () => {
    const params = { ...searchParams, keyword: keywordInput, location: locationInput }
    setSearchParams(params)
    fetchJobs(params, 1, false)
  }

  const handleFilterChange = (updates: Partial<SearchParams>) => {
    const params = { ...searchParams, ...updates }
    setSearchParams(params)
    fetchJobs(params, 1, false)
  }

  const handleSave = async (job: Job) => {
    try {
      const res = await fetch('/api/jobs/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobData: job }) })
      if (!res.ok) throw new Error()
      toast.success('Job saved!')
      fetchSavedJobs()
    } catch { toast.error('Failed to save job') }
  }

  const handleUnsave = async (savedJobId: string) => {
    try {
      const res = await fetch('/api/jobs/save', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ savedJobId }) })
      if (!res.ok) throw new Error()
      toast.success('Job removed from saved')
      fetchSavedJobs()
    } catch { toast.error('Failed to remove job') }
  }

  const getSavedJobId = (jobId: string) => savedJobs.find((s) => (s.jobData as Job).id === jobId)?.id
  const displayedJobs = activeTab === 'saved' ? savedJobs.map((s) => s.jobData as Job) : jobs

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Job Search</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Find your next opportunity.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Job title, keywords…" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition" />
        </div>
        <div className="relative sm:w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Location…" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition" />
        </div>
        <button onClick={handleSearch} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          {loading ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
          Search
        </button>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 w-fit">
        {([['search', 'Search Results'], ['saved', `Saved (${savedJobs.length})`]] as [ActiveTab, string][]).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5">
        <div className="hidden lg:block">
          <FiltersPanel params={searchParams} onChange={handleFilterChange} />
        </div>
        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : displayedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p className="text-sm font-medium">{activeTab === 'saved' ? 'No saved jobs yet. Browse jobs to save ones you like.' : 'Search for jobs using keywords above.'}</p>
            </div>
          ) : (
            <AnimatePresence>
              {displayedJobs.map((job) => (
                <JobCard key={job.id} job={job} selected={selectedJob?.id === job.id} savedJobId={getSavedJobId(job.id)} onSelect={() => setSelectedJob(job)} onSave={() => handleSave(job)} onUnsave={handleUnsave} />
              ))}
            </AnimatePresence>
          )}
          {!loading && hasMore && activeTab === 'search' && (
            <button onClick={() => fetchJobs(searchParams, page + 1, true)} className="w-full py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mt-2">Load more jobs</button>
          )}
        </div>
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <JobDetail key={selectedJob.id} job={selectedJob} savedJobId={getSavedJobId(selectedJob.id)} onSave={() => handleSave(selectedJob)} onUnsave={handleUnsave} />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center justify-center text-center h-full min-h-64">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                <p className="text-sm text-gray-400 dark:text-gray-500">Select a job to see details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
