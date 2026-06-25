import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, username } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existingEmail = await db.user.findByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const base = username || generateSlug(name)
    const existingUsername = await db.user.findByUsername(base)
    const finalUsername = existingUsername
      ? `${base}-${Math.random().toString(36).slice(2, 6)}`
      : base

    const hashed = await bcrypt.hash(password, 12)
    const user = await db.user.create({ name, email, password: hashed, username: finalUsername })

    return NextResponse.json(
      { user: { id: user.id, email: user.email, username: user.username, name: user.name } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
