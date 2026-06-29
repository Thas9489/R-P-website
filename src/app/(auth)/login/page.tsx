'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, CheckCircle2, Sparkles, FileText, Target, Search } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const GOOGLE_SVG = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const GITHUB_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        // Attempt seamless migration for users registered before Supabase Auth
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          const migRes = await fetch('/api/auth/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password }),
          })
          if (migRes.ok) {
            // Migration succeeded — try signing in again
            const { error: retryErr } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            })
            if (retryErr) {
              toast.error('Invalid email or password. Please try again.')
              return
            }
          } else {
            toast.error('Invalid email or password. Please try again.')
            return
          }
        } else {
          toast.error(error.message)
          return
        }
      }
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setOauthLoading(provider)
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch {
      toast.error('OAuth sign in failed. Please try again.')
      setOauthLoading(null)
    }
  }

  return (
    <div className="flex min-h-[600px]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-400/10 blur-2xl pointer-events-none" />

        {/* Top content */}
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-10 border border-white/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Land your dream job with an AI‑powered resume
          </h2>
          <p className="mt-4 text-white/70 text-base leading-relaxed">
            ResumeAI helps you build ATS‑optimised resumes in minutes and manage your entire job search in one place.
          </p>

          <ul className="mt-8 space-y-3.5">
            {[
              { icon: Sparkles, text: 'AI‑generated bullet points & summaries' },
              { icon: Target, text: 'Real‑time ATS compatibility scoring' },
              { icon: Search, text: 'Live job listings matched to your skills' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats + testimonial */}
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '10k+', label: 'Resumes created' },
              { value: '94%', label: 'Interview success rate' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/65 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-300 fill-amber-300" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed italic">
              "ResumeAI helped me land 3 interviews in my first week. The AI suggestions were spot‑on."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">S</div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah K.</p>
                <p className="text-white/60 text-xs">Software Engineer at Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back 👋
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Sign in to continue building your career
          </p>

          {/* OAuth */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || isSubmitting}
              className="flex items-center justify-center gap-2.5 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : GOOGLE_SVG}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading || isSubmitting}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : GITHUB_SVG}
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="mt-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!oauthLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in to your account
            </button>
          </form>

          {/* Features reminder */}
          <div className="mt-6 flex items-center justify-center gap-6 lg:hidden">
            {[
              { icon: CheckCircle2, text: 'Free forever' },
              { icon: CheckCircle2, text: 'No credit card' },
              { icon: CheckCircle2, text: 'Cancel anytime' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1 text-xs text-gray-500">
                <Icon className="w-3.5 h-3.5 text-green-500" />
                {text}
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
