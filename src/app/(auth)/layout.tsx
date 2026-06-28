import Link from 'next/link'
import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(249,250,251,0.95) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      <header className="relative z-10 px-8 pt-7">
        <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-white" aria-hidden="true">
              <path d="M9 12h6M9 16h4M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 8h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            ResumeAI
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-200/60 dark:shadow-black/40 border border-gray-200 dark:border-gray-800 overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Footer badge */}
      <footer className="relative z-10 pb-7 flex justify-center">
        <div className="inline-flex items-center gap-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-2.5 shadow-sm">
          <div className="flex -space-x-1.5">
            {['bg-violet-500', 'bg-indigo-500', 'bg-blue-500'].map((color, i) => (
              <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 border-white dark:border-gray-900 flex items-center justify-center`}>
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Powering <span className="text-violet-600 dark:text-violet-400 font-semibold">10,000+</span> careers
          </span>
        </div>
      </footer>
    </div>
  )
}
