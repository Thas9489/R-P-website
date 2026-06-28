'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Briefcase, CalendarDays, Sparkles, RefreshCw, Check, Loader2 } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Experience } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i))

function monthYearToString(month: string, year: string): string {
  if (!month || !year) return ''
  return `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, '0')}`
}
function stringToMonthYear(value: string): { month: string; year: string } {
  if (!value) return { month: '', year: '' }
  const [year, m] = value.split('-')
  return { month: MONTHS[parseInt(m, 10) - 1] ?? '', year: year ?? '' }
}
function formatDate(date: string): string {
  const { month, year } = stringToMonthYear(date)
  return month && year ? `${month.slice(0, 3)} ${year}` : ''
}

function DatePicker({ label, value, onChange, disabled, error }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; error?: string }) {
  const parsed = stringToMonthYear(value)
  const [localMonth, setLocalMonth] = useState(parsed.month)
  const [localYear, setLocalYear] = useState(parsed.year)

  useEffect(() => {
    const { month, year } = stringToMonthYear(value)
    setLocalMonth(month)
    setLocalYear(year)
  }, [value])

  const handleMonthChange = (newMonth: string) => {
    setLocalMonth(newMonth)
    if (newMonth && localYear) {
      onChange(monthYearToString(newMonth, localYear))
    } else if (!newMonth) {
      onChange('')
    }
  }

  const handleYearChange = (newYear: string) => {
    setLocalYear(newYear)
    if (localMonth && newYear) {
      onChange(monthYearToString(localMonth, newYear))
    } else if (!newYear) {
      onChange('')
    }
  }

  const borderClass = error ? 'border-red-400' : 'border-input'
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</Label>
      <div className="flex gap-2">
        <select
          value={localMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          disabled={disabled}
          className={`flex-1 h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring ${borderClass}`}
        >
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={localYear}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={disabled}
          className={`w-28 h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring ${borderClass}`}
        >
          <option value="">Year</option>
          {YEARS.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

type FormState = Omit<Experience, 'id'>
const defaultForm: FormState = {
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  achievements: [],
}

export default function ExperienceStep() {
  const { resumeData, addExperience, updateExperience, deleteExperience } = useResumeStore()
  const experiences = resumeData.experience

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [newAchievement, setNewAchievement] = useState('')
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState('')

  const openAdd = () => {
    setEditId(null)
    setForm(defaultForm)
    setErrors({})
    setAiState('idle')
    setAiError('')
    setOpen(true)
  }

  const openEdit = (exp: Experience) => {
    setEditId(exp.id)
    setForm({
      company: exp.company,
      position: exp.position,
      location: exp.location ?? '',
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description,
      achievements: [...exp.achievements],
    })
    setErrors({})
    setAiState('idle')
    setAiError('')
    setOpen(true)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {}
    if (!form.company.trim()) e.company = 'Company is required'
    if (!form.position.trim()) e.position = 'Position is required'
    if (!form.startDate) e.startDate = 'Start date is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editId) updateExperience(editId, form)
    else addExperience(form)
    setOpen(false)
  }

  const addAchievement = () => {
    const text = newAchievement.trim()
    if (!text) return
    set('achievements', [...form.achievements, text])
    setNewAchievement('')
  }

  const removeAchievement = (i: number) => {
    set('achievements', form.achievements.filter((_, idx) => idx !== i))
  }

  const handleAiGenerate = async () => {
    setAiState('loading')
    setAiError('')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 35000)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'experience',
          context: JSON.stringify({
            position: form.position,
            company: form.company,
            description: form.description,
          }),
          resumeData: { experience: resumeData.experience },
        }),
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI generation failed')
      setAiResult(data.result)
      setAiState('result')
    } catch (err) {
      const msg = err instanceof Error && err.name === 'AbortError'
        ? 'Request timed out. Please try again.'
        : err instanceof Error ? err.message : 'Something went wrong'
      setAiError(msg)
      setAiState('idle')
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <div className="space-y-4">
      {experiences.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
          <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No experience added yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Add your work history to showcase your career progression</p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{exp.position}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CalendarDays className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(exp)} className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteExperience(exp.id)} className="h-7 w-7 p-0 text-gray-500 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={openAdd}
        className="w-full gap-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Company & Position */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Company <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Google" value={form.company} onChange={(e) => set('company', e.target.value)} className={errors.company ? 'border-red-400' : ''} />
                {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Position <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Software Engineer" value={form.position} onChange={(e) => set('position', e.target.value)} className={errors.position ? 'border-red-400' : ''} />
                {errors.position && <p className="text-xs text-red-500">{errors.position}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Location <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input placeholder="e.g. San Francisco, CA" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <DatePicker label="Start Date *" value={form.startDate} onChange={(v) => set('startDate', v)} error={errors.startDate} />
              <DatePicker label="End Date" value={form.endDate} onChange={(v) => set('endDate', v)} disabled={form.current} />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.current}
                onChange={(e) => { set('current', e.target.checked); if (e.target.checked) set('endDate', '') }}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Currently Working Here</span>
            </label>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleAiGenerate}
                  disabled={aiState === 'loading' || !form.position}
                  className="h-6 text-xs gap-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  {aiState === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                placeholder="Describe your role, responsibilities, and impact..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                className={`resize-none text-sm ${errors.description ? 'border-red-400' : ''}`}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              {aiError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1.5">{aiError}</p>}
            </div>

            {/* AI result */}
            {aiState === 'result' && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Suggestion
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{aiResult}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { set('description', aiResult); setAiState('idle') }} className="h-6 text-xs gap-1 bg-blue-600 hover:bg-blue-700">
                    <Check className="w-3 h-3" /> Use
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAiGenerate} className="h-6 text-xs gap-1">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Key Achievements <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <div className="space-y-1.5">
                {form.achievements.map((ach, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-sm mt-0.5">•</span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{ach}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Increased performance by 40%"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAchievement() } }}
                  className="text-sm"
                />
                <Button type="button" variant="outline" onClick={addAchievement} className="flex-shrink-0 gap-1 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              {editId ? 'Save Changes' : 'Add Experience'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
