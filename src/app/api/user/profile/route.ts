import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, username } = await req.json()

    if (username && username !== user.username) {
      const taken = await db.user.findByUsername(username)
      if (taken && taken.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const updated = await db.user.update(user.id, {
      ...(name !== undefined ? { name } : {}),
      ...(username !== undefined ? { username } : {}),
    })

    return NextResponse.json({ user: { id: updated.id, name: updated.name, username: updated.username } })
  } catch (err) {
    console.error('[USER_PROFILE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
