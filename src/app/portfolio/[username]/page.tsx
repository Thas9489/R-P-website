import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import type { ResumeData, PortfolioTheme } from '@/types'

// ─── Theme components ─────────────────────────────────────────────────────────
// These are imported lazily based on portfolio.theme.
// You should create these under src/components/portfolio/themes/

import ModernTheme from '@/components/portfolio/themes/ModernTheme'
import MinimalTheme from '@/components/portfolio/themes/MinimalTheme'
import DeveloperTheme from '@/components/portfolio/themes/DeveloperTheme'
import CreativeTheme from '@/components/portfolio/themes/CreativeTheme'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPortfolio(username: string) {
  try {
    const portfolio = await db.portfolio.findBySlug(username)
    if (!portfolio || !portfolio.isPublic) return null
    // Increment views (fire and forget)
    db.portfolio.incrementViews(portfolio.id).catch(() => {})
    return portfolio
  } catch {
    return null
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { username: string }
}): Promise<Metadata> {
  const portfolio = await getPortfolio(params.username)

  if (!portfolio) {
    return { title: 'Portfolio Not Found' }
  }

  const resumeData = portfolio.resume?.data as ResumeData | undefined
  const name = resumeData?.personalInfo?.name || params.username
  const summary = resumeData?.summary || `${name}'s professional portfolio`

  return {
    title: `${name} | Portfolio`,
    description: summary,
    openGraph: {
      title: `${name} | Portfolio`,
      description: summary,
      type: 'profile',
      siteName: 'ResumeAI',
    },
    twitter: {
      card: 'summary',
      title: `${name} | Portfolio`,
      description: summary,
    },
  }
}

// ─── Theme renderer ───────────────────────────────────────────────────────────

function ThemeRenderer({
  theme,
  resumeData,
  slug,
}: {
  theme: PortfolioTheme
  resumeData: ResumeData
  slug: string
}) {
  const props = { resumeData, slug }

  switch (theme) {
    case 'minimal':
      return <MinimalTheme {...props} />
    case 'developer':
      return <DeveloperTheme {...props} />
    case 'creative':
      return <CreativeTheme {...props} />
    case 'modern':
    default:
      return <ModernTheme {...props} />
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicPortfolioPage({
  params,
}: {
  params: { username: string }
}) {
  const portfolio = await getPortfolio(params.username)

  if (!portfolio) {
    notFound()
  }

  const resumeData = portfolio.resume?.data as ResumeData | undefined
  const theme = (portfolio.theme || 'modern') as PortfolioTheme

  if (!resumeData) {
    notFound()
  }

  return (
    <>
      <ThemeRenderer theme={theme} resumeData={resumeData} slug={portfolio.slug} />

      {/* "Powered by ResumeAI" badge — fixed bottom right */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 shadow-md hover:shadow-lg transition-shadow group"
        title="Built with ResumeAI"
      >
        <div className="w-4 h-4 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-white" aria-hidden="true">
            <path d="M9 12h6M9 16h4M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 8h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          Powered by ResumeAI
        </span>
      </a>
    </>
  )
}
