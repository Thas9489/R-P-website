'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Eye,
  Bookmark,
  Sparkles,
  Plus,
  ArrowRight,
  Globe,
  Search,
  Edit3,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResumeCard {
  id: string;
  title: string;
  template: string;
  updatedAt: string;
}

interface DashboardClientProps {
  userName: string;
  userImage: string | null;
  resumes: ResumeCard[];
  resumeCount: number;
  savedJobCount: number;
  portfolioViews: number;
  portfolioSlug: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Gradient header colours per template
const TEMPLATE_COLORS: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  minimal: 'from-gray-500 to-gray-700',
  creative: 'from-pink-500 to-rose-600',
  developer: 'from-green-500 to-emerald-600',
  executive: 'from-amber-500 to-orange-600',
};

function templateGradient(template: string) {
  return TEMPLATE_COLORS[template] ?? 'from-blue-500 to-purple-600';
}

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, description }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className={`${iconBg} p-3 rounded-xl shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

function ResumeCardItem({ resume }: { resume: ResumeCard }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group"
    >
      {/* Coloured header band */}
      <div className={`h-2 bg-gradient-to-r ${templateGradient(resume.template)}`} />

      <div className="p-5">
        {/* Template badge */}
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mb-3 capitalize">
          <Layers size={11} />
          {resume.template}
        </span>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate leading-snug">
          {resume.title}
        </h3>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Clock size={12} />
          <span>Updated {timeAgo(resume.updatedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Link
            href={`/dashboard/resume/${resume.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Edit3 size={13} />
            Edit
          </Link>
          <Link
            href={`/dashboard/resume/${resume.id}/preview`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Eye size={13} />
            Preview
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

interface ChecklistItemProps {
  label: string;
  done: boolean;
}

function ChecklistItem({ label, done }: ChecklistItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      {done ? (
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
      ) : (
        <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
      )}
      <span
        className={`text-sm ${
          done
            ? 'line-through text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {label}
      </span>
      {!done && (
        <span className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-400">
          To do
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient({
  userName,
  userImage,
  resumes,
  resumeCount,
  savedJobCount,
  portfolioViews,
  portfolioSlug,
}: DashboardClientProps) {
  const greeting = getGreeting();
  const recentResumes = resumes.slice(0, 3);
  const showChecklist = resumeCount < 2;
  const hasResume = resumeCount > 0;
  const hasPhoto = !!userImage;
  const hasPortfolio = !!portfolioSlug;
  const hasJobs = savedJobCount > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Welcome ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Here&apos;s what&apos;s happening with your career toolkit today.
          </p>
        </div>
        <Link
          href="/dashboard/resume/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={16} />
          New Resume
        </Link>
      </motion.div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Resumes"
          value={resumeCount}
          icon={FileText}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          description={resumeCount === 1 ? '1 active' : `${resumeCount} total`}
        />
        <StatCard
          label="Portfolio Views"
          value={portfolioViews.toLocaleString()}
          icon={Eye}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          description="All time"
        />
        <StatCard
          label="Jobs Saved"
          value={savedJobCount}
          icon={Bookmark}
          iconColor="text-green-600 dark:text-green-400"
          iconBg="bg-green-50 dark:bg-green-900/20"
          description="In your list"
        />
      </motion.div>

      {/* ── Two-column layout: resumes + sidebar ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent resumes — takes 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Resumes
            </h2>
            {resumeCount > 3 && (
              <Link
                href="/dashboard/resume"
                className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recentResumes.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {recentResumes.map((r) => (
                <ResumeCardItem key={r.id} resume={r} />
              ))}

              {/* New resume slot if fewer than 3 */}
              {recentResumes.length < 3 && (
                <motion.div variants={fadeUp}>
                  <Link
                    href="/dashboard/resume/new"
                    className="h-full min-h-[168px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-200 p-5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Plus size={20} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
                      Create new resume
                    </span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <FileText size={26} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                No resumes yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                Create your first AI-powered resume and land your dream job.
              </p>
              <Link
                href="/dashboard/resume/new"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20"
              >
                <Plus size={15} />
                Create Resume
              </Link>
            </motion.div>
          )}
        </div>

        {/* Right column: quick actions + checklist */}
        <div className="space-y-5">

          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/resume/new"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-border hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Plus size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    New Resume
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    AI-powered builder
                  </p>
                </div>
                <ArrowRight size={15} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors shrink-0" />
              </Link>

              <Link
                href={portfolioSlug ? `/portfolio/${portfolioSlug}` : '/dashboard/portfolio'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-border hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Globe size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    View Portfolio
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {portfolioSlug ? 'Public page live' : 'Not set up yet'}
                  </p>
                </div>
                <ArrowRight size={15} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-purple-500 transition-colors shrink-0" />
              </Link>

              <Link
                href="/dashboard/jobs"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-border hover:border-green-400 dark:hover:border-green-500 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Search size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Search Jobs
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    AI match scoring
                  </p>
                </div>
                <ArrowRight size={15} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-green-500 transition-colors shrink-0" />
              </Link>
            </div>
          </div>

          {/* Getting started checklist */}
          {showChecklist && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Getting Started
                </h3>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Complete these steps to get the most out of ResumeAI
              </p>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700"
                  style={{
                    width: `${
                      ([hasResume, hasPhoto, hasPortfolio, hasJobs].filter(Boolean).length / 4) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                <ChecklistItem label="Create your first resume" done={hasResume} />
                <ChecklistItem label="Upload a profile photo" done={hasPhoto} />
                <ChecklistItem label="Generate your portfolio" done={hasPortfolio} />
                <ChecklistItem label="Save a job to track" done={hasJobs} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
