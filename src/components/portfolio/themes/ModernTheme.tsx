'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  ExternalLink,
  Download,
  ChevronDown,
  MapPin,
  Phone,
  Globe,
  Menu,
  X,
} from 'lucide-react'
import type { ResumeData } from '@/types'

interface ModernThemeProps {
  resumeData: ResumeData
  slug?: string
}

// ── Typewriter hook ────────────────────────────────────────────────────────────
function useTypewriter(texts: string[], speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!texts.length) return
    const current = texts[textIndex]
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIndex < current.length) {
            setDisplayed(current.slice(0, charIndex + 1))
            setCharIndex((c) => c + 1)
          } else {
            setTimeout(() => setDeleting(true), pause)
          }
        } else {
          if (charIndex > 0) {
            setDisplayed(current.slice(0, charIndex - 1))
            setCharIndex((c) => c - 1)
          } else {
            setDeleting(false)
            setTextIndex((i) => (i + 1) % texts.length)
          }
        }
      },
      deleting ? speed / 2 : speed,
    )
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, textIndex, texts, speed, pause])

  return displayed
}

// ── Fade-in section wrapper ────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Skill chip color map ───────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  Frontend: 'bg-blue-100 text-blue-800',
  Backend: 'bg-green-100 text-green-800',
  Database: 'bg-purple-100 text-purple-800',
  DevOps: 'bg-orange-100 text-orange-800',
  Mobile: 'bg-pink-100 text-pink-800',
  Design: 'bg-yellow-100 text-yellow-800',
  default: 'bg-indigo-100 text-indigo-800',
}

function categoryColor(cat?: string) {
  if (!cat) return categoryColors.default
  return categoryColors[cat] ?? categoryColors.default
}

