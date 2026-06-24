'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIButtonProps {
  onGenerate: () => Promise<void>
  loading?: boolean
  label?: string
  creditsRequired?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export default function AIButton({
  onGenerate,
  loading: externalLoading,
  label = 'Generate with AI',
  creditsRequired = 1,
  disabled = false,
  size = 'md',
  variant = 'default',
  className,
}: AIButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const [justDone, setJustDone] = useState(false)

  const isLoading = externalLoading ?? internalLoading
  const isDisabled = disabled || isLoading

  async function handleClick() {
    if (isDisabled) return
    setInternalLoading(true)
    try {
      await onGenerate()
      setJustDone(true)
      setTimeout(() => setJustDone(false), 2000)
    } finally {
      setInternalLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size]

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size]

  const variantClasses = {
    default: cn(
      'text-white font-semibold',
      'bg-gradient-to-r from-violet-600 to-indigo-600',
      'hover:from-violet-500 hover:to-indigo-500',
      'shadow-md shadow-violet-500/20',
      'hover:shadow-lg hover:shadow-violet-500/30',
      'disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none',
    ),
    outline: cn(
      'border-2 border-violet-500 text-violet-700 font-semibold bg-white',
      'hover:bg-violet-50',
      'disabled:border-slate-200 disabled:text-slate-400',
    ),
    ghost: cn(
      'text-violet-700 font-semibold',
      'hover:bg-violet-50',
      'disabled:text-slate-400',
    ),
  }[variant]

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
          'disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-1',
          sizeClasses,
          variantClasses,
          className,
        )}
      >
        {/* Glow effect (default variant only) */}
        {variant === 'default' && !isDisabled && (
          <span
            className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background: 'radial-gradient(circle at center, rgba(139,92,246,0.3), transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* Shimmer on loading */}
        {isLoading && variant === 'default' && (
          <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: 'shimmer-slide 1.2s linear infinite' }}
            />
          </span>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className={cn(iconSize, 'animate-spin')} />
              <span>Generating…</span>
            </motion.span>
          ) : justDone ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Zap className={iconSize} />
              <span>Done!</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Sparkles className={iconSize} />
              <span>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Credits cost indicator */}
      {creditsRequired > 0 && (
        <div className="flex items-center gap-1 pl-1">
          <Zap className="w-2.5 h-2.5 text-amber-500" />
          <span className="text-[10px] text-slate-400 font-medium">
            {creditsRequired} credit{creditsRequired !== 1 ? 's' : ''}
          </span>
        </div>
      )}

    </div>
  )
}
