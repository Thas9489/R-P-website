'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = createBrowserClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session?.user?.email) {
        router.replace('/login?error=OAuthCallback')
        return
      }

      // Ensure the user exists in our public.users table
      const email = session.user.email
      const name =
        (session.user.user_metadata?.full_name as string) ||
        (session.user.user_metadata?.name as string) ||
        email.split('@')[0]
      const image = (session.user.user_metadata?.avatar_url as string) || null

      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, image }),
      })

      router.replace('/dashboard')
    }

    handle()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Signing you in…</p>
      </div>
    </div>
  )
}
