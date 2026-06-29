import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const savedJobs = await db.savedJob.findMany(user.id)
  return NextResponse.json({ savedJobs })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { jobData } = await req.json()
    if (!jobData) return NextResponse.json({ error: 'Job data required' }, { status: 400 })
    const savedJob = await db.savedJob.create(user.id, jobData)
    return NextResponse.json({ savedJob }, { status: 201 })
  } catch (err) {
    console.error('[SAVE_JOB]', err)
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { savedJobId } = await req.json()
    if (!savedJobId) return NextResponse.json({ error: 'savedJobId required' }, { status: 400 })
    await db.savedJob.delete(savedJobId, user.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[UNSAVE_JOB]', err)
    return NextResponse.json({ error: 'Failed to unsave job' }, { status: 500 })
  }
}
