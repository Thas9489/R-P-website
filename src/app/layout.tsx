import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'ResumeAI — Build Your Career Story',
    template: '%s | ResumeAI',
  },
  description:
    'Build ATS-optimized resumes with AI, generate a stunning portfolio, and search jobs — all in one platform.',
  keywords: ['resume builder', 'AI resume', 'portfolio generator', 'job search', 'career'],
  authors: [{ name: 'ResumeAI' }],
  openGraph: {
    type: 'website',
    siteName: 'ResumeAI',
    title: 'ResumeAI — Build Your Career Story',
    description: 'AI-powered resume builder & portfolio generator',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
