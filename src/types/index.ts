// ─── Personal Info ────────────────────────────────────────────────────────────
export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  profileImage?: string
  summary?: string
}

// ─── Education ────────────────────────────────────────────────────────────────
export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
  description?: string
  gpa?: string
}

// ─── Experience ───────────────────────────────────────────────────────────────
export interface Experience {
  id: string
  company: string
  position: string
  location?: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  achievements: string[]
}

// ─── Project ──────────────────────────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  github?: string
  image?: string
  featured: boolean
}

// ─── Skill ────────────────────────────────────────────────────────────────────
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface Skill {
  name: string
  level: SkillLevel
  category?: string
}

// ─── Certification ────────────────────────────────────────────────────────────
export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  expiry?: string
  url?: string
  credentialId?: string
}

// ─── Award ────────────────────────────────────────────────────────────────────
export interface Award {
  id: string
  title: string
  issuer: string
  date: string
  description?: string
}

// ─── Reference ────────────────────────────────────────────────────────────────
export interface Reference {
  id: string
  name: string
  title: string
  company: string
  email?: string
  phone?: string
  relationship: string
}

// ─── Resume Data ──────────────────────────────────────────────────────────────
export interface ResumeData {
  personalInfo: PersonalInfo
  summary: string
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: Skill[]
  certifications: Certification[]
  awards: Award[]
  references: Reference[]
}

// ─── Resume Template ──────────────────────────────────────────────────────────
export type ResumeTemplate = 'modern' | 'minimal' | 'creative' | 'developer' | 'executive'

export interface Resume {
  id: string
  title: string
  template: ResumeTemplate
  data: ResumeData
  userId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
export type PortfolioTheme = 'modern' | 'minimal' | 'developer' | 'creative'

export interface Portfolio {
  id: string
  userId: string
  resumeId: string
  theme: PortfolioTheme
  slug: string
  isPublic: boolean
  views: number
  createdAt: string
  updatedAt: string
  resume?: Resume
}

// ─── Job ──────────────────────────────────────────────────────────────────────
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: JobType
  salary?: string
  description: string
  requirements: string[]
  url: string
  source: string
  logo?: string
  remote: boolean
  postedAt: string
  matchScore?: number
  tags?: string[]
}

export interface SavedJob {
  id: string
  userId: string
  jobData: Job
  savedAt: string
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  image?: string
  username: string
  credits: number
  createdAt: string
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export type AIGenerateType = 'summary' | 'experience' | 'project' | 'skills' | 'improve' | 'ats'

export interface AIGenerateRequest {
  type: AIGenerateType
  context: string
  resumeData?: Partial<ResumeData>
  jobDescription?: string
}

export interface AIGenerateResponse {
  result: string
  creditsUsed: number
  creditsRemaining: number
}

export interface ATSAnalysis {
  score: number
  keywords: {
    found: string[]
    missing: string[]
  }
  suggestions: string[]
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ─── Job Search ───────────────────────────────────────────────────────────────
export interface JobSearchParams {
  keyword?: string
  location?: string
  type?: JobType | 'all'
  remote?: boolean
  page?: number
  limit?: number
}

export interface JobSearchResult {
  jobs: Job[]
  total: number
  page: number
  hasMore: boolean
}
