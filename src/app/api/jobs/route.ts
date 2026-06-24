import { NextRequest, NextResponse } from 'next/server'
import type { Job } from '@/types'

const MOCK_JOBS: Job[] = [
  {
    id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'San Francisco, CA',
    type: 'full-time', salary: '$120k - $160k', remote: true,
    description: 'We are looking for a Senior Frontend Developer to join our growing team. You will work on building next-generation web applications using React and TypeScript.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Next.js experience', 'GraphQL knowledge'],
    url: 'https://jobs.example.com/1', source: 'LinkedIn', logo: '', postedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['React', 'TypeScript', 'Next.js'],
  },
  {
    id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'New York, NY',
    type: 'full-time', salary: '$100k - $140k', remote: false,
    description: 'Join our fast-growing startup as a Full Stack Engineer. Work across the entire stack using Node.js, React, and PostgreSQL.',
    requirements: ['Node.js', 'React', 'PostgreSQL', 'AWS experience'],
    url: 'https://jobs.example.com/2', source: 'Indeed', logo: '', postedAt: new Date(Date.now() - 172800000).toISOString(), tags: ['Node.js', 'React', 'PostgreSQL'],
  },
  {
    id: '3', title: 'Backend Engineer (Go)', company: 'CloudSystems', location: 'Remote',
    type: 'remote', salary: '$130k - $170k', remote: true,
    description: 'We are building distributed systems at scale. Looking for an experienced Go developer.',
    requirements: ['Go/Golang 3+ years', 'Kubernetes', 'Microservices', 'gRPC'],
    url: 'https://jobs.example.com/3', source: 'RemoteOK', logo: '', postedAt: new Date(Date.now() - 259200000).toISOString(), tags: ['Go', 'Kubernetes', 'Cloud'],
  },
  {
    id: '4', title: 'DevOps Engineer', company: 'InfraScale', location: 'Austin, TX',
    type: 'full-time', salary: '$110k - $150k', remote: true,
    description: 'Join our DevOps team and help us build reliable, scalable infrastructure using AWS and Terraform.',
    requirements: ['AWS', 'Terraform', 'Docker', 'CI/CD pipelines', 'Linux'],
    url: 'https://jobs.example.com/4', source: 'LinkedIn', logo: '', postedAt: new Date(Date.now() - 345600000).toISOString(), tags: ['AWS', 'DevOps', 'Terraform'],
  },
  {
    id: '5', title: 'Data Scientist', company: 'AI Research Co', location: 'Seattle, WA',
    type: 'full-time', salary: '$140k - $180k', remote: false,
    description: 'Apply ML/DL techniques to solve complex business problems. Work with large-scale datasets.',
    requirements: ['Python', 'PyTorch/TensorFlow', 'SQL', 'Statistics', 'ML experience'],
    url: 'https://jobs.example.com/5', source: 'Glassdoor', logo: '', postedAt: new Date(Date.now() - 432000000).toISOString(), tags: ['Python', 'ML', 'Data Science'],
  },
  {
    id: '6', title: 'Mobile Developer (React Native)', company: 'AppWorks', location: 'Remote',
    type: 'remote', salary: '$90k - $130k', remote: true,
    description: 'Build cross-platform mobile apps using React Native. Work closely with design and product teams.',
    requirements: ['React Native', 'iOS/Android', 'TypeScript', 'REST APIs'],
    url: 'https://jobs.example.com/6', source: 'WeWorkRemotely', logo: '', postedAt: new Date(Date.now() - 518400000).toISOString(), tags: ['React Native', 'Mobile', 'TypeScript'],
  },
  {
    id: '7', title: 'Product Designer', company: 'DesignStudio', location: 'Los Angeles, CA',
    type: 'full-time', salary: '$95k - $130k', remote: true,
    description: 'Design beautiful, user-centered experiences for web and mobile applications.',
    requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    url: 'https://jobs.example.com/7', source: 'LinkedIn', logo: '', postedAt: new Date(Date.now() - 604800000).toISOString(), tags: ['Figma', 'UX/UI', 'Design'],
  },
  {
    id: '8', title: 'Security Engineer', company: 'CyberDefense', location: 'Washington, DC',
    type: 'full-time', salary: '$140k - $190k', remote: false,
    description: 'Help us build and maintain secure systems. Conduct security audits and penetration testing.',
    requirements: ['Security audits', 'Penetration testing', 'AWS Security', 'SIEM'],
    url: 'https://jobs.example.com/8', source: 'Indeed', logo: '', postedAt: new Date(Date.now() - 691200000).toISOString(), tags: ['Security', 'Cybersecurity', 'AWS'],
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword')?.toLowerCase() || ''
  const location = searchParams.get('location')?.toLowerCase() || ''
  const type = searchParams.get('type') || 'all'
  const remote = searchParams.get('remote') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  let jobs = [...MOCK_JOBS]

  if (keyword) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(keyword) ||
        j.company.toLowerCase().includes(keyword) ||
        j.description.toLowerCase().includes(keyword) ||
        j.tags?.some((t) => t.toLowerCase().includes(keyword))
    )
  }

  if (location) {
    jobs = jobs.filter(
      (j) => j.location.toLowerCase().includes(location) || j.remote
    )
  }

  if (type !== 'all') {
    jobs = jobs.filter((j) => j.type === type)
  }

  if (remote) {
    jobs = jobs.filter((j) => j.remote)
  }

  // Add random match score
  jobs = jobs.map((j) => ({ ...j, matchScore: Math.floor(Math.random() * 40) + 60 }))

  const total = jobs.length
  const start = (page - 1) * limit
  const paged = jobs.slice(start, start + limit)

  return NextResponse.json({
    jobs: paged,
    total,
    page,
    hasMore: start + limit < total,
  })
}
