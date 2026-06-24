import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resumes = await db.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error('[RESUMES_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, template = 'modern', data } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const resume = await db.resume.create({
      data: {
        userId: session.user.id,
        title,
        template,
        data: data || {
          personalInfo: { name: '', title: '', email: '', phone: '', location: '' },
          summary: '',
          education: [],
          experience: [],
          projects: [],
          skills: [],
          certifications: [],
          awards: [],
          references: [],
        },
      },
    })

    return NextResponse.json({ resume }, { status: 201 })
  } catch (error) {
    console.error('[RESUMES_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
