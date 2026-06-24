'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Award, ExternalLink, CalendarDays } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Certification } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
const YEARS = Array.from({ length: 30 }, (_, i) => String(currentYear - i + 5))

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

type FormState = Omit<Certification, 'id'>
const defaultForm: FormState = {
  name: '',
  issuer: '',
  date: '',
  expiry: '',
  url: '',
  credentialId: '',
}

export default function CertificationsStep() {
  const { resumeData, addCertification, updateCertification, deleteCertification } = useResumeStore()
  const certifications = resumeData.certifications

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

  const openEdit = (cert: Certification) => {
    setEditId(cert.id)
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      expiry: cert.expiry ?? '',
      url: cert.url ?? '',
      credentialId: cert.credentialId ?? '',
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
    if (!form.name.trim()) e.name = 'Certification name is required'
    if (!form.issuer.trim()) e.issuer = 'Issuing organization is required'
    if (!form.date) e.date = 'Issue date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editId) updateCertification(editId, form)
    else addCertification(form)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {certifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
          <Award className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No certifications added yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Certifications validate your expertise and build trust with employers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{cert.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Issued {formatDate(cert.date)}</span>
                  </div>
                  {cert.expiry && (
                    <span className="text-xs text-gray-400">Expires {formatDate(cert.expiry)}</span>
                  )}
                  {cert.credentialId && (
                    <span className="text-xs text-gray-400 font-mono">ID: {cert.credentialId}</span>
                  )}
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(cert)} className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteCertification(cert.id)} className="h-7 w-7 p-0 text-gray-500 hover:text-red-600">
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
        className="w-full gap-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
      >
        <Plus className="w-4 h-4" />
        Add Certification
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Certification Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. AWS Solutions Architect – Associate" value={form.name} onChange={(e) => set('name', e.target.value)} className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Issuer */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Issuing Organization <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Amazon Web Services" value={form.issuer} onChange={(e) => set('issuer', e.target.value)} className={errors.issuer ? 'border-red-400' : ''} />
              {errors.issuer && <p className="text-xs text-red-500">{errors.issuer}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <DatePicker label="Issue Date *" value={form.date} onChange={(v) => set('date', v)} />
              <DatePicker label="Expiry Date (optional)" value={form.expiry ?? ''} onChange={(v) => set('expiry', v)} />
            </div>
            {errors.date && <p className="text-xs text-red-500 -mt-2">{errors.date}</p>}

            {/* Credential URL */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Credential URL <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input placeholder="https://www.credly.com/badges/..." value={form.url ?? ''} onChange={(e) => set('url', e.target.value)} className="text-sm" />
            </div>

            {/* Credential ID */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Credential ID <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input placeholder="e.g. ABC123XYZ" value={form.credentialId ?? ''} onChange={(e) => set('credentialId', e.target.value)} className="text-sm font-mono" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">
              {editId ? 'Save Changes' : 'Add Certification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
