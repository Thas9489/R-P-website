import { NextRequest, NextResponse } from 'next/server'
import type { Job, JobType } from '@/types'

// ─── Env ────────────────────────────────────────────────────────────────────
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY
const ADZUNA_COUNTRY_DEFAULT = (process.env.ADZUNA_COUNTRY || 'us').toLowerCase()

// ─── Helpers ────────────────────────────────────────────────────────────────

// Map location text → Adzuna country code (covers all supported countries)
const LOCATION_COUNTRY_MAP: [string, string][] = [
  // United States
  ['united states', 'us'], ['usa', 'us'], [', us', 'us'], [', ny', 'us'], [', ca', 'us'],
  ['new york', 'us'], ['san francisco', 'us'], ['los angeles', 'us'], ['chicago', 'us'],
  ['houston', 'us'], ['seattle', 'us'], ['boston', 'us'], ['austin', 'us'], ['miami', 'us'],
  // United Kingdom
  ['united kingdom', 'gb'], [' uk', 'gb'], ['england', 'gb'], ['london', 'gb'],
  ['manchester', 'gb'], ['birmingham', 'gb'], ['glasgow', 'gb'], ['edinburgh', 'gb'],
  // Australia
  ['australia', 'au'], ['sydney', 'au'], ['melbourne', 'au'], ['brisbane', 'au'],
  ['perth', 'au'], ['adelaide', 'au'],
  // Canada
  ['canada', 'ca'], ['toronto', 'ca'], ['vancouver', 'ca'], ['montreal', 'ca'],
  ['calgary', 'ca'], ['ottawa', 'ca'],
  // Germany
  ['germany', 'de'], ['berlin', 'de'], ['munich', 'de'], ['hamburg', 'de'],
  ['frankfurt', 'de'], ['cologne', 'de'], ['düsseldorf', 'de'],
  // France
  ['france', 'fr'], ['paris', 'fr'], ['lyon', 'fr'], ['marseille', 'fr'], ['toulouse', 'fr'],
  // India
  ['india', 'in'], ['bangalore', 'in'], ['bengaluru', 'in'], ['mumbai', 'in'],
  ['delhi', 'in'], ['hyderabad', 'in'], ['chennai', 'in'], ['pune', 'in'],
  // New Zealand
  ['new zealand', 'nz'], ['auckland', 'nz'], ['wellington', 'nz'], ['christchurch', 'nz'],
  // Netherlands
  ['netherlands', 'nl'], ['amsterdam', 'nl'], ['rotterdam', 'nl'], ['the hague', 'nl'],
  // Poland
  ['poland', 'pl'], ['warsaw', 'pl'], ['krakow', 'pl'], ['wroclaw', 'pl'],
  // Russia
  ['russia', 'ru'], ['moscow', 'ru'], ['saint petersburg', 'ru'],
  // Singapore
  ['singapore', 'sg'],
  // South Africa
  ['south africa', 'za'], ['johannesburg', 'za'], ['cape town', 'za'], ['durban', 'za'],
  // Austria
  ['austria', 'at'], ['vienna', 'at'], ['graz', 'at'],
  // Brazil
  ['brazil', 'br'], ['são paulo', 'br'], ['sao paulo', 'br'], ['rio de janeiro', 'br'],
]

function detectAdzunaCountry(location: string): string {
  const loc = location.toLowerCase().trim()
  if (!loc) return ADZUNA_COUNTRY_DEFAULT
  for (const [key, code] of LOCATION_COUNTRY_MAP) {
    if (loc.includes(key)) return code
  }
  return ADZUNA_COUNTRY_DEFAULT
}

