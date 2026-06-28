'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { createBrowserClient } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, CheckCircle2, FileText, Sparkles, Globe, Download } from 'lucide-react'

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30)
}

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms of Service to continue' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' }
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500' }
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-600' }
  return { score, label: 'Strong', color: 'bg-green-500', text: 'text-green-600' }
}

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

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [passwordValue, setPasswordValue] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: undefined as unknown as true },
  })

  const watchedName = watch('name')
  useEffect(() => {
    if (watchedName) setValue('username', slugify(watchedName), { shouldValidate: false })
  }, [watchedName, setValue])

  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, username: data.username, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Registration failed. Please try again.')
        return
      }
      toast.success('Account created! Signing you in…')
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false })
      if (result?.error) {
        toast.error('Account created but sign-in failed. Please log in manually.')
        router.push('/login')
        return
      }
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
      toast.error('OAuth sign up failed. Please try again.')
      setOauthLoading(null)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"

  return (
    <div className="flex min-h-[680px]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[38%] flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-10 border border-white/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Your career journey starts here
          </h2>
          <p className="mt-4 text-white/70 text-base leading-relaxed">
            Join thousands of professionals using ResumeAI to craft standout resumes and land their dream roles faster.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: Sparkles, text: 'AI-generated bullet points & summaries', sub: 'Tailored to every job description' },
              { icon: Globe, text: 'Instant portfolio website', sub: 'Live at your own URL in seconds' },
              { icon: Download, text: 'ATS-optimised PDF export', sub: 'Pass automated screening systems' },
            ].map(({ icon: Icon, text, sub }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{text}</p>
                  <p className="text-xs text-white/60 mt-0.5">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { value: '10k+', label: 'Resumes created' },
            { value: '94%', label: 'Interview rate' },
            { value: 'Free', label: 'No credit card needed' },
            { value: '5 min', label: 'Average setup time' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-white/65 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Free forever — no credit card required
          </p>

          {/* OAuth */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || isSubmitting}
              className="flex items-center justify-center gap-2.5 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {/* Row 1: Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className={labelClass}>Full name</label>
                <input id="name" type="text" autoComplete="name" placeholder="Jane Smith" {...register('name')} className={inputClass} />
                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className={labelClass}>Email address</label>
                <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} className={inputClass} />
                {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className={labelClass}>Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none font-medium">@</span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="jane-smith"
                  {...register('username')}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>
              {errors.username
                ? <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
                : <p className="mt-1.5 text-xs text-gray-400">Your portfolio: <span className="font-medium text-gray-500">{watch('username') || 'username'}</span>.resumeai.com</p>
              }
            </div>

            {/* Row 2: Password + Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    {...register('password', { onChange: (e) => setPasswordValue(e.target.value) })}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordValue && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`h-1 flex-1 rounded-full transition-colors ${strength.score >= step ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Strength: <span className={strength.text}>{strength.label}</span></p>
                  </div>
                )}
                {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    {...register('confirmPassword')}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label={showConfirm ? 'Hide' : 'Show'}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('terms')}
                  className="mt-0.5 w-4 h-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                  I agree to the{' '}
                  <Link href="/terms" className="text-violet-600 dark:text-violet-400 hover:underline font-semibold">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-violet-600 dark:text-violet-400 hover:underline font-semibold">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-xs text-red-500">{errors.terms.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !!oauthLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none mt-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create my free account
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-5 flex items-center justify-center gap-6">
            {[
              { icon: CheckCircle2, text: 'Free forever' },
              { icon: CheckCircle2, text: 'No credit card' },
              { icon: CheckCircle2, text: 'Cancel anytime' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
