'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { createBrowserClient } from '@/lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Search,
  Bookmark,
  LogOut,
  BrainCircuit,
  Menu,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Resumes', href: '/dashboard/resume', icon: FileText },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Globe },
  { label: 'Job Search', href: '/dashboard/jobs', icon: Search },
  { label: 'Saved Jobs', href: '/dashboard/saved-jobs', icon: Bookmark },
];

// ---------------------------------------------------------------------------
// Helper: initials from name / email
// ---------------------------------------------------------------------------

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return 'U';
}

// ---------------------------------------------------------------------------
// Shared nav item renderer
// ---------------------------------------------------------------------------

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
}

function NavLink({ item, active, onClick, compact }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 group
        ${
          active
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }
        ${compact ? 'justify-center' : ''}
      `}
      title={compact ? item.label : undefined}
    >
      <Icon
        size={18}
        className={`shrink-0 ${
          active
            ? 'text-white'
            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
        }`}
      />
      {!compact && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Desktop Sidebar (240px, hidden on mobile)
// ---------------------------------------------------------------------------

function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  };

  // Exact match for /dashboard, prefix match for all others
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
          <BrainCircuit size={16} className="text-white" />
        </div>
        <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          Resume<span className="gradient-text">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-3 border-t border-border pt-3 space-y-2 shrink-0">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {getInitials(user?.name, user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <LogOut size={16} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile Bottom Tab Bar
// ---------------------------------------------------------------------------

function MobileTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  // Show only the first 5 items in the tab bar to avoid overflow
  const tabItems = navItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around px-1 py-1">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors duration-200 min-w-0 ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span className="text-[10px] font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Mobile Drawer (slide-in from left, triggered by external toggle)
// ---------------------------------------------------------------------------

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const drawerVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 bottom-0 z-50 w-64 md:hidden flex flex-col bg-white dark:bg-gray-900 border-r border-border overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <BrainCircuit size={16} className="text-white" />
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  Resume<span className="gradient-text">AI</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onClick={onClose}
                />
              ))}
            </nav>

            {/* User section */}
            <div className="px-3 pb-4 border-t border-border pt-3 space-y-2 shrink-0">
              {/* Avatar + name */}
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {getInitials(user?.name, user?.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                <LogOut size={16} className="shrink-0" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Mobile Toggle Button (render this in your dashboard layout header)
// ---------------------------------------------------------------------------

interface MobileMenuToggleProps {
  open: boolean;
  onToggle: () => void;
}

export function MobileMenuToggle({ open, onToggle }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      aria-label="Toggle sidebar"
    >
      {open ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main export: composite sidebar component
// Renders desktop sidebar + mobile tab bar + mobile drawer toggle state
// ---------------------------------------------------------------------------

export default function DashboardSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop sticky sidebar */}
      <DesktopSidebar />

      {/* Mobile: collapsible drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Mobile: floating toggle button (top-left, shown on mobile) */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-xl bg-white dark:bg-gray-900 border border-border shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Mobile: bottom tab bar */}
      <MobileTabBar />
    </>
  );
}
