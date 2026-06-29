import { Suspense } from 'react'
import Link from 'next/link'
import { getUser } from '@/lib/session'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import ResumeListClient from './_components/ResumeListClient'

export const metadata = { title: 'My Resumes' }

export default async function ResumesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const resumes = await db.resume.findMany(user.id)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            My Resumes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} — keep them fresh and ATS-ready.
          </p>
        </div>
        <Link
          href="/dashboard/resume/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-2.5 text-sm transition-colors shadow-sm w-fit"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Resume
        </Link>
      </div>

      <Suspense fallback={null}>
        <ResumeListClient initialResumes={resumes} />
      </Suspense>
    </div>
  )
}
