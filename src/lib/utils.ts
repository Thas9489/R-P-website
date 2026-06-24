import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM yyyy')
}

export function formatFullDate(date: string | Date): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMMM d, yyyy')
}

export function timeAgo(date: string | Date): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50)
}

export function truncate(text: string, length: number): string {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function formatCredits(amount: number): string {
  return `${amount} credit${amount === 1 ? '' : 's'}`
}

export function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
  return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
}

export function resumeCompletionScore(data: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalInfo?: any
  summary?: string
  education?: unknown[]
  experience?: unknown[]
  projects?: unknown[]
  skills?: unknown[]
}): number {
  let score = 0
  const weights = { personalInfo: 30, summary: 20, experience: 25, education: 15, skills: 10 }

  if (data.personalInfo) {
    const fields = Object.values(data.personalInfo).filter(Boolean)
    score += Math.min(weights.personalInfo, (fields.length / 6) * weights.personalInfo)
  }
  if (data.summary && data.summary.length > 50) score += weights.summary
  if (data.experience && data.experience.length > 0) score += weights.experience
  if (data.education && data.education.length > 0) score += weights.education
  if (data.skills && data.skills.length >= 3) score += weights.skills

  return Math.round(Math.min(100, score))
}
