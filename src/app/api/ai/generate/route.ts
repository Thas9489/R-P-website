import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { db } from '@/lib/db'
import {
  generateSummary,
  rewriteExperience,
  generateProjectDescription,
  suggestSkills,
  improveText,
} from '@/lib/ai'

export const runtime = 'edge'

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

    const { type, context, resumeData } = await req.json()
    let result = ''

    switch (type) {
      case 'summary':
        result = await generateSummary(
          resumeData?.personalInfo ?? {},
          resumeData?.experience ?? [],
          resumeData?.skills ?? []
        )
        break
      case 'experience': {
        const { position, company, description } = JSON.parse(context || '{}')
        result = await rewriteExperience(position ?? '', company ?? '', description ?? '')
        break
      }
      case 'project': {
        const { name, technologies } = JSON.parse(context || '{}')
        result = await generateProjectDescription(name ?? '', technologies ?? [])
        break
      }
      case 'skills': {
        const skills = await suggestSkills(
          resumeData?.personalInfo?.title ?? '',
          resumeData?.experience ?? [],
          (resumeData?.skills ?? []).map((s: { name: string }) => s.name)
        )
        result = JSON.stringify(skills)
        break
      }
      case 'improve':
        result = await improveText(context ?? '')
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const newCredits = await db.user.decrementCredits(user.id)
    await db.creditLog.create(user.id, -1, 'used', `AI ${type} generation`)

    return NextResponse.json({ result, creditsUsed: 1, creditsRemaining: newCredits })
  } catch (err) {
    console.error('[AI_GENERATE]', err)
    return NextResponse.json({ error: 'AI generation failed. Check your API key.' }, { status: 500 })
  }
}
