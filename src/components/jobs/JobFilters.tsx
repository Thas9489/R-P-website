'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface FilterState {
  types: string[]
  remoteOnly: boolean
  experienceLevel: string
  datePosted: string
}

interface JobFiltersProps {
  onChange: (filters: FilterState) => void
  className?: string
}

const DEFAULT_FILTERS: FilterState = {
  types: [],
  remoteOnly: false,
  experienceLevel: '',
  datePosted: '',
}

const JOB_TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'entry', label: 'Entry Level (0–2 years)' },
  { value: 'mid', label: 'Mid Level (3–5 years)' },
  { value: 'senior', label: 'Senior Level (6–9 years)' },
  { value: 'lead', label: 'Lead / Principal (10+ years)' },
]

const DATE_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '1d', label: 'Past 24 hours' },
  { value: '7d', label: 'Past week' },
  { value: '30d', label: 'Past month' },
]

// ── Collapsible filter group ──────────────────────────────────────────────────
function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Checkbox option ────────────────────────────────────────────────────────────
function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0',
          checked
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-slate-300 group-hover:border-indigo-400',
        )}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className={cn('text-sm transition-colors', checked ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-slate-800')}
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
    </label>
  )
}

// ── Radio option ───────────────────────────────────────────────────────────────
function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5" onClick={onChange}>
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
          checked ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400',
        )}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
      </div>
      <span
        className={cn('text-sm transition-colors', checked ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-slate-800')}
      >
        {label}
      </span>
    </label>
  )
}

export default function JobFilters({ onChange, className = '' }: JobFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const appliedCount = [
    filters.types.length > 0 ? 1 : 0,
    filters.remoteOnly ? 1 : 0,
    filters.experienceLevel ? 1 : 0,
    filters.datePosted ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  function update(partial: Partial<FilterState>) {
    const next = { ...filters, ...partial }
    setFilters(next)
    onChange(next)
  }

  function toggleType(value: string) {
    const types = filters.types.includes(value)
      ? filters.types.filter((t) => t !== value)
      : [...filters.types, value]
    update({ types })
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
    onChange(DEFAULT_FILTERS)
  }

  return (
    <div className={cn('bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm', className)}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800 text-sm">Filters</h3>
          {appliedCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center"
            >
              {appliedCount}
            </motion.span>
          )}
        </div>
        {appliedCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="px-5 py-4 space-y-1 divide-y divide-slate-100">
        {/* ── Job Type ─────────────────────────────────────────────────────── */}
        <FilterGroup title="Job Type">
          {JOB_TYPE_OPTIONS.map((opt) => (
            <CheckOption
              key={opt.value}
              label={opt.label}
              checked={filters.types.includes(opt.value)}
              onChange={() => toggleType(opt.value)}
            />
          ))}
        </FilterGroup>

        {/* ── Remote Only ──────────────────────────────────────────────────── */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Remote Only</span>
            <Switch
              checked={filters.remoteOnly}
              onCheckedChange={(v) => update({ remoteOnly: v })}
              aria-label="Remote only toggle"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Show only remote-friendly positions
          </p>
        </div>

        {/* ── Experience Level ─────────────────────────────────────────────── */}
        <FilterGroup title="Experience Level">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.value}
              label={opt.label}
              checked={filters.experienceLevel === opt.value}
              onChange={() =>
                update({
                  experienceLevel: filters.experienceLevel === opt.value ? '' : opt.value,
                })
              }
            />
          ))}
        </FilterGroup>

        {/* ── Date Posted ──────────────────────────────────────────────────── */}
        <FilterGroup title="Date Posted">
          {DATE_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.value}
              label={opt.label}
              checked={filters.datePosted === opt.value}
              onChange={() => update({ datePosted: opt.value })}
            />
          ))}
        </FilterGroup>
      </div>

      {/* ── Clear button at bottom ────────────────────────────────────────── */}
      {appliedCount > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={clearAll}
            className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
