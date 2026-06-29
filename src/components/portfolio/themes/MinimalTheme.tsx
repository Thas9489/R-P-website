'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Github, Linkedin, Twitter, Mail, ExternalLink, MapPin, Globe } from 'lucide-react'
import type { ResumeData } from '@/types'

interface MinimalThemeProps {
  resumeData: ResumeData
  slug?: string
}

// ── Subtle fade-in ─────────────────────────────────────────────────────────────
function Fade({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-8">{children}</h2>
  )
}

export default function MinimalTheme({ resumeData }: MinimalThemeProps) {
  const {
    personalInfo,
    summary,
    experience = [],
    projects = [],
    skills = [],
    education = [],
  } = resumeData
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Grouped skills
  const skillGroups = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const cat = s.category ?? 'Other'
    acc[cat] = [...(acc[cat] ?? []), s]
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* ── Nav ───────────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 bg-white transition-all ${
          navScrolled ? 'border-b border-slate-100 shadow-sm' : ''
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold tracking-tight text-slate-900">
            {personalInfo.name}
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
            {['about', 'experience', 'projects', 'skills'].map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="capitalize hover:text-slate-900 transition-colors"
              >
                {link}
              </button>
            ))}
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Contact
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-20">
        {/* ── HERO ─────────────────────────────────────────────────────────────── */}
        <section id="hero">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
              {personalInfo.name}
            </h1>
            <p className="text-xl text-blue-600 font-medium mb-4">{personalInfo.title}</p>
            {summary && (
              <p className="text-slate-500 leading-relaxed max-w-2xl text-base mb-6">{summary}</p>
            )}

            {/* Contact links */}
            <div className="flex flex-wrap gap-4 text-sm">
              {personalInfo.location && (
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {personalInfo.location}
                </span>
              )}
              {personalInfo.email && (
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {personalInfo.email}
                </a>
              )}
              {personalInfo.website && (
                <a
                  href={personalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
              {personalInfo.twitter && (
                <a
                  href={personalInfo.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-sky-500 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  Twitter
                </a>
              )}
            </div>
          </motion.div>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────────── */}
        {experience.length > 0 && (
          <section id="experience">
            <Fade>
              <SectionHeading>Experience</SectionHeading>
              <div className="space-y-8">
                {experience.map((exp, i) => (
                  <Fade key={exp.id} delay={i * 0.06}>
                    <div className="grid sm:grid-cols-[120px_1fr] gap-4">
                      {/* Year column */}
                      <div className="text-sm text-slate-400 tabular-nums pt-0.5">
                        {new Date(exp.startDate).getFullYear()}
                        {' – '}
                        {exp.current ? 'now' : new Date(exp.endDate).getFullYear()}
                      </div>
                      {/* Content */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                          <span className="text-slate-400 text-sm">at</span>
                          <span className="text-blue-600 text-sm font-medium">{exp.company}</span>
                          {exp.location && (
                            <span className="text-slate-400 text-xs">· {exp.location}</span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">{exp.description}</p>
                        {exp.achievements?.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {exp.achievements.slice(0, 3).map((a, ai) => (
                              <li key={ai} className="text-xs text-slate-400 flex gap-2">
                                <span className="text-blue-400">—</span>
                                {a}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    {i < experience.length - 1 && (
                      <div className="mt-8 border-b border-slate-100" />
                    )}
                  </Fade>
                ))}
              </div>
            </Fade>
          </section>
        )}

        {/* ── EDUCATION ────────────────────────────────────────────────────────── */}
        {education.length > 0 && (
          <section id="about">
            <Fade>
              <SectionHeading>Education</SectionHeading>
              <div className="space-y-6">
                {education.map((edu, i) => (
                  <Fade key={edu.id} delay={i * 0.06}>
                    <div className="grid sm:grid-cols-[120px_1fr] gap-4">
                      <div className="text-sm text-slate-400 tabular-nums pt-0.5">
                        {new Date(edu.startDate).getFullYear()}
                        {' – '}
                        {edu.current ? 'now' : new Date(edu.endDate).getFullYear()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {edu.degree} in {edu.field}
                        </h3>
                        <p className="text-blue-600 text-sm">{edu.institution}</p>
                        {edu.gpa && (
                          <p className="text-xs text-slate-400 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    </div>
                  </Fade>
                ))}
              </div>
            </Fade>
          </section>
        )}

        {/* ── PROJECTS ─────────────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <section id="projects">
            <Fade>
              <SectionHeading>Projects</SectionHeading>
              <div className="space-y-6">
                {projects.map((proj, i) => (
                  <Fade key={proj.id} delay={i * 0.06}>
                    <div className="flex items-start justify-between gap-4 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {proj.name}
                          </h3>
                          {proj.featured && (
                            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-500 border border-blue-200 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-2">
                          {proj.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(proj.technologies ?? []).join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 mt-0.5">
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    {i < projects.length - 1 && (
                      <div className="mt-6 border-b border-slate-100" />
                    )}
                  </Fade>
                ))}
              </div>
            </Fade>
          </section>
        )}

        {/* ── SKILLS ───────────────────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <section id="skills">
            <Fade>
              <SectionHeading>Skills</SectionHeading>
              <div className="space-y-4">
                {Object.entries(skillGroups).map(([category, catSkills], i) => (
                  <Fade key={category} delay={i * 0.06}>
                    <div className="grid sm:grid-cols-[120px_1fr] gap-4">
                      <span className="text-sm text-slate-400 pt-0.5">{category}</span>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {catSkills.map((s) => s.name).join(', ')}
                      </p>
                    </div>
                  </Fade>
                ))}
              </div>
            </Fade>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-20 py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
          <span>&copy; {new Date().getFullYear()} {personalInfo.name}</span>
          <div className="flex gap-4">
            {personalInfo.github && (
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {personalInfo.twitter && (
              <a href={personalInfo.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="hover:text-slate-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
