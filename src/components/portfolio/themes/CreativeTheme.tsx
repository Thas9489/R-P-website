'use client'

// CreativeTheme — vibrant, full-bleed hero with animated gradient sections.
// Falls back to ModernTheme layout with a purple/pink color palette.

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Github, Linkedin, Twitter, Mail, ExternalLink, MapPin } from 'lucide-react'
import type { ResumeData } from '@/types'

interface CreativeThemeProps {
  resumeData: ResumeData
  slug?: string
}

// ── Reveal animation helper ────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

// ── Section heading ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-purple-300 via-pink-200 to-transparent" />
    </div>
  )
}

// ── Skill pill ─────────────────────────────────────────────────────────────────

function SkillPill({ name, level }: { name: string; level: string }) {
  const colors: Record<string, string> = {
    Expert:       'bg-purple-600 text-white',
    Advanced:     'bg-purple-100 text-purple-800',
    Intermediate: 'bg-pink-100 text-pink-800',
    Beginner:     'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${colors[level] ?? colors.Beginner}`}>
      {name}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CreativeTheme({ resumeData }: CreativeThemeProps) {
  const { personalInfo, summary, experience, education, projects, skills, certifications } = resumeData

  const socialLinks = [
    personalInfo.github  && { href: personalInfo.github,   icon: <Github className="w-5 h-5" />,   label: 'GitHub' },
    personalInfo.linkedin && { href: personalInfo.linkedin, icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn' },
    personalInfo.twitter && { href: personalInfo.twitter,   icon: <Twitter className="w-5 h-5" />,  label: 'Twitter' },
    personalInfo.email   && { href: `mailto:${personalInfo.email}`, icon: <Mail className="w-5 h-5" />, label: 'Email' },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-pink-600 to-rose-500 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28 flex flex-col sm:flex-row items-center gap-10">
          {/* Avatar */}
          {personalInfo.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.profileImage}
              alt={personalInfo.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-white/40 shadow-2xl flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 flex items-center justify-center text-4xl sm:text-5xl font-black text-white flex-shrink-0">
              {personalInfo.name?.charAt(0) || '?'}
            </div>
          )}

          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-2"
            >
              {personalInfo.title}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black leading-tight tracking-tight mb-4"
            >
              {personalInfo.name || 'Portfolio'}
            </motion.h1>

            {personalInfo.location && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 text-white/80 text-sm mb-5"
              >
                <MapPin className="w-4 h-4" />
                {personalInfo.location}
              </motion.div>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-all"
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* Summary */}
        {summary && (
          <Reveal>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
              <p className="text-gray-700 leading-relaxed text-lg">{summary}</p>
            </div>
          </Reveal>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Reveal>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <Reveal key={exp.id} delay={i * 0.08}>
                  <div className="relative pl-6 border-l-2 border-purple-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-500" />
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-sm text-purple-700 font-semibold">{exp.company}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      {exp.location && <> &middot; {exp.location}</>}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                    {exp.achievements.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.achievements.map((a, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-purple-500 mt-1">✦</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Reveal>
            <SectionTitle>Projects</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map((proj, i) => (
                <Reveal key={proj.id} delay={i * 0.08}>
                  <div className="group bg-white rounded-2xl border border-gray-200 hover:border-purple-300 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {proj.name}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0">
                        {proj.github && (
                          <a href={proj.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((tech) => (
                        <span key={tech} className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Reveal>
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillPill key={skill.name} name={skill.name} level={skill.level} />
              ))}
            </div>
          </Reveal>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Reveal>
            <SectionTitle>Education</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {education.map((edu) => (
                <div key={edu.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                  <h3 className="font-bold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-sm font-semibold text-purple-700 mt-0.5">{edu.institution}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
                  </p>
                  {edu.gpa && <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <Reveal>
            <SectionTitle>Certifications</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
                    <p className="text-xs text-purple-700 font-medium">{cert.issuer}</p>
                    <p className="text-xs text-gray-400">{cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Contact */}
        {(personalInfo.email || personalInfo.phone || personalInfo.website) && (
          <Reveal>
            <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-rose-500 rounded-3xl p-8 text-white text-center">
              <h2 className="text-2xl font-black mb-2">Let&apos;s Connect</h2>
              <p className="text-white/80 mb-6 text-sm">Open to new opportunities and collaborations.</p>
              {personalInfo.email && (
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  {personalInfo.email}
                </a>
              )}
            </div>
          </Reveal>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {personalInfo.name}. All rights reserved.
      </footer>
    </div>
  )
}
