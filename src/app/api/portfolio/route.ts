import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const portfolio = await db.portfolio.findByUserId(session.user.id)
    return NextResponse.json({ portfolio })
  } catch (err) {
    console.error('[PORTFOLIO_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resumeId, theme = 'modern', slug } = await req.json()
    if (!resumeId) return NextResponse.json({ error: 'resumeId is required' }, { status: 400 })

    const resume = await db.resume.findById(resumeId)
    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const user = await db.user.findById(session.user.id)
    const base = slug || (user?.username as string) || generateSlug((user?.name as string) ?? 'user')
    const slugTaken = await db.portfolio.slugExists(base, session.user.id)
    const finalSlug = slugTaken ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base

    const portfolio = await db.portfolio.upsert(session.user.id, resumeId, theme, finalSlug)
    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (err) {
    console.error('[PORTFOLIO_POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { theme, isPublic, slug } = await req.json()

    if (slug) {
      const taken = await db.portfolio.slugExists(slug, session.user.id)
      if (taken) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }

    const portfolio = await db.portfolio.update(session.user.id, { theme, isPublic, slug })
    return NextResponse.json({ portfolio })
  } catch (err) {
    console.error('[PORTFOLIO_PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
