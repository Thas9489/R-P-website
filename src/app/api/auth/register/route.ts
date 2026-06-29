import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { name, email, username, image } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Idempotent — if user already exists in our DB, return success
    const existing = await db.user.findByEmail(email)
    if (existing) {
      if (image && !existing.image) {
        await db.user.update(existing.id, { image })
      }
      return NextResponse.json(
        { user: { id: existing.id, email: existing.email } },
        { status: 200 }
      )
    }

    const base = username || generateSlug(name ?? email.split('@')[0])
    const existingUsername = await db.user.findByUsername(base)
    const finalUsername = existingUsername
      ? `${base}-${Math.random().toString(36).slice(2, 6)}`
      : base

    const user = await db.user.create({
      name: name ?? email.split('@')[0],
      email,
      username: finalUsername,
      image: image ?? undefined,
    })

    return NextResponse.json(
      { user: { id: user.id, email: user.email, username: user.username, name: user.name } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
