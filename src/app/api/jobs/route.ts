import { NextRequest, NextResponse } from 'next/server'
import type { Job, JobType } from '@/types'

interface AdzunaJob {
  id: string
  title: string
  company?: { display_name: string }
  location?: { display_name: string; area: string[] }
  category?: { label: string; tag: string }
  description?: string
  redirect_url?: string
  contract_type?: string
  contract_time?: string
  salary_min?: number
  salary_max?: number
  created?: string
}

function mapJobType(contractType?: string, contractTime?: string): JobType {
  if (contractType === 'contract') return 'contract'
  if (contractTime === 'part_time') return 'part-time'
  return 'full-time'
}

function mapAdzunaJob(item: AdzunaJob): Job {
  const salaryStr =
    item.salary_min && item.salary_max
      ? `$${Math.round(item.salary_min / 1000)}k – $${Math.round(item.salary_max / 1000)}k`
      : item.salary_min
      ? `From $${Math.round(item.salary_min / 1000)}k`
      : undefined

  const location = item.location?.display_name || ''
  const isRemote =
    location.toLowerCase().includes('remote') ||
    item.title.toLowerCase().includes('remote')

  const description = item.description?.replace(/<[^>]+>/g, '').slice(0, 600) || ''

  return {
    id: item.id,
    title: item.title,
    company: item.company?.display_name || 'Unknown',
    location: location || 'Location not specified',
    type: mapJobType(item.contract_type, item.contract_time),
    salary: salaryStr,
    description,
    requirements: [],
    url: item.redirect_url || '#',
    source: 'Adzuna',
    logo: '',
    remote: isRemote,
    postedAt: item.created || new Date().toISOString(),
    tags: item.category?.label ? [item.category.label] : [],
  }
}

// ─── Fallback mock data (used when API key is not configured) ─────────────────

const MOCK_JOBS: Job[] = [
  {
    id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'San Francisco, CA',
    type: 'full-time', salary: '$120k – $160k', remote: true,
    description: 'We are looking for a Senior Frontend Developer to join our growing team. You will work on building next-generation web applications using React and TypeScript.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Next.js experience'],
    url: '#', source: 'Mock', logo: '', postedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['React', 'TypeScript', 'Next.js'],
  },
  {
    id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'New York, NY',
    type: 'full-time', salary: '$100k – $140k', remote: false,
    description: 'Join our fast-growing startup as a Full Stack Engineer. Work across the entire stack using Node.js, React, and PostgreSQL.',
    requirements: ['Node.js', 'React', 'PostgreSQL', 'AWS experience'],
    url: '#', source: 'Mock', logo: '', postedAt: new Date(Date.now() - 172800000).toISOString(), tags: ['Node.js', 'React', 'PostgreSQL'],
  },
  {
    id: '3', title: 'Backend Engineer (Go)', company: 'CloudSystems', location: 'Remote',
    type: 'remote', salary: '$130k – $170k', remote: true,
    description: 'We are building distributed systems at scale. Looking for an experienced Go developer.',
    requirements: ['Go/Golang 3+ years', 'Kubernetes', 'Microservices'],
    url: '#', source: 'Mock', logo: '', postedAt: new Date(Date.now() - 259200000).toISOString(), tags: ['Go', 'Kubernetes', 'Cloud'],
  },
  {
    id: '4', title: 'DevOps Engineer', company: 'InfraScale', location: 'Austin, TX',
    type: 'full-time', salary: '$110k – $150k', remote: true,
    description: 'Join our DevOps team and help us build reliable, scalable infrastructure using AWS and Terraform.',
    requirements: ['AWS', 'Terraform', 'Docker', 'CI/CD'],
    url: '#', source: 'Mock', logo: '', postedAt: new Date(Date.now() - 345600000).toISOString(), tags: ['AWS', 'DevOps', 'Terraform'],
  },
  {
    id: '5', title: 'Data Scientist', company: 'AI Research Co', location: 'Seattle, WA',
    type: 'full-time', salary: '$140k – $180k', remote: false,
    description: 'Apply ML/DL techniques to solve complex business problems. Work with large-scale datasets.',
    requirements: ['Python', 'PyTorch/TensorFlow', 'SQL', 'Statistics'],
    url: '#', source: 'Mock', logo: '', postedAt: new Date(Date.now() - 432000000).toISOString(), tags: ['Python', 'ML', 'Data Science'],
  },
  {
    id: '6', title: 'Mobile Developer (React Native)', company: 'AppWorks', location: 'Remote',
    type: 'remote', salary: '$90k – $130k', remote: true,
    description: 'Build cross-platform mobile apps using React Native. Work closely with design and product teams.',
    requirements: ['React Native', 'iOS/Android', 'TypeScript', 'REST APIs'],
    url: '#', source: 'Mock', logo: '', postedAt: new Date(Date.now() - 518400000).toISOString(), tags: ['React Native', 'Mobile', 'TypeScript'],
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''
  const type = searchParams.get('type') || 'all'
  const remote = searchParams.get('remote') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  const country = (process.env.ADZUNA_COUNTRY || 'us').toLowerCase()

  // ── Live Adzuna search ──────────────────────────────────────────────────────
  if (appId && appKey) {
    try {
      const qs = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: String(limit),
        content_type: 'application/json',
      })
      if (keyword) qs.set('what', keyword)
      if (location) qs.set('where', location)
      if (remote || type === 'remote') {
        qs.set('what_and', keyword ? `${keyword} remote` : 'remote')
      }

      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${qs}`
      const res = await fetch(url, { next: { revalidate: 300 } })

      if (!res.ok) {
        const text = await res.text()
        console.error('[JOBS] Adzuna error', res.status, text)
        throw new Error(`Adzuna ${res.status}`)
      }

      const data = await res.json()
      let jobs = ((data.results as AdzunaJob[]) || []).map(mapAdzunaJob)

      // Client-side type filter (Adzuna doesn't have a granular contract_type filter)
      if (type !== 'all' && type !== 'remote') {
        jobs = jobs.filter((j) => j.type === type)
      }
      if (remote) {
        jobs = jobs.filter((j) => j.remote)
      }

      jobs = jobs.map((j) => ({ ...j, matchScore: Math.floor(Math.random() * 40) + 60 }))

      const total: number = data.count ?? jobs.length
      return NextResponse.json({
        jobs,
        total,
        page,
        hasMore: page * limit < total,
        source: 'adzuna',
      })
    } catch (err) {
      console.error('[JOBS] Adzuna fetch failed, falling back to mock', err)
      // fall through to mock
    }
  }

  // ── Mock fallback (no API key or Adzuna error) ─────────────────────────────
  let jobs = [...MOCK_JOBS]

  if (keyword) {
    const kw = keyword.toLowerCase()
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw) ||
        j.tags?.some((t) => t.toLowerCase().includes(kw))
    )
  }
  if (location) {
    const loc = location.toLowerCase()
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc) || j.remote)
  }
  if (type !== 'all') jobs = jobs.filter((j) => j.type === type)
  if (remote) jobs = jobs.filter((j) => j.remote)

  jobs = jobs.map((j) => ({ ...j, matchScore: Math.floor(Math.random() * 40) + 60 }))

  const total = jobs.length
  const paged = jobs.slice((page - 1) * limit, page * limit)

  return NextResponse.json({
    jobs: paged,
    total,
    page,
    hasMore: (page - 1) * limit + paged.length < total,
    source: 'mock',
  })
}
