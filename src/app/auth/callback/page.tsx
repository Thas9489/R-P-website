'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
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

      const result = await signIn('supabase-oauth', {
        email: session.user.email,
        accessToken: session.access_token,
        redirect: false,
      })

      if (result?.error) {
        router.replace('/login?error=OAuthCallback')
      } else {
        router.replace('/dashboard')
      }
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
