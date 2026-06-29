import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { analyzeATS } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
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