function mapJobType(raw: string | undefined): JobType {
  if (!raw) return 'full-time'
  const t = raw.toLowerCase()
  if (t.includes('part')) return 'part-time'
  if (t.includes('contract') || t.includes('freelance') || t.includes('temp')) return 'contract'
  if (t.includes('intern')) return 'internship'
  if (t.includes('remote')) return 'remote'
  return 'full-time'
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string | undefined {
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'AUD' ? 'A$' : '$'
  if (min && max) return `${symbol}${Math.round(min / 1000)}k–${symbol}${Math.round(max / 1000)}k`
  if (min) return `${symbol}${Math.round(min / 1000)}k+`
  return undefined
}

// ─── Provider: JSearch (RapidAPI) — truly global ───────────────────────────
async function fetchFromJSearch(
  keyword: string,
  location: string,
  type: string,
  remote: boolean,
  page: number,
  limit: number,
): Promise<NextResponse> {
  const query = [keyword, location ? `in ${location}` : '', remote ? 'remote' : '']
    .filter(Boolean)
    .join(' ')
    .trim() || 'jobs'

  const typeMap: Record<string, string> = {
    'full-time': 'FULLTIME',
    'part-time': 'PARTTIME',
    contract: 'CONTRACTOR',
    internship: 'INTERN',
  }

  const params = new URLSearchParams({
    query,
    page: String(page),
    num_pages: '1',
  })
  if (type !== 'all' && type !== 'remote' && typeMap[type]) {
    params.set('employment_types', typeMap[type])
  }

  const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`JSearch ${res.status}`)

  const data = await res.json()
  const results: Record<string, unknown>[] = data.data || []

  const jobs: Job[] = results.slice(0, limit).map((r) => {
    const city = String(r.job_city || '')
    const state = String(r.job_state || '')
    const country = String(r.job_country || '')
    const locationStr = [city, state, country].filter(Boolean).join(', ')

    const isRemote = Boolean(r.job_is_remote) || remote
    const empType = String(r.job_employment_type || '')
    let jobType: JobType = mapJobType(empType)
    if (isRemote && jobType === 'full-time' && type === 'remote') jobType = 'remote'

    const highlights = r.job_highlights as Record<string, string[]> | undefined
    const requirements: string[] = [
      ...(highlights?.Qualifications || []),
      ...(highlights?.Responsibilities || []),
    ].slice(0, 5)

    const skills = r.job_required_skills as string[] | undefined

    return {
      id: String(r.job_id || Math.random()),
      title: String(r.job_title || ''),
      company: String(r.employer_name || 'Unknown'),
      location: locationStr || location || 'Unknown',
      type: jobType,
      remote: isRemote,
      salary: formatSalary(
        r.job_min_salary as number | null,
        r.job_max_salary as number | null,
        r.job_salary_currency as string | null,
      ),
      description: String(r.job_description || '').substring(0, 600),
      requirements,
      tags: skills?.slice(0, 6) || [],
      url: String(r.job_apply_link || r.job_google_link || ''),
      source: String(r.job_publisher || 'JSearch'),
      postedAt: String(r.job_posted_at_datetime_utc || new Date().toISOString()),
    }
  })

  return NextResponse.json({ jobs, total: jobs.length * 10, page, hasMore: jobs.length === limit })
}

