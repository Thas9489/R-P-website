'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Mail, Phone, Building2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Reference } from '@/types'
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
import { cn } from '@/lib/utils'

type FormState = Omit<Reference, 'id'>
const defaultForm: FormState = {
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  relationship: '',
}

type ReferencesMode = 'include' | 'upon_request'

export default function ReferencesStep() {
  const { resumeData, addReference, updateReference, deleteReference } = useResumeStore()
  const references = resumeData.references

  const [mode, setMode] = useState<ReferencesMode>(references.length > 0 ? 'include' : 'upon_request')
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

  const openEdit = (ref: Reference) => {
    setEditId(ref.id)
    setForm({
      name: ref.name,
      title: ref.title,
      company: ref.company,
      email: ref.email ?? '',
      phone: ref.phone ?? '',
      relationship: ref.relationship,
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
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.company.trim()) e.company = 'Company is required'
    if (!form.relationship.trim()) e.relationship = 'Relationship is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editId) updateReference(editId, form)
    else addReference(form)
    setOpen(false)
  }

  const handleModeToggle = () => {
    setMode((prev) => (prev === 'include' ? 'upon_request' : 'include'))
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">References Section</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {mode === 'upon_request'
                ? 'Your resume will state "References available upon request"'
                : 'Your references will be listed on your resume'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleModeToggle}
            className="flex items-center gap-2.5 flex-shrink-0"
            title="Toggle references mode"
          >
            <span className={cn('text-xs font-medium transition-colors', mode === 'upon_request' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400')}>
              Upon Request
            </span>
            <div className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200 border-2',
              mode === 'include'
                ? 'bg-blue-600 border-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700',
            )}>
              <div className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                mode === 'include' ? 'translate-x-5' : 'translate-x-0.5',
              )} />
            </div>
            <span className={cn('text-xs font-medium transition-colors', mode === 'include' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400')}>
              Include
            </span>
          </button>
        </div>

        {mode === 'upon_request' && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              &ldquo;References available upon request.&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Reference list (only when mode is 'include') */}
      {mode === 'include' && (
        <div className="space-y-4">
          {references.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No references added yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">Add professional contacts who can vouch for your work</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {references.map((ref) => (
                <div key={ref.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 relative">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {ref.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{ref.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{ref.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{ref.company}</p>
                      </div>
                      <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {ref.relationship}
                      </span>
                      <div className="mt-2 space-y-1">
                        {ref.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <a href={`mailto:${ref.email}`} className="text-xs text-blue-500 hover:underline truncate">{ref.email}</a>
                          </div>
                        )}
                        {ref.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{ref.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-0.5">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(ref)} className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteReference(ref.id)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            onClick={openAdd}
            className="w-full gap-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            Add Reference
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Reference' : 'Add Reference'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Name & Job Title */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Jane Smith" value={form.name} onChange={(e) => set('name', e.target.value)} className={errors.name ? 'border-red-400' : ''} />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Job Title <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Engineering Manager" value={form.title} onChange={(e) => set('title', e.target.value)} className={errors.title ? 'border-red-400' : ''} />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Company <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Meta" value={form.company} onChange={(e) => set('company', e.target.value)} className={errors.company ? 'border-red-400' : ''} />
              {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
            </div>

            {/* Relationship */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Relationship <span className="text-red-500">*</span></Label>
              <select
                value={form.relationship}
                onChange={(e) => set('relationship', e.target.value)}
                className={cn(
                  'h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring',
                  errors.relationship ? 'border-red-400' : '',
                )}
              >
                <option value="">Select relationship...</option>
                <option value="Direct Manager">Direct Manager</option>
                <option value="Former Manager">Former Manager</option>
                <option value="Colleague">Colleague</option>
                <option value="Mentor">Mentor</option>
                <option value="Client">Client</option>
                <option value="Professor">Professor</option>
                <option value="Peer">Peer</option>
                <option value="Other">Other</option>
              </select>
              {errors.relationship && <p className="text-xs text-red-500">{errors.relationship}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-3 h-3 inline mr-1" />Email <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input type="email" placeholder="jane@example.com" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="w-3 h-3 inline mr-1" />Phone <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input type="tel" placeholder="+1 (555) 000-0000" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} className="text-sm" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editId ? 'Save Changes' : 'Add Reference'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
