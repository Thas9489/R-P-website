'use client';

import { useState, useRef, useTransition } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Palette,
  CreditCard,
  AlertTriangle,
  Camera,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Check,
  Loader2,
  Upload,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'appearance' | 'billing' | 'account';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'account', label: 'Account', icon: AlertTriangle },
];

// Mock credit history — replace with real API data
const CREDIT_HISTORY = [
  { id: '1', date: '2024-12-20', description: 'Resume summary generated', amount: -1 },
  { id: '2', date: '2024-12-19', description: 'ATS analysis', amount: -2 },
  { id: '3', date: '2024-12-18', description: 'Welcome bonus', amount: 10 },
  { id: '4', date: '2024-12-17', description: 'Experience rewrite', amount: -1 },
  { id: '5', date: '2024-12-16', description: 'Starter pack purchase', amount: 50 },
];

// ─── Tab content components ───────────────────────────────────────────────────

function ProfileTab() {
  const { user, refresh } = useUser();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to /api/upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setAvatarPreview(data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    startSave(async () => {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username }),
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const currentAvatar = avatarPreview ?? user?.image ?? null;

  return (
    <div className="space-y-8">
      {/* Avatar section */}
      <div className="flex items-start gap-6">
        <div className="relative shrink-0">
          {currentAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentAvatar}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-border">
              {getInitials(user?.name ?? user?.email ?? 'U')}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-border shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Change photo"
          >
            <Camera size={14} className="text-gray-600 dark:text-gray-400" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Profile Photo
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            JPG, PNG or GIF. Max 5 MB.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Upload size={13} />
            Upload new photo
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Email cannot be changed.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <div className="flex items-center">
            <span className="px-4 py-2.5 rounded-l-xl border border-r-0 border-border bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-sm">
              resumeai.io/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))
              }
              placeholder="your-handle"
              className="flex-1 px-4 py-2.5 rounded-r-xl border border-border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Only lowercase letters, numbers, hyphens and underscores.
          </p>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <Check size={15} />
          ) : null}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>

        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-green-600 dark:text-green-400 font-medium"
            >
              Profile updated successfully.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type AppTheme = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: AppTheme; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', description: 'Always use the light theme', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Always use the dark theme', icon: Moon },
  { value: 'system', label: 'System', description: 'Follow your OS preference', icon: Monitor },
];

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Theme</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Choose how ResumeAI looks to you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-border bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-800/40'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {label}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function BillingTab() {
  const { user } = useUser();
  const credits = user?.credits ?? 0;
  const creditPct = Math.min(100, (credits / 100) * 100);

  const PLANS = [
    {
      name: 'Starter',
      price: '$9',
      period: '/mo',
      credits: 50,
      features: ['50 AI credits/mo', 'Unlimited resumes', 'Portfolio page', 'ATS analysis'],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/mo',
      credits: 200,
      features: ['200 AI credits/mo', 'Priority AI', 'Custom domain', 'Advanced analytics', 'Email support'],
      highlighted: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Current credits */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              AI Credits
            </span>
          </div>
          <span className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {credits}
            <span className="text-base font-medium text-amber-600 dark:text-amber-400 ml-1">
              / 100
            </span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${creditPct}%` }}
          />
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Each AI action uses 1–3 credits. Credits reset monthly on Pro plans.
        </p>
      </div>

      {/* Upgrade plans */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Upgrade Your Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-5 ${
                plan.highlighted
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                  : 'border-border bg-white dark:bg-gray-900'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-md">
                  Most Popular
                </span>
              )}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {plan.period}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                {plan.name}
              </p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-md shadow-blue-500/20'
                    : 'border border-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Get {plan.name}
                <ExternalLink size={13} className="inline ml-1.5 opacity-70" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Credit History
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-5 py-3">
                  Description
                </th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-5 py-3">
                  Credits
                </th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-5 py-3 hidden sm:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {CREDIT_HISTORY.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                    {entry.description}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold tabular-nums ${
                      entry.amount > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400 dark:text-gray-500 hidden sm:table-cell text-xs">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AccountTab() {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_PHRASE = 'delete my account';

  return (
    <div className="space-y-6">
      {/* Export data */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Export Your Data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Download a copy of all your resumes, portfolio, and saved jobs.
        </p>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight size={15} />
          Export Data
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
            Danger Zone
          </h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-5">
          Once you delete your account, there is no going back. All resumes, portfolios, and saved
          jobs will be permanently removed.
        </p>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-red-700 dark:text-red-400">
            Type{' '}
            <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded text-red-800 dark:text-red-300 text-xs">
              {CONFIRM_PHRASE}
            </span>{' '}
            to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            className="w-full px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-red-300 dark:placeholder-red-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          <button
            disabled={confirmText !== CONFIRM_PHRASE}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-md shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    appearance: <AppearanceTab />,
    billing: <BillingTab />,
    account: <AccountTab />,
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Manage your account, appearance, and billing preferences.
        </p>
      </div>

      {/* Tab list */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === id
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {activeTab === id && (
              <motion.div
                layoutId="settings-tab-bg"
                className="absolute inset-0 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <Icon size={15} className="relative z-10 shrink-0" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {TAB_CONTENT[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
