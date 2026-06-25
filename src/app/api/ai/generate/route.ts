import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  generateSummary,
  rewriteExperience,
  generateProjectDescription,
  suggestSkills,
  improveText,
} from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findById(session.user.id)
    if (!user || (user.credits as number) < 1) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 402 })
    }

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

    // Deduct credit and log
    const newCredits = await db.user.decrementCredits(session.user.id)
    await db.creditLog.create(session.user.id, -1, 'used', `AI ${type} generation`)

    return NextResponse.json({ result, creditsUsed: 1, creditsRemaining: newCredits })
  } catch (err) {
    console.error('[AI_GENERATE]', err)
    return NextResponse.json({ error: 'AI generation failed. Check your API key.' }, { status: 500 })
  }
}
