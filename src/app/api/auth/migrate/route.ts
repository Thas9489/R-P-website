import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getServerSupabase } from '@/lib/supabase'

/**
 * Seamlessly migrates legacy email/password users to Supabase Auth.
 * Called when signInWithPassword fails because the user predates Supabase Auth.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Verify against our legacy bcrypt hash
    const dbUser = await db.user.findByEmail(email)
    if (!dbUser?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, dbUser.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create Supabase Auth account using service role (bypasses email confirmation)
    const adminSb = getServerSupabase()
    const { error: createError } = await adminSb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError && !createError.message.includes('already been registered')) {
      console.error('[MIGRATE]', createError)
      return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
    }

    // Clear legacy password from our DB
    await db.user.update(dbUser.id, { password: null })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MIGRATE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
