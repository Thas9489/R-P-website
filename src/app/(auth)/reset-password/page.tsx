'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { toast } from 'sonner'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

type PageState = 'loading' | 'ready' | 'invalid' | 'success'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const supabase = createBrowserClient()

    // PKCE flow (Supabase default): reset link delivers ?code= in the URL
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        setPageState(error ? 'invalid' : 'ready')
      })
      return
    }

    // Legacy implicit flow: token arrives in the URL hash and fires PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPageState('ready')
    })

    // If the user already has an active recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPageState('ready')
    })

    // If nothing resolves in 4 s, the link is invalid or expired
    const timeout = setTimeout(() => {
      setPageState((prev) => (prev === 'loading' ? 'invalid' : prev))
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const onSubmit = async (data: FormValues) => {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      toast.error(error.message || 'Failed to update password. Please try again.')
      return
    }
    setPageState('success')
    setTimeout(() => router.replace('/login'), 3000)
  }

  return (
    <div className="flex min-h-[460px] items-center justify-center px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto"
      >
        {/* Loading */}
        {pageState === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your reset link…</p>
          </div>
        )}

        {/* Invalid / expired link */}
        {pageState === 'invalid' && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Link expired or invalid</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              This password reset link has expired or already been used.<br />
              Please request a new one.
            </p>
            <button
              onClick={() => router.replace('/forgot-password')}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25"
            >
              Request new link
            </button>
          </div>
        )}

        {/* Password form */}
        {pageState === 'ready' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
              <KeyRound className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Set new password
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Choose a strong password — at least 8 characters.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              {/* New password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('confirm')}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1.5 text-xs text-red-500">{errors.confirm.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </button>
            </form>
          </>
        )}

        {/* Success */}
        {pageState === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password updated!</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Your password has been changed successfully.<br />
              Redirecting you to sign in…
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
