'use client'

import { ResumeData } from '@/types'

interface Props {
  resumeData: ResumeData
}

function HR({ thin = false }: { thin?: boolean }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: thin ? '1px solid #c8c8c8' : '2px solid #2d2d2d',
        margin: thin ? '8px 0' : '10px 0',
      }}
    />
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#2d2d2d',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {title}
      </div>
      <HR thin />
    </div>
  )
}

function formatDate(start: string, end: string, current: boolean) {
  return `${start} – ${current ? 'Present' : end}`
}

export function ExecutiveTemplate({ resumeData }: Props) {
  const { personalInfo, summary, experience, education, projects, skills } = resumeData
  const certifications = resumeData.certifications ?? []
  const awards = resumeData.awards ?? []
  const references = resumeData.references ?? []

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean) as string[]

  const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || 'Core Competencies'
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
        padding: '52px 60px',
        boxSizing: 'border-box',
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#111',
            lineHeight: 1.1,
          }}
        >
          {personalInfo.name}
        </div>
        {personalInfo.title && (
          <div
            style={{
              fontSize: 13,
              color: '#444',
              marginTop: 5,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
            }}
          >
            {personalInfo.title}
          </div>
        )}
      </div>

      {/* Contact line */}
      {contactParts.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: '#555',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            marginTop: 8,
            marginBottom: 4,
            letterSpacing: '0.03em',
          }}
        >
          {contactParts.join('   |   ')}
        </div>
      )}

      {/* Double rule */}
      <div style={{ borderTop: '3px solid #111', borderBottom: '1px solid #111', paddingTop: 2, marginTop: 10, marginBottom: 18 }} />

      {/* Summary */}
      {(summary || personalInfo.summary) && (
        <div data-pdf-break style={{ marginBottom: 18 }}>
          <SectionHeader title="Executive Summary" />
          <p style={{ fontSize: 11, lineHeight: 1.7, color: '#222', margin: 0, textAlign: 'justify' }}>
            {summary || personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div data-pdf-break style={{ marginBottom: 18 }}>
          <SectionHeader title="Professional Experience" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {experience.map((exp) => (
              <div key={exp.id} data-pdf-break>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{exp.position}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#333',
                        fontStyle: 'italic',
                        marginLeft: 8,
                      }}
                    >
                      {exp.company}
                      {exp.location && `, ${exp.location}`}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#555',
                      whiteSpace: 'nowrap',
                      marginLeft: 12,
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {formatDate(exp.startDate, exp.endDate, exp.current)}
                  </span>
                </div>
                {exp.description && (
                  <p style={{ fontSize: 11, color: '#333', margin: '5px 0 4px 0', lineHeight: 1.6, textAlign: 'justify' }}>
                    {exp.description}
                  </p>
                )}
                {exp.achievements.length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                    {exp.achievements.map((a, i) => (
                      <li key={i} style={{ fontSize: 11, color: '#333', marginBottom: 3, lineHeight: 1.5 }}>
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

      {/* Core Competencies / Skills */}
      {skills.length > 0 && (
        <div data-pdf-break style={{ marginBottom: 18 }}>
          <SectionHeader title="Core Competencies" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.entries(skillsByCategory).map(([cat, names]) => (
              <div key={cat} style={{ display: 'flex', gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#222',
                    minWidth: 110,
                    fontStyle: 'italic',
                  }}
                >
                  {cat}:
                </span>
                <span style={{ fontSize: 11, color: '#333' }}>{names.join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two column lower */}
      <div data-pdf-break style={{ display: 'flex', gap: 36 }}>
        <div style={{ flex: 1 }}>
          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Education" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
                      {edu.degree} in {edu.field}
                    </div>
                    <div style={{ fontSize: 11, fontStyle: 'italic', color: '#444' }}>{edu.institution}</div>
                    <div style={{ fontSize: 10.5, color: '#666', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                      {formatDate(edu.startDate, edu.endDate, edu.current)}
                      {edu.gpa && ` · GPA: ${edu.gpa}`}
                    </div>
                    {edu.description && (
                      <p style={{ fontSize: 10.5, color: '#444', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Honors & Awards" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {awards.map((award) => (
                  <div key={award.id}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{award.title}</div>
                    <div style={{ fontSize: 10.5, fontStyle: 'italic', color: '#555' }}>
                      {award.issuer} · {award.date}
                    </div>
                    {award.description && (
                      <p style={{ fontSize: 10.5, color: '#444', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                        {award.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {/* Certifications */}
          {certifications.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Professional Certifications" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{cert.name}</div>
                    <div style={{ fontSize: 10.5, color: '#555', fontStyle: 'italic' }}>
                      {cert.issuer}
                    </div>
                    <div style={{ fontSize: 10, color: '#777', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                      Issued: {cert.date}
                      {cert.expiry && ` · Expires: ${cert.expiry}`}
                      {cert.credentialId && ` · ID: ${cert.credentialId}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Key Initiatives" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{proj.name}</div>
                    <p style={{ fontSize: 10.5, color: '#444', margin: '2px 0 3px 0', lineHeight: 1.4 }}>
                      {proj.description}
                    </p>
                    {proj.technologies.length > 0 && (
                      <div style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>
                        Technologies: {proj.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {references.length > 0 && (
            <div>
              <SectionHeader title="References" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {references.map((ref) => (
                  <div key={ref.id}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{ref.name}</div>
                    <div style={{ fontSize: 10.5, fontStyle: 'italic', color: '#444' }}>
                      {ref.title}, {ref.company}
                    </div>
                    <div style={{ fontSize: 10, color: '#666' }}>{ref.relationship}</div>
                    {(ref.email || ref.phone) && (
                      <div style={{ fontSize: 10, color: '#777', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                        {[ref.email, ref.phone].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
