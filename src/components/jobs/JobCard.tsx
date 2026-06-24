'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  DollarSign,
  Briefcase,
  Clock,
  Wifi,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Job } from '@/types'

interface JobCardProps {
  job?: Job
  onSave: (job: Job) => void
  isSaved?: boolean
  onClick?: () => void
}

// ── Match score badge ──────────────────────────────────────────────────────────
function MatchBadge({ score }: { score: number }) {
  const config =
    score >= 80
      ? { bg: 'bg-green-100 text-green-700 border-green-200', label: `${score}% Match` }
      : score >= 60
        ? { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: `${score}% Match` }
        : { bg: 'bg-slate-100 text-slate-500 border-slate-200', label: `${score}% Match` }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
        config.bg,
      )}
    >
      {config.label}
    </span>
  )
}

// ── Job type badge ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'full-time': 'bg-blue-50 text-blue-700 border-blue-100',
    'part-time': 'bg-purple-50 text-purple-700 border-purple-100',
    contract: 'bg-orange-50 text-orange-700 border-orange-100',
    internship: 'bg-pink-50 text-pink-700 border-pink-100',
    remote: 'bg-green-50 text-green-700 border-green-100',
  }
  const label = type.replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        colors[type] ?? 'bg-slate-50 text-slate-600 border-slate-100',
      )}
    >
      {label}
    </span>
  )
}

// ── Skeleton loading card ──────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-200" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-slate-200 rounded-full w-20" />
        <div className="h-6 bg-slate-200 rounded-full w-16" />
        <div className="h-6 bg-slate-200 rounded-full w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
      </div>
    </div>
  )
}

// ── Company logo circle ────────────────────────────────────────────────────────
const LOGO_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-green-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-yellow-500 to-orange-600',
]

function CompanyLogo({ company, logo }: { company: string; logo?: string }) {
  const colorIndex = company.charCodeAt(0) % LOGO_COLORS.length
  const gradient = LOGO_COLORS[colorIndex]

  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={company}
        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm',
        gradient,
      )}
    >
      {company.charAt(0).toUpperCase()}
    </div>
  )
}

// ── Main JobCard ───────────────────────────────────────────────────────────────
export default function JobCard({ job, onSave, isSaved = false, onClick }: JobCardProps) {
  if (!job) return <SkeletonCard />

  const postedAgo = (() => {
    try {
      return formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  })()

  function handleSaveClick(e: React.MouseEvent) {
    e.stopPropagation()
    onSave(job!)
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer',
        'hover:border-indigo-200 hover:shadow-md transition-all duration-200',
        'relative overflow-hidden',
      )}
    >
      {/* Hover accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-3">
        <CompanyLogo company={job.company} logo={job.logo} />

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base leading-tight truncate pr-2 group-hover:text-indigo-700 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{job.company}</span>
          </div>
        </div>

        {/* Save button */}
        <motion.button
          onClick={handleSaveClick}
          whileTap={{ scale: 0.85 }}
          title={isSaved ? 'Unsave job' : 'Save job'}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0',
            isSaved
              ? 'bg-indigo-100 text-indigo-600 hover:bg-red-50 hover:text-red-500'
              : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600',
          )}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 fill-current" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* ── Badges row ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <TypeBadge type={job.type} />
        {job.remote && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Wifi className="w-3 h-3" /> Remote
          </span>
        )}
        {job.matchScore !== undefined && <MatchBadge score={job.matchScore} />}
      </div>

      {/* ── Meta row ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <DollarSign className="w-3 h-3 shrink-0" />
            {job.salary}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          {postedAgo}
        </span>
        {job.source && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 shrink-0" />
            {job.source}
          </span>
        )}
      </div>

      {/* ── Description preview ──────────────────────────────────────────────── */}
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{job.description}</p>

      {/* ── Tags ─────────────────────────────────────────────────────────────── */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[11px] font-mono border border-slate-100"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="px-2 py-0.5 text-slate-400 text-[11px]">
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
