import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
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
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const resumes = await db.resume.findMany(user.id)
    return NextResponse.json({ resumes })
  } catch (err) {
    console.error('[RESUMES_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, template = 'modern', data } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const resume = await db.resume.create(user.id, title, template, data ?? emptyData)
    return NextResponse.json({ resume }, { status: 201 })
  } catch (err) {
    console.error('[RESUMES_POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
