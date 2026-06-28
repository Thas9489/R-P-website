import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ResumeData } from '@/types'

const NAVY = '#1e3a5f'
const INDIGO = '#4338ca'
const GRAY_700 = '#374151'
const GRAY_500 = '#6b7280'
const GRAY_400 = '#9ca3af'
const GRAY_100 = '#f3f4f6'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: INDIGO,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: NAVY,
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    color: INDIGO,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: 8.5,
    color: GRAY_500,
    marginRight: 10,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
    marginBottom: 7,
  },
  entryBlock: {
    marginBottom: 7,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#1f2937',
  },
  entryDate: {
    fontSize: 8.5,
    color: GRAY_400,
  },
  entrySubtitle: {
    fontSize: 8.5,
    color: GRAY_500,
    marginBottom: 3,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    color: INDIGO,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: GRAY_700,
  },
  bodyText: {
    fontSize: 9,
    color: GRAY_700,
    lineHeight: 1.5,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: GRAY_100,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    color: GRAY_500,
    marginRight: 4,
    marginBottom: 4,
  },
})

function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  )
}

function formatDate(d: string) {
  if (!d) return ''
  if (d.length === 7) {
    const [y, m] = d.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(m, 10) - 1]} ${y}`
  }
  return d
}

export function ResumePDFDocument({ resumeData }: { resumeData: ResumeData }) {
  const {
    personalInfo,
    summary,
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
  } = resumeData

  const p = personalInfo || {}
  const contacts = [p.email, p.phone, p.location, p.website, p.linkedin, p.github]
    .filter(Boolean) as string[]

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          {p.name ? <Text style={s.name}>{p.name}</Text> : null}
          {p.title ? <Text style={s.jobTitle}>{p.title}</Text> : null}
          <View style={s.contactRow}>
            {contacts.map((c, i) => (
              <Text key={i} style={s.contactItem}>{i > 0 ? `• ${c}` : c}</Text>
            ))}
          </View>
        </View>

        {/* ── Summary ── */}
        {summary ? (
          <View style={s.section}>
            <SectionTitle>Professional Summary</SectionTitle>
            <Text style={s.bodyText}>{summary}</Text>
          </View>
        ) : null}

        {/* ── Experience ── */}
        {experience.length > 0 ? (
          <View style={s.section}>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <View key={i} style={s.entryBlock}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{exp.position}</Text>
                  <Text style={s.entryDate}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={s.entrySubtitle}>
                  {exp.company}{exp.location ? `  •  ${exp.location}` : ''}
                </Text>
                {exp.description ? <Text style={{ ...s.bodyText, marginBottom: 3 }}>{exp.description}</Text> : null}
                {(exp.achievements || []).map((a, j) => <BulletItem key={j} text={a} />)}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Projects ── */}
        {projects.length > 0 ? (
          <View style={s.section}>
            <SectionTitle>Projects</SectionTitle>
            {projects.map((proj, i) => (
              <View key={i} style={s.entryBlock}>
                <Text style={s.entryTitle}>{proj.name}</Text>
                {proj.technologies?.length > 0 ? (
                  <Text style={{ ...s.entrySubtitle, marginBottom: 2 }}>
                    {proj.technologies.join(' · ')}
                  </Text>
                ) : null}
                {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Skills ── */}
        {skills.length > 0 ? (
          <View style={s.section}>
            <SectionTitle>Skills</SectionTitle>
            <View style={s.skillsWrap}>
              {skills.map((skill, i) => (
                <Text key={i} style={s.skillBadge}>{skill.name}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Education ── */}
        {education.length > 0 ? (
          <View style={s.section}>
            <SectionTitle>Education</SectionTitle>
            {education.map((edu, i) => (
              <View key={i} style={s.entryBlock}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </Text>
                  <Text style={s.entryDate}>
                    {formatDate(edu.startDate)} – {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </Text>
                </View>
                <Text style={s.entrySubtitle}>{edu.institution}</Text>
                {edu.gpa ? <Text style={s.bodyText}>GPA: {edu.gpa}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Certifications ── */}
        {certifications.length > 0 ? (
          <View style={s.section}>
            <SectionTitle>Certifications</SectionTitle>
            {certifications.map((cert, i) => (
              <View key={i} style={s.entryBlock}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{cert.name}</Text>
                  <Text style={s.entryDate}>{formatDate(cert.date)}</Text>
                </View>
                <Text style={s.entrySubtitle}>{cert.issuer}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
