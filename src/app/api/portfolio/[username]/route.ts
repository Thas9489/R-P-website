import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { username: string } }) {
  try {
    const portfolio = await db.portfolio.findBySlug(params.username)
    if (!portfolio || !portfolio.isPublic) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }
    // Increment views async (don't await)
    db.portfolio.incrementViews(portfolio.id).catch(() => {})
    return NextResponse.json({ portfolio })
  } catch (err) {
    console.error('[PUBLIC_PORTFOLIO]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
