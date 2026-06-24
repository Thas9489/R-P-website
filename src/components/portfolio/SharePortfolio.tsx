'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy,
  Check,
  X,
  Linkedin,
  Twitter,
  Mail,
  MessageCircle,
  Share2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SharePortfolioProps {
  url: string
  isOpen: boolean
  onClose: () => void
}

const SHARE_OPTIONS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-[#0077b5] hover:bg-[#005885]',
    href: (url: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=Check%20out%20my%20portfolio`,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: 'bg-slate-900 hover:bg-slate-700',
    href: (url: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check%20out%20my%20portfolio%20built%20with%20ResumeAI%20🚀`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-[#25D366] hover:bg-[#1da851]',
    href: (url: string) =>
      `https://wa.me/?text=${encodeURIComponent(`Check out my portfolio: ${url}`)}`,
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: 'bg-slate-500 hover:bg-slate-600',
    href: (url: string) =>
      `mailto:?subject=My%20Portfolio&body=${encodeURIComponent(`Hey, check out my portfolio: ${url}`)}`,
  },
]

export default function SharePortfolio({ url, isOpen, onClose }: SharePortfolioProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-4 h-4 text-indigo-600" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Share Portfolio
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* URL Copy bar */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Portfolio URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 truncate font-mono">
                {url}
              </div>
              <motion.button
                onClick={handleCopy}
                whileTap={{ scale: 0.95 }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              QR Code
            </label>
            <div className="flex justify-center">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm inline-flex">
                <QRCodeSVG
                  value={url}
                  size={160}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1e1b4b"
                />
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Scan to open portfolio on mobile
            </p>
          </div>

          {/* Share buttons */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Share Via
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SHARE_OPTIONS.map(({ id, label, icon: Icon, color, href }) => (
                <a
                  key={id}
                  href={href(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
