import { NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [freshUser, logs] = await Promise.all([
    db.user.findById(user.id),
    db.creditLog.findMany(user.id),
  ])

  return NextResponse.json({ credits: (freshUser?.credits as number) ?? 0, logs })
}