// ─── Provider: Adzuna — regional, auto-detects country ─────────────────────
async function fetchFromAdzuna(
  keyword: string,
  location: string,
  type: string,
  remote: boolean,
  page: number,
  limit: number,
): Promise<NextResponse> {
  const country = detectAdzunaCountry(location)

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID!,
    app_key: ADZUNA_APP_KEY!,
    results_per_page: String(limit),
    what: remote && !keyword ? 'remote' : keyword,
    where: location,
    'content-type': 'application/json',
  })

  if (type === 'part-time') params.set('contract_time', 'part_time')
  if (type === 'contract') params.set('contract_type', 'contract')
  if (type === 'internship') params.set('contract_type', 'internship')
  if (remote) params.set('what_or', 'remote')

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Adzuna ${res.status}`)

  const data = await res.json()

  const jobs: Job[] = (data.results || []).map((r: Record<string, unknown>) => {
    const loc = r.location as { display_name?: string } | undefined
    const company = r.company as { display_name?: string } | undefined
    const category = r.category as { tag?: string } | undefined

    const title = String(r.title || '')
    const description = String(r.description || '')
    const isRemote =
      remote ||
      title.toLowerCase().includes('remote') ||
      description.toLowerCase().includes('remote work') ||
      description.toLowerCase().includes('work from home')

    const jobType = mapJobType(
      (r.contract_type as string) || (r.contract_time as string),
    )

    return {
      id: String(r.id),
      title,
      company: company?.display_name || 'Unknown',
      location: loc?.display_name || location || 'Unknown',
      type: isRemote && jobType === 'full-time' && type === 'remote' ? 'remote' : jobType,
      remote: isRemote,
      salary: formatSalary(
        r.salary_min as number | null,
        r.salary_max as number | null,
      ),
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

// ─── Provider: Jobicy — global remote jobs, no key ─────────────────────────
async function fetchFromJobicy(
  keyword: string,
  location: string,
  limit: number,
): Promise<Job[]> {
  // Map location to Jobicy geo codes
  const geoMap: Record<string, string> = {
    'united states': 'usa', usa: 'usa', 'new york': 'usa', california: 'usa',
    'united kingdom': 'uk', uk: 'uk', england: 'uk', london: 'uk',
    australia: 'australia', sydney: 'australia', melbourne: 'australia',
    canada: 'canada', toronto: 'canada', vancouver: 'canada',
    germany: 'germany', berlin: 'germany', munich: 'germany',
    france: 'france', paris: 'france',
    india: 'india', bangalore: 'india', mumbai: 'india',
    brazil: 'brazil',
    europe: 'emea', 'middle east': 'emea', africa: 'emea',
    asia: 'apac', japan: 'apac', china: 'apac', korea: 'apac',
  }

  const loc = location.toLowerCase()
  let geo = ''
  for (const [key, code] of Object.entries(geoMap)) {
    if (loc.includes(key)) { geo = code; break }
  }

  const params = new URLSearchParams({ count: String(Math.min(limit * 2, 50)) })
  if (geo) params.set('geo', geo)
  if (keyword) params.set('tag', keyword)

  const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?${params}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return []

  const data = await res.json()
  const results: Record<string, unknown>[] = data.jobs || []

  return results.slice(0, limit).map((r) => ({
    id: String(r.id || Math.random()),
    title: String(r.jobTitle || ''),
    company: String(r.companyName || 'Unknown'),
    location: String(r.jobGeo || 'Remote'),
    type: mapJobType(String(r.jobType || '')),
    remote: true,
    salary: formatSalary(
      r.salaryMin as number | null,
      r.salaryMax as number | null,
      r.salaryCurrency as string | null,
    ),
    description: String(r.jobDescription || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 600),
    requirements: [],
    tags: (r.jobIndustry as string[] | undefined) || [],
    url: String(r.url || ''),
    source: 'Jobicy',
    postedAt: String(r.pubDate || new Date().toISOString()),
  }))
}

// ─── Provider: The Muse — US-centric, no key ───────────────────────────────
async function fetchFromTheMuse(
  keyword: string,
  location: string,
  type: string,
  remote: boolean,
  page: number,
  limit: number,
): Promise<NextResponse> {
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

  const [museRes, jobicyJobs] = await Promise.allSettled([
    fetch(`https://www.themuse.com/api/public/jobs?${params}`, { next: { revalidate: 300 } }),
    fetchFromJobicy(keyword, location, Math.ceil(limit / 2)),
  ])

  let museJobs: Job[] = []
  if (museRes.status === 'fulfilled' && museRes.value.ok) {
    const data = await museRes.value.json()
    const results: Record<string, unknown>[] = data.results || []

    museJobs = results.map((r) => {
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

      let jobType: JobType = mapJobType(String(r.type || ''))
      if (isRemote && jobType === 'full-time' && type === 'remote') jobType = 'remote'

      return {
        id: `muse-${String(r.id)}`,
        title: String(r.name || ''),
        company: company?.name || 'Unknown',
        location: locationStr,
        type: jobType,
        remote: isRemote,
        description: String(r.contents || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 600),
        requirements: [],
        tags: categories?.map((c) => c.name) || [],
        url: refs?.landing_page || '',
        source: 'The Muse',
        postedAt: String(r.publication_date || new Date().toISOString()),
      }
    })
  }

  // Combine Jobicy (global remote) + The Muse (US/location)
  const jobicyResults = jobicyJobs.status === 'fulfilled' ? jobicyJobs.value : []
  let combined = [...museJobs, ...jobicyResults]

  // Deduplicate by title+company
  const seen = new Set<string>()
  combined = combined.filter((j) => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Keyword filter
  if (keyword) {
    const kw = keyword.toLowerCase()
    combined = combined.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        (j.tags || []).some((t) => t.toLowerCase().includes(kw)) ||
        j.description.toLowerCase().includes(kw),
    )
  }

  // Type filter
  if (type !== 'all') {
    combined = combined.filter((j) => j.type === type || (type === 'remote' && j.remote))
  }

  return NextResponse.json({
    jobs: combined.slice(0, limit),
    total: combined.length + 20,
    page,
    hasMore: combined.length >= limit,
  })
}

// ─── Route handler ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''
  const type = searchParams.get('type') || 'all'
  const remote = searchParams.get('remote') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'))

  try {
    // Tier 1: JSearch — truly global, any country
    if (RAPIDAPI_KEY) {
      return await fetchFromJSearch(keyword, location, type, remote, page, limit)
    }

    // Tier 2: Adzuna — auto-detects country from location, great regional coverage
    if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
      return await fetchFromAdzuna(keyword, location, type, remote, page, limit)
    }

    // Tier 3: The Muse + Jobicy — free, no key, remote-heavy global coverage
    return await fetchFromTheMuse(keyword, location, type, remote, page, limit)
  } catch (err) {
    console.error('[/api/jobs]', err)
    return NextResponse.json({ jobs: [], total: 0, page: 1, hasMore: false }, { status: 500 })
  }
}
