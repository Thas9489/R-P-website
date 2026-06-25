import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user, logs] = await Promise.all([
    db.user.findById(session.user.id),
    db.creditLog.findMany(session.user.id),
  ])

  return NextResponse.json({ credits: (user?.credits as number) ?? 0, logs })
}
