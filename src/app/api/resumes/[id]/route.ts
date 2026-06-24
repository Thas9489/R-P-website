import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function getResumeAndVerify(id: string, userId: string) {
  const resume = await db.resume.findUnique({ where: { id } })
  if (!resume) return { error: 'Not found', status: 404 }
  if (resume.userId !== userId) return { error: 'Forbidden', status: 403 }
  return { resume }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resume, error, status } = await getResumeAndVerify(params.id, session.user.id)
    if (error) return NextResponse.json({ error }, { status })

    return NextResponse.json({ resume })
  } catch (error) {
    console.error('[RESUME_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { resume, error, status } = await getResumeAndVerify(params.id, session.user.id)
    if (error) return NextResponse.json({ error }, { status })

    const body = await req.json()
    const { title, template, data } = body

    const updated = await db.resume.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(template && { template }),
        ...(data && { data }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ resume: updated })
  } catch (error) {
    console.error('[RESUME_PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error, status } = await getResumeAndVerify(params.id, session.user.id)
    if (error) return NextResponse.json({ error }, { status })

    await db.resume.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RESUME_DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
