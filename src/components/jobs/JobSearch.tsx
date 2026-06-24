'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, ChevronDown, X, Clock, Loader2 } from 'lucide-react'

interface JobSearchProps {
  onSearch: (params: { keyword: string; location: string; type: string }) => void
  loading?: boolean
}

const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
  { value: 'internship', label: 'Internship' },
]

const STORAGE_KEY = 'resumeai_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): Array<{ keyword: string; location: string; type: string }> {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(search: { keyword: string; location: string; type: string }) {
  const recent = getRecentSearches().filter(
    (s) => !(s.keyword === search.keyword && s.location === search.location),
  )
  recent.unshift(search)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export default function JobSearch({ onSearch, loading = false }: JobSearchProps) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('all')
  const [recentSearches, setRecentSearches] = useState<
    Array<{ keyword: string; location: string; type: string }>
  >([])
  const [showRecent, setShowRecent] = useState(false)
  const keywordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  function handleSearch() {
    if (!keyword.trim() && !location.trim()) return
    const params = { keyword: keyword.trim(), location: location.trim(), type: jobType }
    saveRecentSearch(params)
    setRecentSearches(getRecentSearches())
    onSearch(params)
    setShowRecent(false)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function applyRecentSearch(search: { keyword: string; location: string; type: string }) {
    setKeyword(search.keyword)
    setLocation(search.location)
    setJobType(search.type)
    onSearch(search)
    setShowRecent(false)
  }

  function removeRecentSearch(index: number, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = recentSearches.filter((_, i) => i !== index)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRecentSearches(updated)
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.removeItem(STORAGE_KEY)
    setRecentSearches([])
  }

  const selectedTypeLabel =
    JOB_TYPES.find((t) => t.value === jobType)?.label ?? 'All Types'

  return (
    <div className="relative w-full">
      {/* ── Search bar ────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-visible">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Keyword input */}
          <div className="flex items-center gap-2 flex-1 px-4 py-3 group relative">
            <Search className="w-4 h-4 text-slate-400 shrink-0 group-focus-within:text-indigo-500 transition-colors" />
            <input
              ref={keywordRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowRecent(recentSearches.length > 0)}
              onBlur={() => setTimeout(() => setShowRecent(false), 150)}
              placeholder="Job title, keyword, company"
              className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Location input */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-[200px] px-4 py-3 group">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="City, state, or remote"
              className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
            />
            {location && (
              <button
                onClick={() => setLocation('')}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Job type select */}
          <div className="flex items-center gap-2 px-4 py-3 sm:max-w-[160px] relative">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="appearance-none flex-1 text-sm bg-transparent outline-none text-slate-700 cursor-pointer pr-5"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-4 pointer-events-none" />
          </div>

          {/* Search button */}
          <div className="p-2">
            <button
              onClick={handleSearch}
              disabled={loading || (!keyword.trim() && !location.trim())}
              className="w-full sm:w-auto h-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent searches dropdown ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showRecent && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recent searches
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
            {recentSearches.map((search, i) => (
              <button
                key={i}
                onClick={() => applyRecentSearch(search)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
              >
                <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-700 font-medium truncate block">
                    {search.keyword || '(any title)'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {[search.location, search.type !== 'all' ? search.type : '']
                      .filter(Boolean)
                      .join(' · ') || 'Any location · Any type'}
                  </span>
                </div>
                <button
                  onClick={(e) => removeRecentSearch(i, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active filters chips ──────────────────────────────────────────────── */}
      {(keyword || location || jobType !== 'all') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 mt-3"
        >
          {keyword && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
              <Search className="w-3 h-3" />
              {keyword}
              <button onClick={() => setKeyword('')} className="hover:text-indigo-900 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
              <MapPin className="w-3 h-3" />
              {location}
              <button onClick={() => setLocation('')} className="hover:text-blue-900 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {jobType !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              {selectedTypeLabel}
              <button onClick={() => setJobType('all')} className="hover:text-green-900 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </motion.div>
      )}
    </div>
  )
}
