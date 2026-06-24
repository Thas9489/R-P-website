import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { username: string } }) {
  try {
    const portfolio = await db.portfolio.findUnique({
      where: { slug: params.username },
      include: { resume: true, user: { select: { name: true, email: true, image: true } } },
    })

    if (!portfolio || !portfolio.isPublic) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Increment view count (fire and forget)
    db.portfolio.update({ where: { id: portfolio.id }, data: { views: { increment: 1 } } }).catch(() => {})

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('[PUBLIC_PORTFOLIO]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
