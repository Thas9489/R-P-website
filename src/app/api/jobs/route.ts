import { NextRequest, NextResponse } from 'next/server'

const EDGE_FN = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/job-search`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  try {
    const res = await fetch(`${EDGE_FN}?${searchParams}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/jobs]', err)
    return NextResponse.json({ jobs: [], total: 0, page: 1, hasMore: false }, { status: 500 })
  }
}
