import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import type { ResumeData } from '@/types'

const emptyData: ResumeData = {
  personalInfo: { name: '', title: '', email: '', phone: '', location: '' },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  awards: [],
  references: [],
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const resumes = await db.resume.findMany(session.user.id)
    return NextResponse.json({ resumes })
  } catch (err) {
    console.error('[RESUMES_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, template = 'modern', data } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const resume = await db.resume.create(session.user.id, title, template, data ?? emptyData)
    return NextResponse.json({ resume }, { status: 201 })
  } catch (err) {
    console.error('[RESUMES_POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
