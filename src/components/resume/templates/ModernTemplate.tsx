'use client'

import { ResumeData } from '@/types'

interface Props {
  resumeData: ResumeData
}

const NAVY = '#1e3a5f'
const BLUE = '#4f86f7'

function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  email: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.21 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l1.45-1.45a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 13.92v3z',
  location: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a3 3 0 100-6 3 3 0 000 6',
  web: 'M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: NAVY,
          paddingBottom: 4,
          borderBottom: `2px solid ${BLUE}`,
          display: 'inline-block',
        }}
      >
        {title}
      </div>
    </div>
  )
}

function SkillTag({ name }: { name: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: 'rgba(79,134,247,0.15)',
        color: '#c8deff',
        borderRadius: 3,
        padding: '2px 7px',
        fontSize: 10,
        fontWeight: 500,
        margin: '2px 2px',
        border: '1px solid rgba(79,134,247,0.3)',
      }}
    >
      {name}
    </span>
  )
}

export function ModernTemplate({ resumeData }: Props) {
  const { personalInfo, summary, experience, education, projects, skills } = resumeData
  const certifications = resumeData.certifications ?? []

  const contactItems = [
    { icon: ICONS.email, value: personalInfo.email },
    { icon: ICONS.phone, value: personalInfo.phone },
    { icon: ICONS.location, value: personalInfo.location },
    personalInfo.website ? { icon: ICONS.web, value: personalInfo.website } : null,
    personalInfo.linkedin ? { icon: ICONS.linkedin, value: personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') } : null,
    personalInfo.github ? { icon: ICONS.github, value: personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '') } : null,
  ].filter(Boolean) as { icon: string; value: string }[]

  const categorized = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || 'Skills'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s.name)
    return acc
  }, {})

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 842,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: 11,
        lineHeight: 1.5,
        color: '#1a1a1a',
      }}
    >
      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: '35%',
          background: NAVY,
          color: '#e8eef8',
          padding: '28px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Profile Photo */}
        {personalInfo.profileImage && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={personalInfo.profileImage}
              alt={personalInfo.name}
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${BLUE}`,
              }}
            />
          </div>
        )}

        {/* Name + Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {personalInfo.name}
          </div>
          <div style={{ fontSize: 11, color: '#4f86f7', marginTop: 4, fontWeight: 500 }}>
            {personalInfo.title}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }} />

        {/* Contact */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: BLUE,
              marginBottom: 8,
            }}
          >
            Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {contactItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ color: BLUE, marginTop: 1 }}>
                  <Icon d={item.icon} size={12} />
                </span>
                <span style={{ fontSize: 10, wordBreak: 'break-all', color: '#c8d8f0' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }} />

        {/* Skills */}
        {Object.entries(categorized).map(([cat, names]) => (
          <div key={cat}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: BLUE,
                marginBottom: 6,
              }}
            >
              {cat}
            </div>
            <div>
              {names.map((name) => (
                <SkillTag key={name} name={name} />
              ))}
            </div>
          </div>
        ))}

        {/* Certifications */}
        {certifications.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }} />
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: BLUE,
                  marginBottom: 8,
                }}
              >
                Certifications
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{cert.name}</div>
                    <div style={{ fontSize: 9, color: '#8aabcf' }}>
                      {cert.issuer} · {cert.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT MAIN */}
      <div style={{ width: '65%', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Summary */}
        {(summary || personalInfo.summary) && (
          <div>
            <SectionHeader title="Professional Summary" />
            <p style={{ fontSize: 11, color: '#444', lineHeight: 1.6, margin: 0 }}>
              {summary || personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <SectionHeader title="Experience" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{exp.position}</div>
                      <div style={{ fontSize: 11, color: BLUE, fontWeight: 500 }}>{exp.company}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      {exp.location && <span> · {exp.location}</span>}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: 10.5, color: '#555', margin: '4px 0 4px 0', lineHeight: 1.5 }}>
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 16 }}>
                      {exp.achievements.map((a, i) => (
                        <li key={i} style={{ fontSize: 10.5, color: '#444', marginBottom: 2, lineHeight: 1.4 }}>
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

        {/* Education */}
        {education.length > 0 && (
          <div>
            <SectionHeader title="Education" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>
                        {edu.degree} in {edu.field}
                      </div>
                      <div style={{ fontSize: 11, color: BLUE, fontWeight: 500 }}>{edu.institution}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>GPA: {edu.gpa}</div>
                  )}
                  {edu.description && (
                    <p style={{ fontSize: 10.5, color: '#555', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <SectionHeader title="Projects" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{proj.name}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {proj.url && (
                        <span style={{ fontSize: 9, color: BLUE }}>{proj.url}</span>
                      )}
                      {proj.github && (
                        <span style={{ fontSize: 9, color: '#888' }}>{proj.github}</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 10.5, color: '#555', margin: '3px 0 5px 0', lineHeight: 1.4 }}>
                    {proj.description}
                  </p>
                  <div>
                    {proj.technologies.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          display: 'inline-block',
                          background: '#f0f4ff',
                          color: NAVY,
                          borderRadius: 2,
                          padding: '1px 5px',
                          fontSize: 9,
                          fontWeight: 600,
                          margin: '1px 2px',
                          border: '1px solid #d0dcf8',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
