import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { analyzeATS } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeData, jobDescription } = await req.json()

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    const analysis = await analyzeATS(resumeData || {}, jobDescription)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('[ATS_ANALYZE]', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
