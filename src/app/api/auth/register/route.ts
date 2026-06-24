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

    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const slug = username || generateSlug(name)
    const existingUsername = await db.user.findUnique({ where: { username: slug } })
    const finalUsername = existingUsername
      ? `${slug}-${Math.random().toString(36).slice(2, 6)}`
      : slug

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username: finalUsername,
        credits: 10,
      },
      select: { id: true, email: true, username: true, name: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
