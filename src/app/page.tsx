'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  Download,
  Search,
  Target,
  Layout,
  User2,
  Rocket,
  ArrowRight,
  Check,
  Star,
  Github,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

/* ─── Reusable animation helpers ─── */
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature data ─── */
const features = [
  {
    icon: Sparkles,
    title: 'AI Resume Builder',
    description: 'Let AI craft compelling bullet points and summaries tailored to every job you apply for.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    glow: 'group-hover:shadow-blue-500/20',
    border: 'group-hover:border-blue-500/40',
  },
  {
    icon: Globe,
    title: 'Portfolio Generator',
    description: 'Publish a stunning personal site in seconds — no code required, fully customisable.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    glow: 'group-hover:shadow-purple-500/20',
    border: 'group-hover:border-purple-500/40',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Download pixel-perfect, ATS-friendly PDFs that look great on every recruiter\'s screen.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    glow: 'group-hover:shadow-green-500/20',
    border: 'group-hover:border-green-500/40',
  },
  {
    icon: Search,
    title: 'Job Search',
    description: 'Browse 500+ new listings daily, filtered by role, salary, and location — all in one place.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    glow: 'group-hover:shadow-orange-500/20',
    border: 'group-hover:border-orange-500/40',
  },
  {
    icon: Target,
    title: 'ATS Optimizer',
    description: 'Score your resume against real job descriptions and fix gaps before you ever hit send.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    glow: 'group-hover:shadow-red-500/20',
    border: 'group-hover:border-red-500/40',
  },
  {
    icon: Layout,
    title: 'Template Library',
    description: '20+ professionally designed templates for every industry — from tech to creative.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    glow: 'group-hover:shadow-indigo-500/20',
    border: 'group-hover:border-indigo-500/40',
  },
];

/* ─── Template data ─── */
const templates = [
  { name: 'Modern', headerColor: 'from-blue-600 to-cyan-500', accent: 'bg-blue-500' },
  { name: 'Minimal', headerColor: 'from-gray-700 to-gray-500', accent: 'bg-gray-500' },
  { name: 'Creative', headerColor: 'from-purple-600 to-pink-500', accent: 'bg-purple-500' },
  { name: 'Developer', headerColor: 'from-green-600 to-emerald-500', accent: 'bg-green-500' },
  { name: 'Executive', headerColor: 'from-amber-600 to-orange-500', accent: 'bg-amber-500' },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote:
      'ResumeAI completely transformed my job search. I went from zero callbacks to three interviews in my first week after rebuilding my resume with it.',
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'Stripe',
    initials: 'SC',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    quote:
      'The ATS optimizer is a game-changer. I finally understand why my old resume was getting filtered out — and the AI suggestions are genuinely great.',
    name: 'Marcus Williams',
    role: 'Senior Engineer',
    company: 'Shopify',
    initials: 'MW',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    quote:
      'I built my portfolio and resume in under 30 minutes. Landed a design role at my dream company a month later. Worth every penny.',
    name: 'Priya Nair',
    role: 'UX Designer',
    company: 'Airbnb',
    initials: 'PN',
    gradient: 'from-green-500 to-emerald-400',
  },
];

/* ─── Pricing ─── */
const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['10 AI credits / month', '1 resume', 'Basic templates', 'PDF export', 'ATS score'],
    cta: 'Get Started',
    href: '/register',
    popular: false,
    cardClass:
      'glass-card rounded-2xl p-8 flex flex-col border border-border hover:border-blue-500/30 transition-all duration-300',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For serious job seekers',
    features: [
      '100 AI credits / month',
      'Unlimited resumes',
      'All premium templates',
      'Portfolio website',
      'Priority ATS analysis',
      'Job search integration',
    ],
    cta: 'Start Free Trial',
    trial: 'Free for 14 days · then $9/month · cancel anytime',
    href: '/register?plan=pro',
    popular: true,
    cardClass:
      'relative rounded-2xl p-8 flex flex-col bg-gradient-to-b from-blue-600/10 to-purple-600/10 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-105',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For teams & organisations',
    features: [
      'Unlimited everything',
      'Team collaboration',
      'Custom branding',
      'Priority support',
      'Dedicated account manager',
      'SSO & advanced security',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
    cardClass:
      'glass-card rounded-2xl p-8 flex flex-col border border-border hover:border-purple-500/30 transition-all duration-300',
  },
];

