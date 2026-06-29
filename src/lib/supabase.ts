import { createClient } from '@supabase/supabase-js'
import {
  createServerClient as createSSRServerClient,
  createBrowserClient as createSSRBrowserClient,
} from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import type { CookieOptions } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export type TypedClient = ReturnType<typeof createClient<Database>>

// Browser client — session stored in cookies (SSR-compatible)
export function createBrowserClient() {
  return createSSRBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server client for API routes — reads session from request cookies
export function createRequestClient(cookieStore: {
  getAll(): { name: string; value: string }[]
  set(name: string, value: string, options?: CookieOptions): void
}) {
  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Can't set cookies in RSC — ignored
        }
      },
    },
  })
}

// Admin client (service role, bypasses RLS) — server only
let _server: TypedClient | null = null
export function getServerSupabase(): TypedClient {
  if (!_server) {
    _server = createClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _server
}

// Alias kept for db.ts compatibility
export { getServerSupabase as createServerClient }
