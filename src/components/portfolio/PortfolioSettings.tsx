'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Globe,
  Lock,
  Palette,
  Check,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Loader2,
  BarChart2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { Portfolio, PortfolioTheme } from '@/types'

interface PortfolioSettingsProps {
  portfolio: Portfolio
  onUpdate: (data: Partial<Portfolio>) => void
}

// ── Theme definitions ──────────────────────────────────────────────────────────
const THEMES: Array<{
  id: PortfolioTheme
  label: string
  description: string
  preview: React.ReactNode
}> = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Deep blue gradient, animations',
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-lg flex items-end p-2">
        <div className="space-y-1 w-full">
          <div className="h-2 bg-white/60 rounded w-3/4" />
          <div className="h-1.5 bg-indigo-400/80 rounded w-1/2" />
          <div className="h-1 bg-white/30 rounded w-full mt-1" />
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean Swiss design, lots of whitespace',
    preview: (
      <div className="w-full h-full bg-white border border-slate-200 rounded-lg flex items-start p-2">
        <div className="space-y-1.5 w-full">
          <div className="h-2 bg-slate-800 rounded w-3/4" />
          <div className="h-1.5 bg-blue-500 rounded w-1/3" />
          <div className="border-t border-slate-100 my-1" />
          <div className="h-1 bg-slate-200 rounded w-full" />
          <div className="h-1 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    ),
  },
  {
    id: 'developer',
    label: 'Developer',
    description: 'Terminal/code aesthetic, dark',
    preview: (
      <div className="w-full h-full bg-[#0d1117] rounded-lg flex items-start p-2">
        <div className="space-y-1 w-full">
          <div className="flex gap-1 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
            <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
            <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-[6px] text-[#58a6ff] font-mono">$</span>
            <div className="h-1 bg-[#c9d1d9]/60 rounded w-2/3" />
          </div>
          <div className="h-1 bg-[#3fb950]/60 rounded w-1/2 ml-2" />
          <div className="flex gap-1 items-center">
            <span className="text-[6px] text-[#58a6ff] font-mono">$</span>
            <div className="h-1 bg-[#c9d1d9]/40 rounded w-1/3" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Bold colors, artistic layout',
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-violet-600 to-pink-500 rounded-lg flex items-center justify-center">
        <div className="space-y-1 w-3/4">
          <div className="h-2 bg-white/80 rounded w-full" />
          <div className="h-1.5 bg-white/50 rounded w-2/3" />
          <div className="h-1 bg-white/30 rounded w-full" />
        </div>
      </div>
    ),
  },
]