/* ══════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ── */}
      <section
        id="home"
        className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 pt-20 pb-32 overflow-hidden"
      >
        {/* Gradient blobs */}
        <div
          aria-hidden
          className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-600/20 dark:bg-blue-500/10 blur-[120px] pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-purple-600/20 dark:bg-purple-500/10 blur-[120px] pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] max-w-[380px] max-h-[380px] rounded-full bg-cyan-500/10 dark:bg-cyan-400/5 blur-[90px] pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-8 select-none">
              <Sparkles size={14} className="shrink-0" />
              AI-Powered Career Platform
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-6"
          >
            Build Your Career Story
            <br />
            with{' '}
            <span className="gradient-text">AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-10"
          >
            Write ATS-beating resumes, generate a portfolio that turns heads,
            <br className="hidden sm:block" />
            and land interviews — all powered by AI that knows what recruiters want.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-14"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 active:scale-95"
            >
              Start for Free
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 active:scale-95"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap justify-center items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 mb-16"
          >
            {['10k+ Resumes Created', '500+ Jobs Daily', '98% ATS Score'].map((stat, i) => (
              <span key={stat} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />}
                <span className="text-gray-600 dark:text-gray-300">{stat}</span>
              </span>
            ))}
          </motion.div>

          {/* Floating resume card mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-6 border border-white/60 dark:border-gray-700/60"
            >
              {/* Resume mockup header */}
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-gray-700 mb-2" />
                  <div className="h-3.5 w-48 rounded bg-gray-100 dark:bg-gray-800 mb-1.5" />
                  <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                  98% ATS
                </span>
              </div>

              {/* Resume body skeleton rows */}
              <div className="pt-4 space-y-4">
                {[
                  { labelW: 'w-16', lines: ['w-full', 'w-5/6', 'w-4/6'] },
                  { labelW: 'w-20', lines: ['w-full', 'w-3/4'] },
                ].map((section, si) => (
                  <div key={si}>
                    <div className={`h-3 ${section.labelW} rounded bg-blue-200 dark:bg-blue-900/60 mb-2`} />
                    <div className="space-y-1.5">
                      {section.lines.map((w, li) => (
                        <div key={li} className={`h-2.5 ${w} rounded bg-gray-100 dark:bg-gray-800`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI badge overlay */}
              <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-lg">
                <Sparkles size={11} />
                AI Enhanced
              </div>
            </motion.div>

            {/* Glow beneath card */}
            <div
              aria-hidden
              className="absolute inset-x-12 bottom-0 h-12 bg-blue-500/20 dark:bg-blue-400/10 blur-2xl rounded-full pointer-events-none"
            />
          </motion.div>
        </div>
      </section>

      {/* ── 2. FEATURES GRID ── */}
      <section
        id="features"
        className="py-28 px-4 bg-gray-50/60 dark:bg-gray-900/40"
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
              Everything you need
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              The full career toolkit,{' '}
              <span className="gradient-text">in one place</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              From resume to portfolio to job offer — every tool you need to land your next role.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <FadeUp key={feature.title} delay={i * 0.08}>
                  <div
                    className={`group glass-card rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-xl ${feature.glow} ${feature.border} cursor-default`}
                  >
                    <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                      <Icon size={22} className={feature.color} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-20">
            <span className="inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3">
              Simple process
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Three steps to your{' '}
              <span className="gradient-text">dream job</span>
            </h2>
          </FadeUp>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dashed connector line (desktop only) */}
            <div
              aria-hidden
              className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700 z-0"
            />

            {[
              {
                step: '01',
                icon: User2,
                title: 'Fill in your details',
                description:
                  'Add your experience, skills, and goals. Our smart form guides you every step of the way.',
                color: 'from-blue-500 to-cyan-500',
                iconBg: 'bg-blue-50 dark:bg-blue-950/50',
                iconColor: 'text-blue-600 dark:text-blue-400',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI enhances everything',
                description:
                  'Our AI rewrites your bullet points, optimises for ATS, and matches the tone of your target roles.',
                color: 'from-purple-500 to-pink-500',
                iconBg: 'bg-purple-50 dark:bg-purple-950/50',
                iconColor: 'text-purple-600 dark:text-purple-400',
              },
              {
                step: '03',
                icon: Rocket,
                title: 'Apply & get hired',
                description:
                  'Export your resume, publish your portfolio, and apply directly from the built-in job board.',
                color: 'from-green-500 to-emerald-500',
                iconBg: 'bg-green-50 dark:bg-green-950/50',
                iconColor: 'text-green-600 dark:text-green-400',
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeUp key={step.step} delay={i * 0.12} className="relative z-10">
                  <div className="flex flex-col items-center text-center">
                    {/* Step number circle */}
                    <div
                      className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6`}
                    >
                      <Icon size={28} className="text-white" />
                      <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold flex items-center justify-center shadow">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm max-w-xs">
                      {step.description}
                    </p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. RESUME TEMPLATES ── */}
      <section className="py-28 px-4 bg-gray-50/60 dark:bg-gray-900/40 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="inline-block text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">
              Design library
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Templates built to{' '}
              <span className="gradient-text">impress</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Choose from 20+ professionally designed templates. Every one is ATS-ready and fully customisable.
            </p>
          </FadeUp>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-5 gap-5 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {templates.map((tpl, i) => (
              <FadeUp key={tpl.name} delay={i * 0.07} className="shrink-0 w-44 md:w-auto">
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="glass-card rounded-2xl overflow-hidden border border-border cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Colored header bar */}
                  <div className={`h-24 bg-gradient-to-br ${tpl.headerColor} relative`}>
                    {/* Simulated content lines in header */}
                    <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                      <div className="h-2 w-3/4 rounded-sm bg-white/30" />
                      <div className="h-1.5 w-1/2 rounded-sm bg-white/20" />
                    </div>
                  </div>

                  {/* Card body skeleton */}
                  <div className="p-3 space-y-2">
                    <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-2 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-2 w-4/6 rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-2 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>

                  {/* Template name badge */}
                  <div className="px-3 pb-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white ${tpl.accent}`}>
                      {tpl.name}
                    </span>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS ── */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3">
              Success stories
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Loved by job seekers{' '}
              <span className="gradient-text">worldwide</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-7 border border-border hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-300 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm flex-1 mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.role} · {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PRICING ── */}
      <section
        id="pricing"
        className="py-28 px-4 bg-gray-50/60 dark:bg-gray-900/40"
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
              Transparent pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Plans that grow with{' '}
              <span className="gradient-text">your career</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Start free. Upgrade when you need more AI power. Cancel any time.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {plans.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <div className={plan.cardClass}>
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30">
                        <Star size={11} className="fill-white" />
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm pb-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-green-600 dark:text-green-400 stroke-[3]" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.href}
                    className={`block text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                        : 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  {'trial' in plan && plan.trial && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {plan.trial as string}
                    </p>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA BANNER ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-1 shadow-2xl shadow-purple-500/20">
              <div className="rounded-[20px] bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-cyan-600/90 px-8 py-16 text-center">
                {/* Decorative blobs inside */}
                <div
                  aria-hidden
                  className="absolute top-[-20%] left-[-10%] w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none"
                />
                <div
                  aria-hidden
                  className="absolute bottom-[-20%] right-[-10%] w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none"
                />

                <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Ready to land your dream job?
                </h2>
                <p className="relative text-blue-100 text-lg mb-10 max-w-lg mx-auto">
                  Join 10,000+ professionals who have already transformed their careers with ResumeAI.
                </p>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative inline-block"
                >
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-white text-gray-900 hover:bg-blue-50 shadow-2xl transition-colors duration-200"
                  >
                    Start Building — It&apos;s Free
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>

                <p className="relative mt-4 text-sm text-blue-200">
                  No credit card required · Free forever plan available
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 8. FOOTER ── */}
      <footer className="border-t border-border bg-white dark:bg-gray-950 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Resume</span>
              <span className="text-xl font-bold gradient-text">AI</span>
            </Link>

            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Login', href: '/login' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Divider + copyright */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} ResumeAI. All rights reserved.
            </p>
            <div className="flex gap-5 text-xs text-gray-400 dark:text-gray-500">
              <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
