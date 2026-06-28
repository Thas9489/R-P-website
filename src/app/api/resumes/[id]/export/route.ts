import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resume = await db.resume.findById(params.id)
    if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (resume.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const fileName = `${resume.title.replace(/[^a-z0-9]/gi, '_')}_backup.json`
    return new NextResponse(JSON.stringify(resume.data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    console.error('[RESUME_EXPORT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
