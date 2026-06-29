import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { db } from '@/lib/db'

async function guard(id: string, userId: string) {
  const resume = await db.resume.findById(id)
  if (!resume) return { error: 'Not found', status: 404 as const }
  if (resume.userId !== userId) return { error: 'Forbidden', status: 403 as const }
  return { resume }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { resume, error, status } = await guard(params.id, user.id)
    if (error) return NextResponse.json({ error }, { status })
    return NextResponse.json({ resume })
  } catch (err) {
    console.error('[RESUME_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { error, status } = await guard(params.id, user.id)
    if (error) return NextResponse.json({ error }, { status })

    const { title, template, data } = await req.json()
    const updated = await db.resume.update(params.id, { title, template, data })
    return NextResponse.json({ resume: updated })
  } catch (err) {
    console.error('[RESUME_PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { error, status } = await guard(params.id, user.id)
    if (error) return NextResponse.json({ error }, { status })
    await db.resume.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[RESUME_DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