export default function ModernTheme({ resumeData, slug }: ModernThemeProps) {
  const {
    personalInfo,
    summary,
    experience = [],
    projects = [],
    skills = [],
    education = [],
  } = resumeData
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [cvDownloading, setCvDownloading] = useState(false)

  const handleDownloadCV = async () => {
    setCvDownloading(true)
    try {
      const React = (await import('react')).default
      const { pdf } = await import('@react-pdf/renderer')
      const { ResumePDFDocument } = await import('@/components/resume/ResumePDFDocument')
      const element = React.createElement(ResumePDFDocument, { resumeData })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(personalInfo?.name || 'CV').replace(/\s+/g, '_')}_CV.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      // silent fallback
    } finally {
      setCvDownloading(false)
    }
  }
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(15,23,42,0)', 'rgba(15,23,42,0.97)'])

  const jobTitles = [
    personalInfo.title,
    ...experience.slice(0, 3).map((e) => e.position),
  ].filter(Boolean)
  const typewritten = useTypewriter(jobTitles)

  // Scroll spy
  useEffect(() => {
    const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { threshold: 0.4 },
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  // Grouped skills
  const skillGroups = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const cat = s.category ?? 'Other'
    acc[cat] = [...(acc[cat] ?? []), s]
    return acc
  }, {})

  const navLinks = ['about', 'experience', 'projects', 'skills', 'contact']

  const yearsExp =
    experience.length > 0
      ? new Date().getFullYear() -
        Math.min(...experience.map((e) => new Date(e.startDate).getFullYear()))
      : 0

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ── Sticky Navbar ──────────────────────────────────────────────────────── */}
      <motion.header
        style={{ backgroundColor: navBg }}
        className="fixed top-0 inset-x-0 z-50 transition-colors"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => scrollTo('hero')}
            className="text-white font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            {personalInfo.name.split(' ')[0]}
            <span className="text-indigo-400">.</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className={`text-sm capitalize transition-colors ${
                  activeSection === link
                    ? 'text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link}
              </button>
            ))}
            <button
              onClick={handleDownloadCV}
              disabled={cvDownloading}
              className="ml-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-500 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> {cvDownloading ? '…' : 'CV'}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800 px-6 pb-6 pt-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-slate-300 hover:text-white text-left capitalize text-sm"
              >
                {link}
              </button>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* ── HERO ───────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden"
      >
        {/* Decorative shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 right-12 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-24 left-12 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-1/3 left-1/4 w-4 h-4 bg-indigo-400 rounded-full opacity-60 pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-40 pointer-events-none"
        />

        <div className="relative max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-indigo-400 font-medium tracking-widest text-sm uppercase mb-4">
              Hello, I&apos;m
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              {personalInfo.name}
            </h1>
            <div className="h-12 mb-6 flex items-center">
              <span className="text-2xl text-indigo-300 font-medium">
                {typewritten}
                <span className="animate-pulse">|</span>
              </span>
            </div>
            {summary && (
              <p className="text-slate-400 leading-relaxed max-w-md mb-8 text-base">
                {summary.slice(0, 180)}{summary.length > 180 ? '…' : ''}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDownloadCV}
                disabled={cvDownloading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                {cvDownloading ? 'Generating…' : 'Download CV'}
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-200 hover:border-indigo-500 hover:text-white font-semibold rounded-xl transition-all"
              >
                Contact Me
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Social icons */}
            <div className="flex gap-4 mt-8">
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {personalInfo.twitter && (
                <a
                  href={personalInfo.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {personalInfo.email && (
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Profile photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl shadow-indigo-900/60">
                {personalInfo.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={personalInfo.profileImage}
                    alt={personalInfo.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-6xl font-bold text-white">
                    {personalInfo.name.charAt(0)}
                  </div>
                )}
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-4 bg-white text-slate-900 px-4 py-2 rounded-2xl shadow-xl text-sm font-bold"
              >
                {yearsExp}+ Years Exp.
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-slate-500" />
        </motion.div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">About Me</h2>
            <div className="w-16 h-1 bg-indigo-600 rounded mb-12" />
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Photo */}
            <FadeIn delay={0.1}>
              <div className="relative">
                <div className="w-full aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                  {personalInfo.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={personalInfo.profileImage}
                      alt={personalInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-indigo-300">
                      {personalInfo.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Decorative accent */}
                <div className="absolute -bottom-4 -right-4 w-full h-full max-w-sm rounded-3xl border-2 border-indigo-200 -z-10" />
              </div>
            </FadeIn>

            {/* Content */}
            <FadeIn delay={0.2}>
              <p className="text-slate-600 leading-relaxed text-lg mb-8">{summary}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Years Experience', value: `${yearsExp}+` },
                  { label: 'Projects', value: `${projects.length}+` },
                  { label: 'Technologies', value: `${skills.length}+` },
                  { label: 'Education', value: `${education.length}` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
                  >
                    <div className="text-3xl font-bold text-indigo-600">{value}</div>
                    <div className="text-sm text-slate-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    {personalInfo.location}
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <a
                      href={personalInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {personalInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ─────────────────────────────────────────────────────────── */}
      <section id="experience" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Experience</h2>
            <div className="w-16 h-1 bg-indigo-600 rounded mb-12" />
          </FadeIn>

          <div className="relative">
            {/* Center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />

            <div className="space-y-12">
              {experience.map((exp, i) => {
                const isLeft = i % 2 === 0
                return (
                  <FadeIn key={exp.id} delay={i * 0.1}>
                    <div
                      className={`md:grid md:grid-cols-2 gap-8 items-center relative ${isLeft ? '' : ''}`}
                    >
                      {/* Dot */}
                      <div className="hidden md:block absolute left-1/2 top-6 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-md -translate-x-1/2 z-10" />

                      {/* Left / Right card */}
                      <div className={`${isLeft ? 'md:pr-12' : 'md:col-start-2 md:pl-12'}`}>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{exp.position}</h3>
                              <p className="text-indigo-600 font-medium">{exp.company}</p>
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-4 mt-1">
                              {exp.startDate} –{exp.current ? ' Present' : ` ${exp.endDate}`}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </div>
                          )}
                          <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                          {exp.achievements?.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {exp.achievements.slice(0, 3).map((a, ai) => (
                                <li key={ai} className="text-xs text-slate-500 flex gap-2">
                                  <span className="text-indigo-400 mt-0.5">▸</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Empty column for alternating */}
                      {isLeft && <div className="hidden md:block" />}
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ───────────────────────────────────────────────────────────── */}
      <section id="projects" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Projects</h2>
            <div className="w-16 h-1 bg-indigo-600 rounded mb-12" />
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <FadeIn key={project.id} delay={i * 0.08}>
                <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
                  {/* Top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">
                      {project.description}
                    </p>
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(project.technologies ?? []).slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {/* Links */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" /> Code
                        </a>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ─────────────────────────────────────────────────────────────── */}
      <section id="skills" className="py-24 bg-gradient-to-br from-slate-900 to-indigo-950">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-2">Skills</h2>
            <div className="w-16 h-1 bg-indigo-500 rounded mb-12" />
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(skillGroups).map(([category, catSkills], i) => (
              <FadeIn key={category} delay={i * 0.1}>
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <h3 className="text-indigo-300 font-semibold text-sm uppercase tracking-widest mb-4">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor(skill.category)}`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Get In Touch</h2>
            <div className="w-16 h-1 bg-indigo-600 rounded mb-4" />
            <p className="text-slate-500 mb-12">
              I&apos;m currently open to new opportunities. Whether you have a question or just want to
              say hi, I&apos;ll do my best to get back to you!
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <FadeIn delay={0.1}>
              <ContactForm email={personalInfo.email} />
            </FadeIn>

            {/* Social links */}
            <FadeIn delay={0.2}>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 text-lg mb-6">Connect with me</h3>
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: personalInfo.email,
                    href: `mailto:${personalInfo.email}`,
                    color: 'text-red-500',
                  },
                  {
                    icon: Github,
                    label: 'GitHub',
                    value: personalInfo.github,
                    href: personalInfo.github,
                    color: 'text-slate-700',
                  },
                  {
                    icon: Linkedin,
                    label: 'LinkedIn',
                    value: personalInfo.linkedin,
                    href: personalInfo.linkedin,
                    color: 'text-blue-600',
                  },
                  {
                    icon: Twitter,
                    label: 'Twitter',
                    value: personalInfo.twitter,
                    href: personalInfo.twitter,
                    color: 'text-sky-500',
                  },
                ]
                  .filter((s) => s.value)
                  .map(({ icon: Icon, label, value, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-sm font-medium text-slate-700 truncate max-w-xs">
                          {value}
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-sm">
        <p>
          Built with ResumeAI &middot; &copy; {new Date().getFullYear()} {personalInfo.name}
        </p>
      </footer>
    </div>
  )
}

// ── Contact Form (sub-component) ───────────────────────────────────────────────
function ContactForm({ email }: { email: string }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    // Mailto fallback — replace with API call as needed
    await new Promise((r) => setTimeout(r, 800))
    window.location.href = `mailto:${email}?subject=Portfolio Contact from ${form.name}&body=${encodeURIComponent(form.message)}`
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="font-bold text-slate-800 text-xl mb-2">Message sent!</h3>
          <p className="text-slate-500 text-sm">I&apos;ll get back to you as soon as possible.</p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-indigo-600 text-sm hover:underline"
          >
            Send another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          placeholder="Jane Smith"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          placeholder="jane@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
          placeholder="Hi! I&apos;d love to chat about..."
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
      >
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
