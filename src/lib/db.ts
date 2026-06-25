/**
 * Data access layer — wraps Supabase queries with typed helpers.
 * All functions use the server (service-role) client so they bypass RLS.
 * snake_case DB columns are mapped to camelCase for the app's type system.
 */
import { getServerSupabase } from './supabase'
import type { UserRow, ResumeRow, PortfolioRow, SavedJobRow, CreditLogRow } from '@/types/supabase'
import type { Resume, Portfolio, SavedJob, ResumeData, PortfolioTheme, ResumeTemplate } from '@/types'
import type { Json } from '@/types/supabase'

// ─── Row → domain mappers ────────────────────────────────────────────────────

function mapResume(r: ResumeRow): Resume {
  return {
    id: r.id,
    title: r.title,
    template: (r.template as ResumeTemplate) ?? 'modern',
    data: r.data as unknown as ResumeData,
    userId: r.user_id,
    isPublic: r.is_public,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

type PortfolioWithResume = PortfolioRow & { resume?: ResumeRow | null }

function mapPortfolio(r: PortfolioWithResume): Portfolio {
  return {
    id: r.id,
    userId: r.user_id,
    resumeId: r.resume_id,
    theme: (r.theme as PortfolioTheme) ?? 'modern',
    slug: r.slug,
    isPublic: r.is_public,
    views: r.views,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    resume: r.resume ? mapResume(r.resume) : undefined,
  }
}

function mapSavedJob(r: SavedJobRow): SavedJob {
  return {
    id: r.id,
    userId: r.user_id,
    jobData: r.job_data as unknown as SavedJob['jobData'],
    savedAt: r.saved_at,
  }
}

// ─── User queries ─────────────────────────────────────────────────────────────

export const db = {
  user: {
    async findByEmail(email: string): Promise<UserRow | null> {
      const sb = getServerSupabase()
      const { data } = await sb.from('users').select('*').eq('email', email).maybeSingle()
      return data
    },
    async findById(id: string): Promise<UserRow | null> {
      const sb = getServerSupabase()
      const { data } = await sb.from('users').select('*').eq('id', id).maybeSingle()
      return data
    },
    async findByUsername(username: string): Promise<UserRow | null> {
      const sb = getServerSupabase()
      const { data } = await sb.from('users').select('*').eq('username', username).maybeSingle()
      return data
    },
    async create(input: {
      name: string
      email: string
      password?: string
      username: string
      image?: string
    }): Promise<UserRow> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('users')
        .insert({ ...input, credits: 10 })
        .select()
        .single()
      if (error) throw error
      return data
    },
    async update(id: string, payload: Partial<UserRow>): Promise<UserRow> {
      const sb = getServerSupabase()
      const { data, error } = await sb.from('users').update(payload).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    async decrementCredits(id: string): Promise<number> {
      const sb = getServerSupabase()
      const { data, error } = await sb.rpc('decrement_credits', { user_id: id })
      if (!error) return data as number
      // Fallback: manual read-then-write
      const { data: user } = await sb.from('users').select('credits').eq('id', id).single()
      const next = Math.max(0, (user?.credits ?? 1) - 1)
      await sb.from('users').update({ credits: next }).eq('id', id)
      return next
    },
  },

  // ─── Resume queries ──────────────────────────────────────────────────────────
  resume: {
    async findMany(userId: string): Promise<Resume[]> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapResume)
    },
    async findById(id: string): Promise<Resume | null> {
      const sb = getServerSupabase()
      const { data } = await sb.from('resumes').select('*').eq('id', id).maybeSingle()
      return data ? mapResume(data) : null
    },
    async create(userId: string, title: string, template: string, resumeData: ResumeData): Promise<Resume> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('resumes')
        .insert({ user_id: userId, title, template, data: resumeData as unknown as Json })
        .select()
        .single()
      if (error) throw error
      return mapResume(data)
    },
    async update(id: string, updates: { title?: string; template?: string; data?: ResumeData }): Promise<Resume> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('resumes')
        .update({
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.template !== undefined && { template: updates.template }),
          ...(updates.data !== undefined && { data: updates.data as unknown as Json }),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapResume(data)
    },
    async delete(id: string): Promise<void> {
      const sb = getServerSupabase()
      const { error } = await sb.from('resumes').delete().eq('id', id)
      if (error) throw error
    },
    async count(userId: string): Promise<number> {
      const sb = getServerSupabase()
      const { count } = await sb.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      return count ?? 0
    },
  },

  // ─── Portfolio queries ────────────────────────────────────────────────────────
  portfolio: {
    async findByUserId(userId: string): Promise<Portfolio | null> {
      const sb = getServerSupabase()
      const { data } = await sb
        .from('portfolios')
        .select('*, resume:resumes(*)')
        .eq('user_id', userId)
        .maybeSingle()
      if (!data) return null
      return mapPortfolio(data as unknown as PortfolioWithResume)
    },
    async findBySlug(slug: string): Promise<Portfolio | null> {
      const sb = getServerSupabase()
      const { data } = await sb
        .from('portfolios')
        .select('*, resume:resumes(*)')
        .eq('slug', slug)
        .maybeSingle()
      if (!data) return null
      return mapPortfolio(data as unknown as PortfolioWithResume)
    },
    async slugExists(slug: string, excludeUserId?: string): Promise<boolean> {
      const sb = getServerSupabase()
      let q = sb.from('portfolios').select('id').eq('slug', slug)
      if (excludeUserId) q = q.neq('user_id', excludeUserId)
      const { data } = await q.maybeSingle()
      return !!data
    },
    async upsert(userId: string, resumeId: string, theme: string, slug: string): Promise<Portfolio> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('portfolios')
        .upsert({ user_id: userId, resume_id: resumeId, theme, slug, is_public: true }, { onConflict: 'user_id' })
        .select('*, resume:resumes(*)')
        .single()
      if (error) throw error
      return mapPortfolio(data as unknown as PortfolioWithResume)
    },
    async update(userId: string, updates: { theme?: string; isPublic?: boolean; slug?: string }): Promise<Portfolio> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('portfolios')
        .update({
          ...(updates.theme !== undefined && { theme: updates.theme }),
          ...(updates.isPublic !== undefined && { is_public: updates.isPublic }),
          ...(updates.slug !== undefined && { slug: updates.slug }),
        })
        .eq('user_id', userId)
        .select('*, resume:resumes(*)')
        .single()
      if (error) throw error
      return mapPortfolio(data as unknown as PortfolioWithResume)
    },
    async incrementViews(id: string): Promise<void> {
      const sb = getServerSupabase()
      const { error } = await sb.rpc('increment_portfolio_views', { portfolio_id: id })
      if (!error) return
      // Fallback
      const { data } = await sb.from('portfolios').select('views').eq('id', id).single()
      const views = (data?.views ?? 0) + 1
      await sb.from('portfolios').update({ views }).eq('id', id)
    },
  },

  // ─── Saved jobs ───────────────────────────────────────────────────────────────
  savedJob: {
    async findMany(userId: string): Promise<SavedJob[]> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('saved_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapSavedJob)
    },
    async create(userId: string, jobData: SavedJob['jobData']): Promise<SavedJob> {
      const sb = getServerSupabase()
      const { data, error } = await sb
        .from('saved_jobs')
        .insert({ user_id: userId, job_data: jobData as unknown as Json })
        .select()
        .single()
      if (error) throw error
      return mapSavedJob(data)
    },
    async delete(id: string, userId: string): Promise<void> {
      const sb = getServerSupabase()
      const { error } = await sb.from('saved_jobs').delete().eq('id', id).eq('user_id', userId)
      if (error) throw error
    },
    async count(userId: string): Promise<number> {
      const sb = getServerSupabase()
      const { count } = await sb.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      return count ?? 0
    },
  },

  // ─── Credit logs ──────────────────────────────────────────────────────────────
  creditLog: {
    async create(userId: string, amount: number, type: string, description: string): Promise<void> {
      const sb = getServerSupabase()
      await sb.from('credit_logs').insert({ user_id: userId, amount, type, description })
    },
    async findMany(userId: string): Promise<CreditLogRow[]> {
      const sb = getServerSupabase()
      const { data } = await sb
        .from('credit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      return data ?? []
    },
  },
}
