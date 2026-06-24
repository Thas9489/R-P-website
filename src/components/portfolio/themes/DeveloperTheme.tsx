'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, GitFork, Github, Linkedin, Twitter, Mail, ExternalLink, Terminal } from 'lucide-react'
import type { ResumeData } from '@/types'

interface DeveloperThemeProps {
  resumeData: ResumeData
  slug?: string
}

// ── Terminal typing animation ──────────────────────────────────────────────────
function TerminalTyper({
  lines,
  speed = 40,
}: {
  lines: Array<{ prompt?: string; text: string; color?: string; delay?: number }>
  speed?: number
}) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [currentChar, setCurrentChar] = useState<number>(0)

  useEffect(() => {
    if (visibleLines >= lines.length) return
    const line = lines[visibleLines]
    const totalDelay = line.delay ?? 0

    const startTimer = setTimeout(() => {
      if (currentChar < line.text.length) {
        const t = setTimeout(() => setCurrentChar((c) => c + 1), speed)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => {
          setVisibleLines((l) => l + 1)
          setCurrentChar(0)
        }, 300)
        return () => clearTimeout(t)
      }
    }, totalDelay)

    return () => clearTimeout(startTimer)
  }, [visibleLines, currentChar, lines, speed])

  return (
    <div className="space-y-1">
      {lines.slice(0, visibleLines).map((line, i) => (
        <div key={i} className={`text-sm font-mono ${line.color ?? 'text-[#c9d1d9]'}`}>
          {line.prompt && <span className="text-[#58a6ff]">{line.prompt} </span>}
          {line.text}
        </div>
      ))}
      {visibleLines < lines.length && (
        <div className={`text-sm font-mono ${lines[visibleLines].color ?? 'text-[#c9d1d9]'}`}>
          {lines[visibleLines].prompt && (
            <span className="text-[#58a6ff]">{lines[visibleLines].prompt} </span>
          )}
          {lines[visibleLines].text.slice(0, currentChar)}
          <span className="animate-pulse text-[#58a6ff]">█</span>
        </div>
      )}
    </div>
  )
}

// ── Code block wrapper ─────────────────────────────────────────────────────────
function CodeBlock({
  title,
  children,
  language = 'bash',
}: {
  title: string
  children: React.ReactNode
  language?: string
}) {
  return (
    <div className="rounded-lg border border-[#30363d] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-xs text-[#8b949e] ml-2 font-mono">{title}</span>
        <span className="ml-auto text-[10px] text-[#8b949e] font-mono">{language}</span>
      </div>
      <div className="bg-[#0d1117] p-5 font-mono text-sm leading-relaxed">{children}</div>
    </div>
  )
}

// ── Fade in for sections ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ── Repo card (GitHub style) ───────────────────────────────────────────────────
const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  Java: '#b07219',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#7F52FF',
  default: '#8b949e',
}

