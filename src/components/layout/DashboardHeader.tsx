'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, ChevronRight } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Map route segments to human-readable labels
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  resume: 'My Resumes',
  portfolio: 'Portfolio',
  jobs: 'Job Search',
  'saved-jobs': 'Saved Jobs',
  settings: 'Settings',
  new: 'New Resume',
  preview: 'Preview',
};

function usePageBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname
    .split('/')
    .filter(Boolean)
    // skip the (dashboard) group segment if Next surfaces it
    .filter((s) => !s.startsWith('('));

  return segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg,
    // IDs / dynamic segments shown in shortened form
    isId: seg.length > 20 || (!SEGMENT_LABELS[seg] && i > 0),
  }));
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const breadcrumbs = usePageBreadcrumbs();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon =
    theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Left — breadcrumb */}
      <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <ChevronRight
                size={14}
                className="text-gray-400 dark:text-gray-600 shrink-0"
              />
            )}
            <span
              className={`text-sm truncate ${
                i === breadcrumbs.length - 1
                  ? 'font-semibold text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              } ${crumb.isId ? 'font-mono text-xs' : ''}`}
            >
              {crumb.isId ? '…' : crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right — theme toggle + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          title={`Current theme: ${theme ?? 'system'}`}
          aria-label="Toggle theme"
        >
          <ThemeIcon size={16} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? 'User avatar'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-border">
              {getInitials(user.name ?? user.email ?? 'U')}
            </div>
          )}
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
              {user.name ?? 'User'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
