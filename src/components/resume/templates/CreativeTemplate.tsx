'use client'

import { ResumeData } from '@/types'

interface Props {
  resumeData: ResumeData
}

const COLORS = ['#a855f7', '#ec4899', '#f97316', '#06b6d4', '#10b981']

function ColorSquare({ index }: { index: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        background: COLORS[index % COLORS.length],
        borderRadius: 2,
        marginRight: 8,
        flexShrink: 0,
      }}
    />
  )
}

function SectionHeader({ title, index }: { title: string; index: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <ColorSquare index={index} />
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
    </div>
  )
}

export function CreativeTemplate({ resumeData }: Props) {
  const { personalInfo, summary, experience, education, projects, skills } = resumeData
  const certifications = resumeData.certifications ?? []
  const awards = resumeData.awards ?? []
  const references = resumeData.references ?? []

  const contactParts = [
    personalInfo.email && `✉ ${personalInfo.email}`,
    personalInfo.phone && `✆ ${personalInfo.phone}`,
    personalInfo.location && `⌖ ${personalInfo.location}`,
    personalInfo.website && `↗ ${personalInfo.website}`,
    personalInfo.linkedin && `in ${personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`,
    personalInfo.github && `⌥ ${personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}`,
  ].filter(Boolean) as string[]

  const skillCategories = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || 'Skills'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s.name)
    return acc
  }, {})

  return (
    <div
      style={{
        minHeight: 842,
        background: '#fafafa',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#1a1a1a',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 60%, #f97316 100%)',
          padding: '32px 40px 28px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            {personalInfo.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            {personalInfo.title}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              gap: '4px 14px',
            }}
          >
            {contactParts.map((part, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 20,
                  padding: '2px 10px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {part}
              </span>
            ))}
          </div>
        </div>

        {/* Profile photo */}
        {personalInfo.profileImage && (
          <img
            src={personalInfo.profileImage}
            alt={personalInfo.name}
            style={{
              width: 85,
              height: 85,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.7)',
              marginLeft: 20,
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* BODY */}
      <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Summary */}
        {(summary || personalInfo.summary) && (
          <div
            data-pdf-break
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '16px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              borderLeft: '4px solid #a855f7',
            }}
          >
            <SectionHeader title="About Me" index={0} />
            <p style={{ fontSize: 11, lineHeight: 1.65, color: '#444', margin: 0 }}>
              {summary || personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div
            data-pdf-break
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '16px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <SectionHeader title="Experience" index={1} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {experience.map((exp, i) => (
                <div
                  key={exp.id}
                  data-pdf-break
                  style={{
                    paddingLeft: 12,
                    borderLeft: `2px solid ${COLORS[(i + 1) % COLORS.length]}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{exp.position}</div>
                      <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>{exp.company}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: 10.5, color: '#555', margin: '4px 0 3px 0', lineHeight: 1.5 }}>
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul style={{ margin: '3px 0 0 0', paddingLeft: 16 }}>
                      {exp.achievements.map((a, ai) => (
                        <li key={ai} style={{ fontSize: 10.5, color: '#444', marginBottom: 2, lineHeight: 1.4 }}>
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

        {/* Two-column lower */}
        <div data-pdf-break style={{ display: 'flex', gap: 16 }}>
          {/* Left: Education + Certs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {education.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <SectionHeader title="Education" index={2} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{edu.degree} in {edu.field}</div>
                      <div style={{ fontSize: 10.5, color: '#666' }}>{edu.institution}</div>
                      <div style={{ fontSize: 10, color: '#999' }}>
                        {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                        {edu.gpa && ` · GPA ${edu.gpa}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <SectionHeader title="Certifications" index={3} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <div style={{ fontSize: 10.5, fontWeight: 600 }}>{cert.name}</div>
                      <div style={{ fontSize: 10, color: '#777' }}>{cert.issuer} · {cert.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {awards.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <SectionHeader title="Awards" index={4} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {awards.map((award) => (
                    <div key={award.id}>
                      <div style={{ fontSize: 10.5, fontWeight: 600 }}>{award.title}</div>
                      <div style={{ fontSize: 10, color: '#777' }}>{award.issuer} · {award.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {references.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <SectionHeader title="References" index={5} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {references.map((ref) => (
                    <div key={ref.id}>
                      <div style={{ fontSize: 10.5, fontWeight: 600 }}>{ref.name}</div>
                      <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic' }}>{ref.title}, {ref.company}</div>
                      {(ref.email || ref.phone) && (
                        <div style={{ fontSize: 9.5, color: '#999' }}>{[ref.email, ref.phone].filter(Boolean).join(' · ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Skills + Projects */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {skills.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <SectionHeader title="Skills" index={1} />
                {Object.entries(skillCategories).map(([cat, names], ci) => (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {cat}
                    </div>
                    <div>
                      {names.map((name, ni) => (
                        <span
                          key={name}
                          style={{
                            display: 'inline-block',
                            background: `${COLORS[(ci + ni) % COLORS.length]}18`,
                            color: COLORS[(ci + ni) % COLORS.length],
                            border: `1px solid ${COLORS[(ci + ni) % COLORS.length]}40`,
                            borderRadius: 20,
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 600,
                            margin: '2px 2px',
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <SectionHeader title="Projects" index={0} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {projects.map((proj, pi) => (
                    <div
                      key={proj.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: `${COLORS[pi % COLORS.length]}0a`,
                        border: `1px solid ${COLORS[pi % COLORS.length]}25`,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>{proj.name}</div>
                      <p style={{ fontSize: 10, color: '#555', margin: '2px 0 4px 0', lineHeight: 1.4 }}>
                        {proj.description}
                      </p>
                      <div>
                        {proj.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            style={{
                              display: 'inline-block',
                              fontSize: 9,
                              color: '#666',
                              background: '#f0f0f0',
                              borderRadius: 2,
                              padding: '1px 5px',
                              margin: '1px 2px',
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
      </div>
    </div>
  )
}
