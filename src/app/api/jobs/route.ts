import { NextRequest, NextResponse } from 'next/server'
import type { Job, JobType } from '@/types'

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY
const ADZUNA_COUNTRY = (process.env.ADZUNA_COUNTRY || 'us').toLowerCase()

function mapAdzunaType(contractType: string | undefined, contractTime: string | undefined): JobType {
  if (contractType) {
    const t = contractType.toLowerCase()
    if (t.includes('intern')) return 'internship'
    if (t.includes('contract') || t.includes('temp')) return 'contract'
  }
  if (contractTime === 'part_time') return 'part-time'
  return 'full-time'
}

async function fetchFromAdzuna(
  keyword: string,
  location: string,
  type: string,
  remote: boolean,
  page: number,
  limit: number,
): Promise<NextResponse> {
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID!,
    app_key: ADZUNA_APP_KEY!,
    results_per_page: String(limit),
    what: remote && !keyword ? 'remote' : keyword,
    where: location,
    'content-type': 'application/json',
  })

  const typeMap: Record<string, string> = {
    'part-time': 'part_time',
    contract: 'contract',
    internship: 'internship',
  }
  if (type !== 'all' && type !== 'full-time' && type !== 'remote' && typeMap[type]) {
    params.set('contract_type', typeMap[type])
  }
  if (type === 'part-time') params.set('contract_time', 'part_time')
  if (remote) {
    const existing = params.get('what_or') || ''
    params.set('what_or', existing ? `${existing} remote` : 'remote')
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/${page}?${params}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Adzuna ${res.status}`)

  const data = await res.json()

  const jobs: Job[] = (data.results || []).map((r: Record<string, unknown>) => {
    const loc = r.location as { display_name?: string } | undefined
    const company = r.company as { display_name?: string } | undefined
    const category = r.category as { tag?: string } | undefined
    const salaryMin = typeof r.salary_min === 'number' ? r.salary_min : undefined
    const salaryMax = typeof r.salary_max === 'number' ? r.salary_max : undefined

    let salary: string | undefined
    if (salaryMin && salaryMax) {
      salary = `$${Math.round(salaryMin / 1000)}k–$${Math.round(salaryMax / 1000)}k/yr`
    } else if (salaryMin) {
      salary = `$${Math.round(salaryMin / 1000)}k+/yr`
    }

    const title = String(r.title || '')
    const description = String(r.description || '')
    const isRemote =
      remote ||
      title.toLowerCase().includes('remote') ||
      description.toLowerCase().includes('remote work') ||
      description.toLowerCase().includes('work from home')

    const jobType = mapAdzunaType(
      r.contract_type as string | undefined,
      r.contract_time as string | undefined,
    )

    return {
      id: String(r.id),
      title,
      company: company?.display_name || 'Unknown',
      location: loc?.display_name || location || 'Unknown',
      type: isRemote && jobType === 'full-time' && type === 'remote' ? 'remote' : jobType,
      remote: isRemote,
      salary,
      description: description.substring(0, 600),
      requirements: [],
      tags: category?.tag ? [category.tag] : [],
      url: String(r.redirect_url || ''),
      source: 'Adzuna',
      postedAt: String(r.created || new Date().toISOString()),
    }
  })

  const total = typeof data.count === 'number' ? data.count : jobs.length
  return NextResponse.json({ jobs, total, page, hasMore: page * limit < total })
}

async function fetchFromTheMuse(
  keyword: string,
  location: string,
  type: string,
  remote: boolean,
  page: number,
  limit: number,
): Promise<NextResponse> {
  // The Muse uses 0-indexed pages with 20 results per page
  const musePage = Math.max(0, page - 1)
  const params = new URLSearchParams({ page: String(musePage) })

  if (location) params.append('location[]', location)
  if (remote) params.append('location[]', 'Remote / Telecommute')

  const museTypeMap: Record<string, string> = {
    'part-time': 'Part-time',
    contract: 'Contract / Freelance',
    internship: 'Internship',
    remote: 'Remote / Telecommute',
  }
  if (type !== 'all' && type !== 'full-time' && museTypeMap[type]) {
    params.append('job_type', museTypeMap[type])
  }

  const url = `https://www.themuse.com/api/public/jobs?${params}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`TheMuse ${res.status}`)

  const data = await res.json()
  const results: Record<string, unknown>[] = data.results || []

  let jobs: Job[] = results.map((r) => {
    const locations = r.locations as Array<{ name: string }> | undefined
    const company = r.company as { name?: string } | undefined
    const categories = r.categories as Array<{ name: string }> | undefined
    const refs = r.refs as { landing_page?: string } | undefined

    const locationNames = locations?.map((l) => l.name) || []
    const locationStr = locationNames.join(' · ') || 'Unknown'
    const isRemote =
      remote ||
      locationNames.some(
        (l) => l.toLowerCase().includes('remote') || l.toLowerCase().includes('telecommute'),
      )

    const rawType = String(r.type || '')
    let jobType: JobType = 'full-time'
    if (rawType === 'part_time') jobType = 'part-time'
    else if (rawType === 'contract') jobType = 'contract'
    else if (rawType === 'internship') jobType = 'internship'
    else if (isRemote && type === 'remote') jobType = 'remote'

    const rawContent = String(r.contents || '')
    const description = rawContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 600)

    return {
      id: String(r.id),
      title: String(r.name || ''),
      company: company?.name || 'Unknown',
      location: locationStr,
      type: jobType,
      remote: isRemote,
      description,
      requirements: [],
      tags: categories?.map((c) => c.name) || [],
      url: refs?.landing_page || '',
      source: 'The Muse',
      postedAt: String(r.publication_date || new Date().toISOString()),
    }
  })

  // The Muse doesn't support keyword search — filter client-side
  if (keyword) {
    const kw = keyword.toLowerCase()
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        (j.tags || []).some((t) => t.toLowerCase().includes(kw)) ||
        j.description.toLowerCase().includes(kw),
    )
  }

  if (type !== 'all') {
    jobs = jobs.filter((j) => j.type === type || (type === 'remote' && j.remote))
  }

  const total = typeof data.total === 'number' ? data.total : results.length
  const hasMore = musePage * 20 + results.length < total

  return NextResponse.json({ jobs: jobs.slice(0, limit), total, page, hasMore })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''
  const type = searchParams.get('type') || 'all'
  const remote = searchParams.get('remote') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'))

  try {
    if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
      return await fetchFromAdzuna(keyword, location, type, remote, page, limit)
    }
    return await fetchFromTheMuse(keyword, location, type, remote, page, limit)
  } catch (err) {
    console.error('[/api/jobs]', err)
    return NextResponse.json({ jobs: [], total: 0, page: 1, hasMore: false }, { status: 500 })
  }
}
