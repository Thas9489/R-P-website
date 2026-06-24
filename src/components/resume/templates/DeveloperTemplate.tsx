'use client'

import { ResumeData } from '@/types'

interface Props {
  resumeData: ResumeData
}

const DARK_BG = '#1a1a2e'
const ACCENT = '#00d4ff'
const GREEN = '#4ade80'
const YELLOW = '#fbbf24'
const PURPLE = '#a78bfa'
const BODY_BG = '#f8f9fc'

function CodeTag({ children }: { children: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 10,
        background: '#1e293b',
        color: '#7dd3fc',
        borderRadius: 4,
        padding: '2px 7px',
        margin: '2px 2px',
        border: '1px solid #334155',
      }}
    >
      {children}
    </span>
  )
}

function SectionTitle({ children, color = ACCENT }: { children: string; color?: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span style={{ fontFamily: "'Courier New', monospace", color: GREEN }}>{'///'}</span>
      {children}
    </div>
  )
}

function RepoCard({ proj, index }: { proj: { name: string; description: string; technologies: string[]; url?: string; github?: string }; index: number }) {
  const borderColors = [ACCENT, GREEN, YELLOW, PURPLE, '#f472b6']
  const border = borderColors[index % borderColors.length]
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 6,
        border: `1px solid #e2e8f0`,
        borderTop: `3px solid ${border}`,
        padding: '10px 12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Courier New', monospace",
            color: '#1e293b',
          }}
        >
          {proj.name}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {proj.github && (
            <span style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>
              ⌥ {proj.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
            </span>
          )}
          {proj.url && (
            <span style={{ fontSize: 9, color: ACCENT, fontFamily: 'monospace' }}>{proj.url}</span>
          )}
        </div>
      </div>
      <p style={{ fontSize: 10, color: '#475569', margin: '0 0 6px 0', lineHeight: 1.45 }}>
        {proj.description}
      </p>
      <div>
        {proj.technologies.map((tech) => (
          <CodeTag key={tech}>{tech}</CodeTag>
        ))}
      </div>
    </div>
  )
}

export function DeveloperTemplate({ resumeData }: Props) {
  const { personalInfo, summary, experience, education, projects, skills, certifications } = resumeData

  const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s.name)
    return acc
  }, {})

  return (
    <div
      style={{
        minHeight: 842,
        background: BODY_BG,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: 11,
      }}
    >
      {/* TERMINAL HEADER */}
      <div
        style={{
          background: DARK_BG,
          padding: '24px 32px 20px',
        }}
      >
        {/* Window chrome */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* Terminal text */}
        <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
          <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4 }}>
            {'# ResumeAI Terminal v2.0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ color: GREEN, fontSize: 13 }}>{'>'}</span>
            <span style={{ color: ACCENT, fontSize: 16, fontWeight: 700 }}>
              {personalInfo.name.toLowerCase().replace(/ /g, '.')}
            </span>
            <span style={{ color: '#64748b', fontSize: 12 }}>~</span>
            <span style={{ color: YELLOW, fontSize: 12 }}>$</span>
            <span style={{ color: '#e2e8f0', fontSize: 12 }}>whoami</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2, marginLeft: 20 }}>
            {personalInfo.title}
          </div>

          {/* Contact line */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginTop: 12 }}>
            {[
              personalInfo.email && `email="${personalInfo.email}"`,
              personalInfo.phone && `phone="${personalInfo.phone}"`,
              personalInfo.location && `loc="${personalInfo.location}"`,
              personalInfo.github && `github="${personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}"`,
              personalInfo.linkedin && `linkedin="${personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}"`,
              personalInfo.website && `web="${personalInfo.website}"`,
            ]
              .filter(Boolean)
              .map((part, i) => {
                const [key, val] = (part as string).split('=')
                return (
                  <span key={i} style={{ fontSize: 10, fontFamily: 'monospace' }}>
                    <span style={{ color: PURPLE }}>{key}</span>
                    <span style={{ color: '#64748b' }}>{'='}</span>
                    <span style={{ color: YELLOW }}>{val}</span>
                    {' '}
                  </span>
                )
              })}
          </div>
        </div>
      </div>

      {/* BODY — two column */}
      <div style={{ display: 'flex', minHeight: 0 }}>
        {/* LEFT: Skills + Certs */}
        <div
          style={{
            width: '32%',
            background: '#0f172a',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Summary */}
          {(summary || personalInfo.summary) && (
            <div>
              <SectionTitle color={GREEN}>readme</SectionTitle>
              <p
                style={{
                  fontSize: 10,
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  margin: 0,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {(summary || personalInfo.summary || '').substring(0, 200)}
                {(summary || personalInfo.summary || '').length > 200 ? '...' : ''}
              </p>
            </div>
          )}

          {/* Skills */}
          {Object.entries(skillsByCategory).map(([cat, names]) => (
            <div key={cat}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: ACCENT,
                  fontFamily: 'monospace',
                  marginBottom: 6,
                  letterSpacing: '0.1em',
                }}
              >
                {`// ${cat}`}
              </div>
              <div>
                {names.map((name) => (
                  <span
                    key={name}
                    style={{
                      display: 'inline-block',
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 10,
                      background: '#1e293b',
                      color: '#7dd3fc',
                      borderRadius: 3,
                      padding: '2px 6px',
                      margin: '2px 2px',
                      border: '1px solid #334155',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <SectionTitle color={YELLOW}>badges</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    style={{
                      padding: '6px 8px',
                      background: '#1e293b',
                      borderRadius: 4,
                      borderLeft: `3px solid ${YELLOW}`,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0' }}>{cert.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
                      {cert.issuer} · {cert.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <SectionTitle color={PURPLE}>education</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0' }}>
                      {edu.degree}
                    </div>
                    <div style={{ fontSize: 9.5, color: '#7dd3fc', fontFamily: 'monospace' }}>
                      {edu.field}
                    </div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{edu.institution}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                      {edu.gpa && ` · ${edu.gpa}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Experience + Projects */}
        <div style={{ flex: 1, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <SectionTitle color={DARK_BG}>experience</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {experience.map((exp) => (
                  <div
                    key={exp.id}
                    style={{
                      background: '#fff',
                      borderRadius: 6,
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderLeft: `3px solid ${ACCENT}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{exp.position}</span>
                        <span style={{ fontSize: 11, color: '#4f86f7', marginLeft: 6 }}>@ {exp.company}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: 'monospace',
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                          marginLeft: 8,
                        }}
                      >
                        [{exp.startDate} – {exp.current ? 'now' : exp.endDate}]
                      </span>
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: 10.5, color: '#475569', margin: '4px 0 3px 0', lineHeight: 1.5 }}>
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements.length > 0 && (
                      <ul style={{ margin: '3px 0 0 0', paddingLeft: 16 }}>
                        {exp.achievements.map((a, i) => (
                          <li key={i} style={{ fontSize: 10.5, color: '#334155', marginBottom: 2, lineHeight: 1.4 }}>
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <SectionTitle color={DARK_BG}>repositories</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects.map((proj, i) => (
                  <RepoCard key={proj.id} proj={proj} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
