import { cookies } from 'next/headers'
import { createRequestClient } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { UserRow } from '@/types/supabase'

/**
 * Returns the authenticated user from the Supabase session cookie.
 * Works in API routes and server components.
 */
export async function getUser(): Promise<UserRow | null> {
  const cookieStore = cookies()
  const supabase = createRequestClient(cookieStore)

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user?.email) return null

  return db.user.findByEmail(user.email)
}
