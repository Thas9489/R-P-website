import { NextRequest, NextResponse } from 'next/server'
import type { Job, JobType } from '@/types'

// ─── Remotive types ────────────────────────────────────────────────────────────
interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  category: string
  job_type: string
  publication_date: string
  salary: string
  description: string
  company_logo?: string
  location: string
}

// ─── Arbeitnow types ──────────────────────────────────────────────────────────
interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string
  tags: string[]
  job_types: string[]
  url: string
  created_at: number
  location: string
  remote: boolean
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toJobType(raw?: string): JobType {
  if (!raw) return 'full-time'
  const s = raw.toLowerCase().replace(/[_-]/g, ' ')
  if (s.includes('contract')) return 'contract'
  if (s.includes('part')) return 'part-time'
  if (s.includes('intern')) return 'internship'
  if (s.includes('remote')) return 'remote'
  return 'full-time'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
}

function mapRemotive(j: RemotiveJob): Job {
  return {
    id: `rm-${j.id}`,
    title: j.title,
    company: j.company_name,
    location: j.location || 'Remote',
    type: toJobType(j.job_type),
    salary: j.salary || undefined,
    description: stripHtml(j.description),
    requirements: [],
    url: j.url,
    source: 'Remotive',
    logo: j.company_logo || '',
    remote: true,
    postedAt: j.publication_date,
    tags: j.category ? [j.category] : [],
  }
}

function mapArbeitnow(j: ArbeitnowJob): Job {
  return {
    id: `an-${j.slug}`,
    title: j.title,
    company: j.company_name,
    location: j.remote ? 'Remote' : (j.location || 'Not specified'),
    type: toJobType(j.job_types?.[0]),
    salary: undefined,
    description: stripHtml(j.description),
    requirements: [],
    url: j.url,
    source: 'Arbeitnow',
    logo: '',
    remote: j.remote,
    postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
    tags: j.tags ?? [],
  }
}

// ─── API fetchers ─────────────────────────────────────────────────────────────

async function fetchRemotive(keyword: string): Promise<Job[]> {
  const qs = new URLSearchParams({ limit: '50' })
  if (keyword) qs.set('search', keyword)
  const res = await fetch(`https://remotive.com/api/remote-jobs?${qs}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Remotive ${res.status}`)
  const data = await res.json()
  return ((data.jobs as RemotiveJob[]) ?? []).map(mapRemotive)
}

async function fetchArbeitnow(keyword: string, page: number): Promise<Job[]> {
  const qs = new URLSearchParams({ page: String(page) })
  if (keyword) qs.set('search', keyword)
  const res = await fetch(`https://arbeitnow.com/api/job-board-api?${qs}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Arbeitnow ${res.status}`)
  const data = await res.json()
  return ((data.data as ArbeitnowJob[]) ?? []).map(mapArbeitnow)
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_JOBS: Job[] = [
  {
    id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'San Francisco, CA',
    type: 'full-time', salary: '$120k – $160k', remote: true,
    description: 'We are looking for a Senior Frontend Developer to join our growing team, building next-generation web applications using React and TypeScript.',
    requirements: ['5+ years React', 'TypeScript', 'Next.js'],
    url: '#', source: 'Demo', logo: '', postedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['React', 'TypeScript'],
  },
  {
    id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'New York, NY',
    type: 'full-time', salary: '$100k – $140k', remote: false,
    description: 'Join our fast-growing startup as a Full Stack Engineer. Work across the entire stack using Node.js, React, and PostgreSQL.',
    requirements: ['Node.js', 'React', 'PostgreSQL'],
    url: '#', source: 'Demo', logo: '', postedAt: new Date(Date.now() - 172800000).toISOString(), tags: ['Node.js', 'React'],
  },
  {
    id: '3', title: 'Backend Engineer', company: 'CloudSystems', location: 'Remote',
    type: 'remote', salary: '$130k – $170k', remote: true,
    description: 'We are building distributed systems at scale. Looking for an experienced backend developer.',
    requirements: ['Go or Python', 'Kubernetes', 'Microservices'],
    url: '#', source: 'Demo', logo: '', postedAt: new Date(Date.now() - 259200000).toISOString(), tags: ['Go', 'Kubernetes'],
  },
]

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword  = searchParams.get('keyword')  || ''
  const location = searchParams.get('location') || ''
  const type     = searchParams.get('type')     || 'all'
  const remote   = searchParams.get('remote')   === 'true'
  const page     = Math.max(1, parseInt(searchParams.get('page')  || '1'))
  const limit    = Math.min(20, parseInt(searchParams.get('limit') || '20'))

  // ── Try live APIs (no key needed) ─────────────────────────────────────────
  try {
    const [remResult, anResult] = await Promise.allSettled([
      fetchRemotive(keyword),
      fetchArbeitnow(keyword, page),
    ])

    let jobs: Job[] = []
    if (remResult.status === 'fulfilled') jobs = [...jobs, ...remResult.value]
    if (anResult.status  === 'fulfilled') jobs = [...jobs, ...anResult.value]

    if (jobs.length === 0) throw new Error('No results from live APIs')

    // Deduplicate by title + company
    const seen = new Set<string>()
    jobs = jobs.filter((j) => {
      const key = `${j.title}|${j.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Location filter — include remote jobs + matching location text
    if (location) {
      const loc = location.toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.remote ||
          j.location.toLowerCase().includes(loc)
      )
    }

    // Type filter
    if (type !== 'all') jobs = jobs.filter((j) => j.type === type)
    if (remote)         jobs = jobs.filter((j) => j.remote)

    // Match score: boost jobs whose title contains the keyword
    const kw = keyword.toLowerCase()
    jobs = jobs.map((j) => ({
      ...j,
      matchScore:
        kw && j.title.toLowerCase().includes(kw)
          ? Math.floor(Math.random() * 15) + 85
          : Math.floor(Math.random() * 30) + 60,
    }))
    jobs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))

    const total = jobs.length
    const paged = jobs.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      jobs: paged,
      total,
      page,
      hasMore: page * limit < total,
    })
  } catch (err) {
    console.error('[JOBS] live APIs failed, using mock', err)
  }

  // ── Mock fallback ─────────────────────────────────────────────────────────
  let jobs = [...MOCK_JOBS]
  if (keyword) {
    const kw = keyword.toLowerCase()
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        j.tags?.some((t) => t.toLowerCase().includes(kw))
    )
  }
  if (location) {
    const loc = location.toLowerCase()
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc) || j.remote)
  }
  if (type !== 'all') jobs = jobs.filter((j) => j.type === type)
  if (remote)         jobs = jobs.filter((j) => j.remote)

  jobs = jobs.map((j) => ({ ...j, matchScore: Math.floor(Math.random() * 40) + 60 }))
  const total = jobs.length
  const paged = jobs.slice((page - 1) * limit, page * limit)

  return NextResponse.json({ jobs: paged, total, page, hasMore: false })
}
