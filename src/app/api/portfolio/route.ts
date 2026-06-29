import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/session'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const portfolio = await db.portfolio.findByUserId(user.id)
    return NextResponse.json({ portfolio })
  } catch (err) {
    console.error('[PORTFOLIO_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resumeId, theme = 'modern', slug } = await req.json()
    if (!resumeId) return NextResponse.json({ error: 'resumeId is required' }, { status: 400 })

    const resume = await db.resume.findById(resumeId)
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const base = slug || (user.username as string) || generateSlug((user.name as string) ?? 'user')
    const slugTaken = await db.portfolio.slugExists(base, user.id)
    const finalSlug = slugTaken ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base

    const portfolio = await db.portfolio.upsert(user.id, resumeId, theme, finalSlug)
    revalidatePath(`/portfolio/${finalSlug}`)
    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (err) {
    console.error('[PORTFOLIO_POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { theme, isPublic, slug, resumeId } = await req.json()

    if (slug !== undefined && slug !== null) {
      if (slug.length < 3 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
        return NextResponse.json(
          { error: 'Slug must be at least 3 characters: lowercase letters, numbers, and hyphens only' },
          { status: 400 },
        )
      }
    }

    if (resumeId) {
      const resume = await db.resume.findById(resumeId)
      if (!resume || resume.userId !== user.id) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
      }
    }

    const current = await db.portfolio.findByUserId(user.id)
    if (!current) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })

    if (slug && slug !== current.slug) {
      const taken = await db.portfolio.slugExists(slug, user.id)
      if (taken) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }

    const portfolio = await db.portfolio.update(user.id, { theme, isPublic, slug, resumeId })

    revalidatePath(`/portfolio/${current.slug}`)
    if (portfolio.slug !== current.slug) revalidatePath(`/portfolio/${portfolio.slug}`)

    return NextResponse.json({ portfolio })
  } catch (err) {
    console.error('[PORTFOLIO_PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const portfolio = await db.portfolio.findByUserId(user.id)
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })

    await db.portfolio.delete(user.id)
    revalidatePath(`/portfolio/${portfolio.slug}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PORTFOLIO_DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
