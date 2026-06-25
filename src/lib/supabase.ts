import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export type TypedClient = ReturnType<typeof createClient<Database>>

// Browser/client-side client (anon key, respects RLS)
export function createBrowserClient(): TypedClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server-side admin client (service role key, bypasses RLS)
// Only use in API routes / server components — never expose to browser
export function createServerClient(): TypedClient {
  const key = supabaseServiceKey || supabaseAnonKey
  return createClient<Database>(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Singleton for server use
let _server: TypedClient | null = null
export function getServerSupabase(): TypedClient {
  if (!_server) _server = createServerClient()
  return _server
}
