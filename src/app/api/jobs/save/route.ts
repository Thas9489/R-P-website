import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const saved = await db.savedJob.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: 'desc' },
  })

  return NextResponse.json({ savedJobs: saved })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jobData } = await req.json()
    if (!jobData) return NextResponse.json({ error: 'Job data required' }, { status: 400 })

    const saved = await db.savedJob.create({
      data: { userId: session.user.id, jobData },
    })

    return NextResponse.json({ savedJob: saved }, { status: 201 })
  } catch (error) {
    console.error('[SAVE_JOB]', error)
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { savedJobId } = await req.json()
    if (!savedJobId) return NextResponse.json({ error: 'savedJobId required' }, { status: 400 })

    const job = await db.savedJob.findUnique({ where: { id: savedJobId } })
    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.savedJob.delete({ where: { id: savedJobId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UNSAVE_JOB]', error)
    return NextResponse.json({ error: 'Failed to unsave job' }, { status: 500 })
  }
}
