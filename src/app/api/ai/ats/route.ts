import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { db } from '@/lib/db'
import { analyzeATS } from '@/lib/ai'

async function getUserFromReq(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null
  return db.user.findByEmail(user.email)
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resumeData, jobDescription } = await req.json()
    if (!jobDescription) return NextResponse.json({ error: 'Job description is required' }, { status: 400 })

    const analysis = await analyzeATS(resumeData ?? {}, jobDescription)
    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('[ATS_ANALYZE]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
