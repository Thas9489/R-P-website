import { NextRequest, NextResponse } from 'next/server'
import type { Job, JobType } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

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

interface MuseJob {
  id: number
  name: string
  publication_date: string
  refs: { landing_page: string }
  contents: string
  categories: { name: string }[]
  levels: { name: string }[]
  company: { name: string }
  locations: { name: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toJobType(raw?: string): JobType {
  if (!raw) return 'full-time'
  const s = raw.toLowerCase().replace(/[_-]/g, ' ')
  if (s.includes('contract')) return 'contract'
  if (s.includes('part'))     return 'part-time'
  if (s.includes('intern'))   return 'internship'
  if (s.includes('remote'))   return 'remote'
  return 'full-time'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

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

function mapMuse(j: MuseJob): Job {
  const loc = j.locations?.[0]?.name || 'Not specified'
  const isRemote = loc === 'Remote' || loc === 'Flexible / Remote'
  return {
    id: `muse-${j.id}`,
    title: j.name,
    company: j.company.name,
    location: loc,
    type: 'full-time',
    salary: undefined,
    description: stripHtml(j.contents || ''),
    requirements: [],
    url: j.refs.landing_page,
    source: 'The Muse',
    logo: '',
    remote: isRemote,
    postedAt: j.publication_date,
    tags: j.categories?.map((c) => c.name) ?? [],
  }
}

// ─── City name normalizer ──────────────────────────────────────────────────────
// Maps user shorthand to the exact city string The Muse API expects

const CITY_MAP: Record<string, string> = {
  'new york':        'New York, NY',
  'new york city':   'New York, NY',
  'nyc':             'New York, NY',
  'san francisco':   'San Francisco, CA',
  'sf':              'San Francisco, CA',
  'los angeles':     'Los Angeles, CA',
  'la':              'Los Angeles, CA',
  'chicago':         'Chicago, IL',
  'boston':          'Boston, MA',
  'seattle':         'Seattle, WA',
  'austin':          'Austin, TX',
  'denver':          'Denver, CO',
  'atlanta':         'Atlanta, GA',
  'dallas':          'Dallas, TX',
  'houston':         'Houston, TX',
  'miami':           'Miami, FL',
  'washington':      'Washington, DC',
  'washington dc':   'Washington, DC',
  'dc':              'Washington, DC',
  'portland':        'Portland, OR',
  'phoenix':         'Phoenix, AZ',
  'minneapolis':     'Minneapolis, MN',
  'philadelphia':    'Philadelphia, PA',
  'nashville':       'Nashville, TN',
  'charlotte':       'Charlotte, NC',
  'raleigh':         'Raleigh, NC',
  'san diego':       'San Diego, CA',
  'detroit':         'Detroit, MI',
  'san jose':        'San Jose, CA',
  'brooklyn':        'New York, NY',
  'london':          'London, UK',
  'toronto':         'Toronto, Canada',
  'remote':          'Remote',
}

function normalizeCity(input: string): string {
  return CITY_MAP[input.toLowerCase().trim()] ?? input
}

// ─── API fetchers ─────────────────────────────────────────────────────────────

async function fetchRemotive(keyword: string): Promise<Job[]> {
  const qs = new URLSearchParams({ limit: '50' })
  if (keyword) qs.set('search', keyword)
  const res = await fetch(`https://remotive.com/api/remote-jobs?${qs}`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Remotive ${res.status}`)
  const data = await res.json()
  return ((data.jobs as RemotiveJob[]) ?? []).map(mapRemotive)
}

async function fetchArbeitnow(keyword: string, page: number): Promise<Job[]> {
  const qs = new URLSearchParams({ page: String(page) })
  if (keyword) qs.set('search', keyword)
  const res = await fetch(`https://arbeitnow.com/api/job-board-api?${qs}`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Arbeitnow ${res.status}`)
  const data = await res.json()
  return ((data.data as ArbeitnowJob[]) ?? []).map(mapArbeitnow)
}

// Map keyword to The Muse category (exact names from their API)
function inferMuseCategory(keyword: string): string | null {
  const kw = keyword.toLowerCase()
  if (/engineer|developer|software|backend|frontend|fullstack|devops|cloud|ios|android|mobile|sre/.test(kw)) return 'Software Engineering'
  if (/data|analytic|scientist|machine learning|\bai\b|\bml\b|deep learning/.test(kw)) return 'Data Science'
  if (/design|ux\b|ui\b|figma|user experience/.test(kw)) return 'Design and UX'
  if (/product manager|\bpm\b/.test(kw)) return 'Product'
  if (/marketing|seo|content|social media/.test(kw)) return 'Advertising and Marketing'
  if (/sales|account executive|business development/.test(kw)) return 'Sales'
  if (/finance|accounting|financial/.test(kw)) return 'Finance'
  if (/hr\b|human resources|recruit|talent/.test(kw)) return 'Human Resources and Recruitment'
  return null
}

async function fetchMuse(keyword: string, location: string): Promise<Job[]> {
  const city = location ? normalizeCity(location) : ''
  const category = keyword ? inferMuseCategory(keyword) : null

  // Fetch 5 pages in parallel — each page has 20 jobs, giving 100 to filter from
  const pages = await Promise.allSettled(
    [0, 1, 2, 3, 4].map((p) => {
      const qs = new URLSearchParams({ page: String(p) })
      if (city)     qs.set('location', city)
      if (category) qs.set('category', category)
      return fetch(`https://www.themuse.com/api/public/jobs?${qs}`, { next: { revalidate: 300 } })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => ((data.results as MuseJob[]) ?? []).map(mapMuse))
    })
  )

  let jobs: Job[] = []
  for (const r of pages) {
    if (r.status === 'fulfilled') jobs = [...jobs, ...r.value]
  }

  // Filter by keyword client-side
  if (keyword) {
    const kw = keyword.toLowerCase()
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw) ||
        j.tags?.some((t) => t.toLowerCase().includes(kw))
    )
  }
  return jobs
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_JOBS: Job[] = [
  {
    id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'San Francisco, CA',
    type: 'full-time', salary: '$120k – $160k', remote: false,
    description: 'We are looking for a Senior Frontend Developer to join our growing team.',
    requirements: ['5+ years React', 'TypeScript', 'Next.js'],
    url: '#', source: 'Demo', logo: '', postedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['React'],
  },
  {
    id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'New York, NY',
    type: 'full-time', salary: '$100k – $140k', remote: false,
    description: 'Join our fast-growing startup as a Full Stack Engineer.',
    requirements: ['Node.js', 'React', 'PostgreSQL'],
    url: '#', source: 'Demo', logo: '', postedAt: new Date(Date.now() - 172800000).toISOString(), tags: ['Node.js'],
  },
  {
    id: '3', title: 'Backend Engineer', company: 'CloudSystems', location: 'Remote',
    type: 'remote', salary: '$130k – $170k', remote: true,
    description: 'We are building distributed systems at scale.',
    requirements: ['Go or Python', 'Kubernetes'],
    url: '#', source: 'Demo', logo: '', postedAt: new Date(Date.now() - 259200000).toISOString(), tags: ['Go'],
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

  const hasLocation = location.trim().length > 0

  try {
    // When location is given: use The Muse (city-based) + Arbeitnow
    // When no location: use Remotive + Arbeitnow (remote-focused boards)
    const fetchers = hasLocation
      ? [fetchMuse(keyword, location), fetchArbeitnow(keyword, page)]
      : [fetchRemotive(keyword), fetchArbeitnow(keyword, page), fetchMuse(keyword, '')]

    const results = await Promise.allSettled(fetchers)

    let jobs: Job[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') jobs = [...jobs, ...r.value]
    }

    if (jobs.length === 0) throw new Error('No results from live APIs')

    // Deduplicate by title + company
    const seen = new Set<string>()
    jobs = jobs.filter((j) => {
      const key = `${j.title}|${j.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // ── Location filter (strict — only match jobs in that city) ─────────────
    if (hasLocation) {
      const loc = location.toLowerCase()
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc))
    }

    // ── Other filters ────────────────────────────────────────────────────────
    if (type !== 'all') jobs = jobs.filter((j) => j.type === type)
    if (remote)         jobs = jobs.filter((j) => j.remote)

    // ── Match score ──────────────────────────────────────────────────────────
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

    return NextResponse.json({ jobs: paged, total, page, hasMore: page * limit < total })
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
  if (hasLocation) {
    const loc = location.toLowerCase()
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc))
  }
  if (type !== 'all') jobs = jobs.filter((j) => j.type === type)
  if (remote)         jobs = jobs.filter((j) => j.remote)

  jobs = jobs.map((j) => ({ ...j, matchScore: Math.floor(Math.random() * 40) + 60 }))
  const total = jobs.length
  const paged = jobs.slice((page - 1) * limit, page * limit)
  return NextResponse.json({ jobs: paged, total, page, hasMore: false })
}
