'use client'

import { createContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export interface AppUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  credits: number
  username: string | null
}

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  refresh: () => Promise<void>
}

export const SupabaseAuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
})

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()

    // Initial session check
    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      if (sbUser) {
        fetchProfile().finally(() => setLoading(false))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile()
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const refresh = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  return (
    <SupabaseAuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}
