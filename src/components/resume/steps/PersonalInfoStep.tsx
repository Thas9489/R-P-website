'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, User2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldConfig {
  key: keyof NonNullable<ReturnType<typeof useResumeStore.getState>['resumeData']['personalInfo']>
  label: string
  placeholder: string
  type?: string
  required?: boolean
  colSpan?: 'full' | 'half'
}

const FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Full Name', placeholder: 'e.g. Alex Johnson', required: true, colSpan: 'half' },
  { key: 'title', label: 'Job Title', placeholder: 'e.g. Senior Software Engineer', required: true, colSpan: 'half' },
  { key: 'email', label: 'Email Address', placeholder: 'alex@example.com', type: 'email', required: true, colSpan: 'half' },
  { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, colSpan: 'half' },
  { key: 'location', label: 'Location', placeholder: 'City, State, Country', required: true, colSpan: 'half' },
  { key: 'website', label: 'Website URL', placeholder: 'https://yourwebsite.com', type: 'url', colSpan: 'half' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/username', type: 'url', colSpan: 'full' },
  { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/username', type: 'url', colSpan: 'full' },
  { key: 'twitter', label: 'Twitter / X URL', placeholder: 'https://x.com/username', type: 'url', colSpan: 'full' },
]

function validateField(key: string, value: string): string | null {
  if (!value) return null
  if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address'
  if ((key === 'website' || key === 'linkedin' || key === 'github' || key === 'twitter') && value) {
    try { new URL(value) } catch { return 'Enter a valid URL (include https://)' }
  }
  return null
}

export default function PersonalInfoStep() {
  const { resumeData, setPersonalInfo } = useResumeStore()
  const { personalInfo } = resumeData
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (key: string, value: string) => {
    setPersonalInfo({ [key]: value })
  }

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setPersonalInfo({ profileImage: data.url })
    } catch (err) {
      console.error('Image upload failed:', err)
    } finally {
      setImageLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getFieldError = (key: string, value: string, required?: boolean): string | null => {
    if (!touched[key]) return null
    if (required && !value.trim()) return `${FIELDS.find(f => f.key === key)?.label} is required`
    return validateField(key, value)
  }

  const isFieldValid = (key: string, value: string, required?: boolean): boolean => {
    if (!touched[key] || !value) return false
    if (required && !value.trim()) return false
    return !validateField(key, value)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      {/* Profile image upload */}
      <div className="flex items-start gap-5 mb-7 pb-7 border-b border-gray-100 dark:border-gray-800">
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageLoading}
            className={cn(
              'relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed transition-all duration-200',
              'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'group bg-gray-50 dark:bg-gray-800',
            )}
          >
            {imageLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : personalInfo.profileImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <User2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <Camera className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <div className="pt-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile Photo</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Optional. Recommended size: 400x400px.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageLoading}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50"
          >
            {personalInfo.profileImage ? 'Change photo' : 'Upload photo'}
          </button>
          {personalInfo.profileImage && (
            <button
              type="button"
              onClick={() => setPersonalInfo({ profileImage: '' })}
              className="ml-3 text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FIELDS.map((field) => {
          const value = (personalInfo[field.key] as string) ?? ''
          const error = getFieldError(field.key, value, field.required)
          const valid = isFieldValid(field.key, value, field.required)

          return (
            <div
              key={field.key}
              className={cn(
                'flex flex-col gap-1.5',
                field.colSpan === 'full' ? 'sm:col-span-2' : '',
              )}
            >
              <Label
                htmlFor={field.key}
                className={cn(
                  'text-xs font-medium',
                  error
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300',
                )}
              >
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-0.5">*</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id={field.key}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  className={cn(
                    'h-9 text-sm pr-8',
                    error
                      ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-600'
                      : valid
                      ? 'border-green-400 focus-visible:ring-green-400 dark:border-green-600'
                      : '',
                  )}
                />
                {touched[field.key] && value && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {error ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : valid ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {error && (
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
