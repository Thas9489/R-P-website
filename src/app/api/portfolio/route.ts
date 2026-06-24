import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const portfolio = await db.portfolio.findUnique({
      where: { userId: session.user.id },
      include: { resume: true },
    })

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('[PORTFOLIO_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resumeId, theme = 'modern', slug } = await req.json()
    if (!resumeId) return NextResponse.json({ error: 'resumeId is required' }, { status: 400 })

    const resume = await db.resume.findUnique({ where: { id: resumeId } })
    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    const baseSlug = slug || user?.username || generateSlug(user?.name || 'user')

    const existingPortfolio = await db.portfolio.findUnique({ where: { userId: session.user.id } })
    if (existingPortfolio) {
      const updated = await db.portfolio.update({
        where: { userId: session.user.id },
        data: { resumeId, theme, ...(slug && { slug }) },
        include: { resume: true },
      })
      return NextResponse.json({ portfolio: updated })
    }

    let finalSlug = baseSlug
    const existing = await db.portfolio.findUnique({ where: { slug: finalSlug } })
    if (existing) finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 6)}`

    const portfolio = await db.portfolio.create({
      data: { userId: session.user.id, resumeId, theme, slug: finalSlug, isPublic: true },
      include: { resume: true },
    })

    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (error) {
    console.error('[PORTFOLIO_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { theme, isPublic, slug } = await req.json()

    if (slug) {
      const existing = await db.portfolio.findFirst({
        where: { slug, NOT: { userId: session.user.id } },
      })
      if (existing) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }

    const portfolio = await db.portfolio.update({
      where: { userId: session.user.id },
      data: {
        ...(theme !== undefined && { theme }),
        ...(isPublic !== undefined && { isPublic }),
        ...(slug && { slug }),
      },
      include: { resume: true },
    })

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('[PORTFOLIO_PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