// ── Slug availability states ───────────────────────────────────────────────────
type SlugState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function PortfolioSettings({ portfolio, onUpdate }: PortfolioSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<PortfolioTheme>(portfolio.theme)
  const [isPublic, setIsPublic] = useState(portfolio.isPublic)
  const [slug, setSlug] = useState(portfolio.slug)
  const [slugState, setSlugState] = useState<SlugState>('idle')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleThemeChange(theme: PortfolioTheme) {
    setSelectedTheme(theme)
    onUpdate({ theme })
  }

  async function handlePublicToggle(value: boolean) {
    setIsPublic(value)
    onUpdate({ isPublic: value })
  }

  async function checkSlugAvailability() {
    const trimmed = slug.trim().toLowerCase()
    if (trimmed.length < 3) {
      setSlugState('invalid')
      return
    }
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      setSlugState('invalid')
      return
    }
    if (trimmed === portfolio.slug) {
      setSlugState('available')
      return
    }

    setSlugState('checking')
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-slug', slug: trimmed }),
      })
      const data = await res.json()
      setSlugState(data.available ? 'available' : 'taken')
      if (data.available) onUpdate({ slug: trimmed })
    } catch {
      setSlugState('idle')
    }
  }

  async function handleSaveSlug() {
    if (slugState !== 'available') return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    onUpdate({ slug: slug.trim().toLowerCase() })
    setSaving(false)
  }

  function handleDelete() {
    if (deleteConfirm !== portfolio.slug) return
    onUpdate({ isPublic: false }) // trigger delete in parent
    setDeleteDialogOpen(false)
  }

  const portfolioUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${portfolio.slug}`

  const slugStateConfig = {
    idle: { color: 'text-slate-400', icon: null, text: '' },
    checking: { color: 'text-blue-500', icon: Loader2, text: 'Checking…' },
    available: { color: 'text-green-600', icon: Check, text: 'Available!' },
    taken: { color: 'text-red-500', icon: AlertTriangle, text: 'Already taken' },
    invalid: { color: 'text-red-500', icon: AlertTriangle, text: 'Use only letters, numbers, hyphens (min 3 chars)' },
  }[slugState]

  return (
    <div className="space-y-8">
      {/* ── View count ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{portfolio.views.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Total portfolio views</div>
          </div>
        </div>
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Portfolio
        </a>
      </div>

      {/* ── Theme selector ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Theme</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative p-3 rounded-2xl border-2 text-left transition-all',
                selectedTheme === theme.id
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white',
              )}
            >
              {/* Selected checkmark */}
              {selectedTheme === theme.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              {/* Preview thumbnail */}
              <div className="w-full h-20 mb-3 rounded-lg overflow-hidden">{theme.preview}</div>

              <div className="font-semibold text-slate-800 text-sm">{theme.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{theme.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Visibility toggle ────────────────────────────────────────────────────── */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isPublic ? 'bg-green-100' : 'bg-slate-200')}>
              {isPublic ? (
                <Globe className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">
                {isPublic ? 'Public' : 'Private'}
              </div>
              <div className="text-xs text-slate-400">
                {isPublic ? 'Anyone with the link can view' : 'Only you can view'}
              </div>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handlePublicToggle}
            aria-label="Toggle portfolio visibility"
          />
        </div>
      </div>

      {/* ── Slug editor ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Portfolio URL</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Your portfolio will be accessible at:{' '}
          <span className="text-indigo-600 font-mono">/p/your-slug</span>
        </p>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all">
            <span className="px-3 py-2.5 text-xs text-slate-400 border-r border-slate-100 bg-slate-50 whitespace-nowrap font-mono">
              /p/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                setSlugState('idle')
              }}
              onKeyDown={(e) => e.key === 'Enter' && checkSlugAvailability()}
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none font-mono"
              placeholder="your-name"
            />
          </div>
          <button
            onClick={checkSlugAvailability}
            disabled={slugState === 'checking'}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {slugState === 'checking' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Check'
            )}
          </button>
        </div>

        {/* Slug state feedback */}
        {slugState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-1.5 text-xs mt-2 ${slugStateConfig.color}`}
          >
            {slugStateConfig.icon && (
              <slugStateConfig.icon
                className={cn('w-3.5 h-3.5', slugState === 'checking' && 'animate-spin')}
              />
            )}
            {slugStateConfig.text}
          </motion.div>
        )}

        {slugState === 'available' && slug !== portfolio.slug && (
          <button
            onClick={handleSaveSlug}
            disabled={saving}
            className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save New URL'}
          </button>
        )}
      </div>

      {/* ── Visibility overview ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
        {isPublic ? (
          <Eye className="w-3.5 h-3.5 text-green-500 shrink-0" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <span className="font-mono truncate text-slate-600">{portfolioUrl}</span>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────────────── */}
      <div className="border border-red-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-xs text-slate-400 mb-3">
          Permanently delete this portfolio. This action cannot be undone.
        </p>
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Portfolio
        </button>
      </div>

      {/* ── Delete confirm dialog ────────────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Portfolio
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-slate-600 mb-4">
              This will permanently delete your portfolio and all its data. To confirm, type{' '}
              <strong className="font-mono text-slate-800">{portfolio.slug}</strong> below.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={portfolio.slug}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
            />
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== portfolio.slug}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Delete Forever
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