function RepoCard({ project }: { project: ResumeData['projects'][0] }) {
  const primaryLang = project.technologies[0]
  const langColor = langColors[primaryLang] ?? langColors.default
  const fakeStars = Math.floor(Math.random() * 120) + 5
  const fakeForks = Math.floor(fakeStars / 4)

  return (
    <div className="border border-[#30363d] rounded-lg p-4 bg-[#0d1117] hover:border-[#58a6ff]/40 transition-colors group flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[#58a6ff] font-medium text-sm group-hover:underline cursor-pointer">
            {project.github
              ? project.github.split('/').slice(-2).join('/')
              : `user/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
          </span>
          <span className="text-[10px] border border-[#30363d] text-[#8b949e] rounded-full px-1.5 py-0.5 font-mono">
            Public
          </span>
        </div>
        <div className="flex gap-2">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-[#8b949e] hover:text-white">
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[#8b949e] hover:text-[#58a6ff]">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <p className="text-[#8b949e] text-xs leading-relaxed flex-1 mb-4">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.technologies.slice(1, 4).map((tech) => (
          <span
            key={tech}
            className="text-[10px] font-mono bg-[#1f2937] text-[#c9d1d9] px-2 py-0.5 rounded border border-[#30363d]"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-[#8b949e]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: langColor }} />
          {primaryLang}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" /> {fakeStars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" /> {fakeForks}
        </span>
      </div>
    </div>
  )
}

export default function DeveloperTheme({ resumeData }: DeveloperThemeProps) {
  const { personalInfo, summary, experience, projects, skills, education } = resumeData
  const firstName = personalInfo.name.split(' ')[0].toLowerCase()
  const skillGroups = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const cat = s.category ?? 'Other'
    acc[cat] = [...(acc[cat] ?? []), s]
    return acc
  }, {})

  const terminalLines = [
    { prompt: '~/portfolio $', text: 'whoami', color: 'text-[#c9d1d9]' },
    { text: personalInfo.name, color: 'text-[#79c0ff]', delay: 400 },
    { prompt: '~/portfolio $', text: 'cat about.md', delay: 600 },
    {
      text: (summary ? summary.slice(0, 120) + (summary.length > 120 ? '...' : '') : ''),
      color: 'text-[#a5d6ff]',
      delay: 200,
    },
    { prompt: '~/portfolio $', text: 'ls skills/', delay: 600 },
    {
      text: skills
        .slice(0, 8)
        .map((s) => s.name)
        .join('  '),
      color: 'text-[#3fb950]',
      delay: 200,
    },
    { prompt: '~/portfolio $', text: '▌', color: 'text-[#c9d1d9]', delay: 500 },
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono antialiased">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#58a6ff]" />
            <span className="text-sm text-[#c9d1d9]">
              <span className="text-[#58a6ff]">~</span>/{firstName}
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-xs text-[#8b949e]">
            {['experience', 'projects', 'skills', 'contact'].map((link) => (
              <button
                key={link}
                onClick={() => document.getElementById(link)?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-[#58a6ff] transition-colors"
              >
                ./{link}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* ── HERO / Terminal ──────────────────────────────────────────────────── */}
        <section id="hero">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CodeBlock title="terminal" language="bash">
              <TerminalTyper lines={terminalLines} speed={35} />
            </CodeBlock>
          </motion.div>

          {/* Social quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4 mt-6"
          >
            {[
              { icon: Github, href: personalInfo.github, label: 'GitHub' },
              { icon: Linkedin, href: personalInfo.linkedin, label: 'LinkedIn' },
              { icon: Twitter, href: personalInfo.twitter, label: 'Twitter' },
              { icon: Mail, href: `mailto:${personalInfo.email}`, label: 'Email' },
            ]
              .filter((s) => s.href)
              .map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors border border-[#30363d] hover:border-[#58a6ff]/50 px-3 py-1.5 rounded-md"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </a>
              ))}
          </motion.div>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────────── */}
        {experience.length > 0 && (
          <section id="experience">
            <FadeIn>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[#58a6ff] text-sm">##</span>
                <h2 className="text-[#c9d1d9] text-sm font-bold tracking-wider uppercase">
                  Experience
                </h2>
                <div className="flex-1 border-t border-[#30363d]" />
              </div>

              <CodeBlock title="experience.json" language="json">
                <div className="space-y-6">
                  <span className="text-[#8b949e]">{'['}</span>
                  {experience.map((exp, i) => (
                    <FadeIn key={exp.id} delay={i * 0.08}>
                      <div className="ml-4 border-l-2 border-[#30363d] pl-4 hover:border-[#58a6ff] transition-colors">
                        <div className="flex items-baseline gap-2 flex-wrap mb-1">
                          <span className="text-[#79c0ff] font-bold">{exp.position}</span>
                          <span className="text-[#8b949e]">@</span>
                          <span className="text-[#3fb950]">{exp.company}</span>
                          <span className="text-[#8b949e] text-xs ml-auto">
                            {exp.startDate} → {exp.current ? 'present' : exp.endDate}
                          </span>
                        </div>
                        <p className="text-[#8b949e] text-xs leading-relaxed mb-2">
                          {exp.description}
                        </p>
                        {exp.achievements?.length > 0 && (
                          <ul className="space-y-0.5">
                            {exp.achievements.slice(0, 3).map((a, ai) => (
                              <li key={ai} className="text-xs text-[#8b949e] flex gap-2">
                                <span className="text-[#3fb950]">//</span>
                                {a}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </FadeIn>
                  ))}
                  <span className="text-[#8b949e]">{']'}</span>
                </div>
              </CodeBlock>
            </FadeIn>
          </section>
        )}

        {/* ── PROJECTS ─────────────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <section id="projects">
            <FadeIn>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[#58a6ff] text-sm">##</span>
                <h2 className="text-[#c9d1d9] text-sm font-bold tracking-wider uppercase">
                  Repositories
                </h2>
                <div className="flex-1 border-t border-[#30363d]" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map((proj, i) => (
                  <FadeIn key={proj.id} delay={i * 0.06}>
                    <RepoCard project={proj} />
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* ── SKILLS ───────────────────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <section id="skills">
            <FadeIn>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[#58a6ff] text-sm">##</span>
                <h2 className="text-[#c9d1d9] text-sm font-bold tracking-wider uppercase">
                  Skills
                </h2>
                <div className="flex-1 border-t border-[#30363d]" />
              </div>

              <CodeBlock title="skills.ts" language="typescript">
                <div className="space-y-3">
                  <span className="text-[#ff7b72]">const</span>{' '}
                  <span className="text-[#79c0ff]">skills</span>{' '}
                  <span className="text-[#c9d1d9]">= {'{'}</span>
                  {Object.entries(skillGroups).map(([category, catSkills]) => (
                    <div key={category} className="ml-4">
                      <span className="text-[#79c0ff]">{category.toLowerCase()}</span>
                      <span className="text-[#c9d1d9]">: [</span>
                      <span className="text-[#8b949e] ml-2">
                        {catSkills.map((s) => (
                          <code
                            key={s.name}
                            className="inline-block bg-[#1f2937] text-[#3fb950] px-1.5 py-0.5 rounded text-[11px] mr-1.5 mb-1 border border-[#30363d]"
                          >
                            &apos;{s.name}&apos;
                          </code>
                        ))}
                      </span>
                      <span className="text-[#c9d1d9]">],</span>
                    </div>
                  ))}
                  <span className="text-[#c9d1d9]">{'}'}</span>
                </div>
              </CodeBlock>
            </FadeIn>
          </section>
        )}

        {/* ── EDUCATION ────────────────────────────────────────────────────────── */}
        {education.length > 0 && (
          <section>
            <FadeIn>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[#58a6ff] text-sm">##</span>
                <h2 className="text-[#c9d1d9] text-sm font-bold tracking-wider uppercase">
                  Education
                </h2>
                <div className="flex-1 border-t border-[#30363d]" />
              </div>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[#79c0ff] font-bold text-sm">
                          {edu.degree} in {edu.field}
                        </span>
                        <br />
                        <span className="text-[#3fb950] text-xs">{edu.institution}</span>
                      </div>
                      <span className="text-xs text-[#8b949e]">
                        {new Date(edu.startDate).getFullYear()} –{' '}
                        {edu.current ? 'present' : new Date(edu.endDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* ── CONTACT ──────────────────────────────────────────────────────────── */}
        <section id="contact">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#58a6ff] text-sm">##</span>
              <h2 className="text-[#c9d1d9] text-sm font-bold tracking-wider uppercase">
                Contact
              </h2>
              <div className="flex-1 border-t border-[#30363d]" />
            </div>

            <CodeBlock title="contact.sh" language="bash">
              <div className="space-y-2">
                {personalInfo.email && (
                  <div>
                    <span className="text-[#58a6ff]">$ </span>
                    <span className="text-[#c9d1d9]">mail </span>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="text-[#3fb950] hover:underline"
                    >
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.github && (
                  <div>
                    <span className="text-[#58a6ff]">$ </span>
                    <span className="text-[#c9d1d9]">open </span>
                    <a
                      href={personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3fb950] hover:underline"
                    >
                      {personalInfo.github}
                    </a>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div>
                    <span className="text-[#58a6ff]">$ </span>
                    <span className="text-[#c9d1d9]">open </span>
                    <a
                      href={personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3fb950] hover:underline"
                    >
                      {personalInfo.linkedin}
                    </a>
                  </div>
                )}
                {personalInfo.twitter && (
                  <div>
                    <span className="text-[#58a6ff]">$ </span>
                    <span className="text-[#c9d1d9]">open </span>
                    <a
                      href={personalInfo.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3fb950] hover:underline"
                    >
                      {personalInfo.twitter}
                    </a>
                  </div>
                )}
                <div className="pt-1">
                  <span className="text-[#58a6ff]">$ </span>
                  <span className="animate-pulse text-[#c9d1d9]">█</span>
                </div>
              </div>
            </CodeBlock>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-6 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-[#8b949e] font-mono">
          <span className="text-[#3fb950]">// </span>
          Built with ResumeAI &mdash; &copy; {new Date().getFullYear()} {personalInfo.name}
        </div>
      </footer>
    </div>
  )
}
