'use client'

import { ResumeData } from '@/types'

interface Props {
  resumeData: ResumeData
}

function HR() {
  return <hr style={{ border: 'none', borderTop: '1px solid #d0d0d0', margin: '12px 0' }} />
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div
      data-pdf-break
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        color: '#2a2a2a',
        marginBottom: 10,
        fontVariant: 'small-caps',
      }}
    >
      {children}
    </div>
  )
}

function formatDate(start: string, end: string, current: boolean) {
  return `${start} – ${current ? 'Present' : end}`
}

export function MinimalTemplate({ resumeData }: Props) {
  const { personalInfo, summary, experience, education, projects, skills } = resumeData
  const certifications = resumeData.certifications ?? []
  const awards = resumeData.awards ?? []
  const references = resumeData.references ?? []

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean) as string[]

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
        background: '#fff',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#1a1a1a',
        padding: '48px 52px',
        boxSizing: 'border-box',
      }}
    >
      {/* Name */}
      <div style={{ textAlign: 'left', marginBottom: 6 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#111',
            fontFamily: 'Georgia, serif',
          }}
        >
          {personalInfo.name}
        </div>
        {personalInfo.title && (
          <div
            style={{
              fontSize: 13,
              color: '#555',
              marginTop: 3,
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
            }}
          >
            {personalInfo.title}
          </div>
        )}
      </div>

      {/* Contact */}
      {contactParts.length > 0 && (
        <div
          style={{
            fontSize: 10,
            color: '#555',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            marginBottom: 4,
            marginTop: 6,
          }}
        >
          {contactParts.join('  •  ')}
        </div>
      )}

      <HR />

      {/* Summary */}
      {(summary || personalInfo.summary) && (
        <>
          <SectionTitle>Summary</SectionTitle>
          <p
            style={{
              fontSize: 11,
              lineHeight: 1.65,
              color: '#333',
              margin: '0 0 12px 0',
              fontFamily: 'Georgia, serif',
            }}
          >
            {summary || personalInfo.summary}
          </p>
          <HR />
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <SectionTitle>Experience</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {experience.map((exp) => (
              <div key={exp.id} data-pdf-break>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 1,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                      {exp.position}
                    </span>
                    <span style={{ fontSize: 11, color: '#555', marginLeft: 6 }}>— {exp.company}</span>
                    {exp.location && (
                      <span style={{ fontSize: 10, color: '#888', marginLeft: 4 }}>({exp.location})</span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: '#777',
                      whiteSpace: 'nowrap',
                      marginLeft: 12,
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {formatDate(exp.startDate, exp.endDate, exp.current)}
                  </span>
                </div>
                {exp.description && (
                  <p style={{ fontSize: 10.5, color: '#444', margin: '4px 0 3px 0', lineHeight: 1.5 }}>
                    {exp.description}
                  </p>
                )}
                {exp.achievements.length > 0 && (
                  <ul style={{ margin: '3px 0 0 0', paddingLeft: 18 }}>
                    {exp.achievements.map((a, i) => (
                      <li key={i} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.45, marginBottom: 2 }}>
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <HR />
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <SectionTitle>Education</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {education.map((edu) => (
              <div key={edu.id} data-pdf-break style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                    {edu.degree} in {edu.field}
                  </span>
                  <span style={{ fontSize: 11, color: '#555', marginLeft: 6 }}>— {edu.institution}</span>
                  {edu.gpa && (
                    <span style={{ fontSize: 10, color: '#888', marginLeft: 4 }}>· GPA {edu.gpa}</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: '#777',
                    whiteSpace: 'nowrap',
                    marginLeft: 12,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {formatDate(edu.startDate, edu.endDate, edu.current)}
                </span>
              </div>
            ))}
          </div>
          <HR />
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <SectionTitle>Skills</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {Object.entries(skillsByCategory).map(([cat, names]) => (
              <div key={cat} style={{ display: 'flex', gap: 6 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#333',
                    minWidth: 90,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {cat}:
                </span>
                <span style={{ fontSize: 10.5, color: '#555' }}>{names.join(', ')}</span>
              </div>
            ))}
          </div>
          <HR />
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <SectionTitle>Projects</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map((proj) => (
              <div key={proj.id} data-pdf-break>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                    {proj.name}
                  </span>
                  {proj.url && (
                    <span style={{ fontSize: 10, color: '#888' }}>({proj.url})</span>
                  )}
                </div>
                <p style={{ fontSize: 10.5, color: '#444', margin: '2px 0 3px 0', lineHeight: 1.45 }}>
                  {proj.description}
                </p>
                {proj.technologies.length > 0 && (
                  <span style={{ fontSize: 10, color: '#666' }}>
                    <em>Technologies:</em> {proj.technologies.join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
          <HR />
        </>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <>
          <SectionTitle>Certifications</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
            {certifications.map((cert) => (
              <div key={cert.id} data-pdf-break style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10.5, fontWeight: 600 }}>
                  {cert.name}{' '}
                  <span style={{ fontWeight: 400, color: '#555' }}>— {cert.issuer}</span>
                </span>
                <span style={{ fontSize: 10, color: '#777' }}>{cert.date}</span>
              </div>
            ))}
          </div>
          <HR />
        </>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <>
          <SectionTitle>Awards</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
            {awards.map((award) => (
              <div key={award.id} data-pdf-break style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10.5, fontWeight: 600 }}>
                  {award.title}{' '}
                  <span style={{ fontWeight: 400, color: '#555' }}>— {award.issuer}</span>
                </span>
                <span style={{ fontSize: 10, color: '#777' }}>{award.date}</span>
              </div>
            ))}
          </div>
          <HR />
        </>
      )}

      {/* References */}
      {references.length > 0 && (
        <>
          <SectionTitle>References</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {references.map((ref) => (
              <div key={ref.id} data-pdf-break>
                <div style={{ fontSize: 10.5, fontWeight: 600 }}>
                  {ref.name}{' '}
                  <span style={{ fontWeight: 400, color: '#555' }}>— {ref.title}, {ref.company}</span>
                </div>
                {(ref.email || ref.phone) && (
                  <div style={{ fontSize: 10, color: '#777' }}>{[ref.email, ref.phone].filter(Boolean).join(' · ')}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
