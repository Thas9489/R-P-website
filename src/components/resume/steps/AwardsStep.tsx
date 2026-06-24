'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Trophy, CalendarDays } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Award } from '@/types'
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

function DatePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { month, year } = stringToMonthYear(value)
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</Label>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => onChange(monthYearToString(e.target.value, year))}
          className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => onChange(monthYearToString(month, e.target.value))}
          className="w-28 h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Year</option>
          {YEARS.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}

type FormState = Omit<Award, 'id'>
const defaultForm: FormState = { title: '', issuer: '', date: '', description: '' }

export default function AwardsStep() {
  const { resumeData, addAward, updateAward, deleteAward } = useResumeStore()
  const awards = resumeData.awards

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const openAdd = () => {
    setEditId(null)
    setForm(defaultForm)
    setErrors({})
    setOpen(true)
  }

  const openEdit = (award: Award) => {
    setEditId(award.id)
    setForm({
      title: award.title,
      issuer: award.issuer,
      date: award.date,
      description: award.description ?? '',
    })
    setErrors({})
    setOpen(true)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {}
    if (!form.title.trim()) e.title = 'Award title is required'
    if (!form.issuer.trim()) e.issuer = 'Issuer is required'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editId) updateAward(editId, form)
    else addAward(form)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {awards.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
          <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No awards added yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Honors and achievements set you apart from other candidates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {awards.map((award) => (
            <div key={award.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{award.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{award.issuer}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CalendarDays className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{formatDate(award.date)}</span>
                </div>
                {award.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{award.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(award)} className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteAward(award.id)} className="h-7 w-7 p-0 text-gray-500 hover:text-red-600">
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
        className="w-full gap-2 border-dashed border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
      >
        <Plus className="w-4 h-4" />
        Add Award
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Award' : 'Add Award'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Award Title <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Employee of the Year" value={form.title} onChange={(e) => set('title', e.target.value)} className={errors.title ? 'border-red-400' : ''} />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Issuer */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Issuer <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Google, MIT, Hackathon 2024" value={form.issuer} onChange={(e) => set('issuer', e.target.value)} className={errors.issuer ? 'border-red-400' : ''} />
              {errors.issuer && <p className="text-xs text-red-500">{errors.issuer}</p>}
            </div>

            {/* Date */}
            <DatePicker label="Date *" value={form.date} onChange={(v) => set('date', v)} />
            {errors.date && <p className="text-xs text-red-500 -mt-2">{errors.date}</p>}

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Brief description of this award and why it was given..."
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              {editId ? 'Save Changes' : 'Add Award'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
