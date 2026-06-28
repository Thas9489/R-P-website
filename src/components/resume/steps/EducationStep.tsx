'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, GraduationCap, CalendarDays } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Education } from '@/types'
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
const YEARS = Array.from({ length: 60 }, (_, i) => String(currentYear - i))

function monthYearToString(month: string, year: string): string {
  if (!month || !year) return ''
  const monthIdx = MONTHS.indexOf(month) + 1
  return `${year}-${String(monthIdx).padStart(2, '0')}`
}

function stringToMonthYear(value: string): { month: string; year: string } {
  if (!value) return { month: '', year: '' }
  const [year, m] = value.split('-')
  const month = MONTHS[parseInt(m, 10) - 1] ?? ''
  return { month, year: year ?? '' }
}

type FormState = Omit<Education, 'id'>

const defaultForm: FormState = {
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  current: false,
  gpa: '',
  description: '',
}

interface DatePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

function DatePicker({ label, value, onChange, disabled, error }: DatePickerProps) {
  const { month, year } = stringToMonthYear(value)
  const borderClass = error ? 'border-red-400 focus:ring-red-400' : 'border-input'
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</Label>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => onChange(monthYearToString(e.target.value, year))}
          disabled={disabled}
          className={`flex-1 h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring ${borderClass}`}
        >
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => onChange(monthYearToString(month, e.target.value))}
          disabled={disabled}
          className={`w-28 h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring ${borderClass}`}
        >
          <option value="">Year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function EducationStep() {
  const { resumeData, addEducation, updateEducation, deleteEducation } = useResumeStore()
  const education = resumeData.education

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const openAddDialog = () => {
    setEditId(null)
    setForm(defaultForm)
    setErrors({})
    setOpen(true)
  }

  const openEditDialog = (edu: Education) => {
    setEditId(edu.id)
    setForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: edu.current,
      gpa: edu.gpa ?? '',
      description: edu.description ?? '',
    })
    setErrors({})
    setOpen(true)
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.institution.trim()) newErrors.institution = 'Institution is required'
    if (!form.degree.trim()) newErrors.degree = 'Degree is required'
    if (!form.field.trim()) newErrors.field = 'Field of study is required'
    if (!form.startDate) newErrors.startDate = 'Start date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editId) {
      updateEducation(editId, form)
    } else {
      addEducation(form)
    }
    setOpen(false)
  }

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const { month, year } = stringToMonthYear(date)
    return month && year ? `${month.slice(0, 3)} ${year}` : ''
  }

  return (
    <div className="space-y-4">
      {/* Education cards */}
      {education.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
          <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No education added yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Add your academic background to strengthen your resume</p>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {edu.institution}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CalendarDays className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {formatDate(edu.startDate)} – {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </span>
                  {edu.gpa && (
                    <span className="text-xs text-gray-400 ml-2">GPA: {edu.gpa}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditDialog(edu)}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteEducation(edu.id)}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={openAddDialog}
        className="w-full gap-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Education' : 'Add Education'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Institution */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Institution <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Massachusetts Institute of Technology"
                value={form.institution}
                onChange={(e) => set('institution', e.target.value)}
                className={errors.institution ? 'border-red-400' : ''}
              />
              {errors.institution && <p className="text-xs text-red-500">{errors.institution}</p>}
            </div>

            {/* Degree & Field */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Degree <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Bachelor of Science"
                  value={form.degree}
                  onChange={(e) => set('degree', e.target.value)}
                  className={errors.degree ? 'border-red-400' : ''}
                />
                {errors.degree && <p className="text-xs text-red-500">{errors.degree}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Field of Study <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Computer Science"
                  value={form.field}
                  onChange={(e) => set('field', e.target.value)}
                  className={errors.field ? 'border-red-400' : ''}
                />
                {errors.field && <p className="text-xs text-red-500">{errors.field}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                label="Start Date *"
                value={form.startDate}
                onChange={(v) => set('startDate', v)}
                error={errors.startDate}
              />
              <DatePicker
                label="End Date"
                value={form.endDate}
                onChange={(v) => set('endDate', v)}
                disabled={form.current}
              />
            </div>

            {/* Currently enrolled */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.current}
                onChange={(e) => {
                  set('current', e.target.checked)
                  if (e.target.checked) set('endDate', '')
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Currently Enrolled</span>
            </label>

            {/* GPA */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                GPA <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. 3.8 / 4.0"
                value={form.gpa}
                onChange={(e) => set('gpa', e.target.value)}
                className="w-40"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                placeholder="Relevant coursework, honors, activities, thesis..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editId ? 'Save Changes' : 'Add Education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
