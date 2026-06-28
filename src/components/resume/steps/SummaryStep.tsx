'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Check, Edit3, Lightbulb, Loader2 } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WRITING_TIPS = [
  'Start with your professional title and years of experience.',
  'Mention 2-3 key skills or areas of expertise.',
  'Include a notable achievement or impact metric.',
  'Keep it concise — 3 to 5 sentences is ideal.',
  'Tailor the summary to the role you are targeting.',
  'Use active voice and strong action verbs.',
  'Avoid first-person pronouns (e.g., "I" or "my").',
]

const CHAR_MIN = 150
const CHAR_MAX = 500

type AIState = 'idle' | 'loading' | 'result'

export default function SummaryStep() {
  const { resumeData, setSummary } = useResumeStore()
  const { summary, personalInfo } = resumeData

  const [aiState, setAiState] = useState<AIState>('idle')
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState('')

  const charCount = summary.length
  const isUnder = charCount < CHAR_MIN
  const isOver = charCount > CHAR_MAX

  const getCharColor = () => {
    if (isOver) return 'text-red-500'
    if (isUnder && charCount > 0) return 'text-amber-500'
    return 'text-green-600 dark:text-green-400'
  }

  const handleGenerate = async () => {
    setAiState('loading')
    setAiError('')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 35000)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          context: `Name: ${personalInfo.name}, Title: ${personalInfo.title}`,
          resumeData: { personalInfo, summary },
        }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'AI generation failed')
      }
      const data = await res.json()
      setAiResult(data.result)
      setAiState('result')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setAiError('Request timed out. Please try again.')
      } else {
        setAiError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setAiState('idle')
    } finally {
      clearTimeout(timeout)
    }
  }

  const handleUseResult = () => {
    setSummary(aiResult)
    setAiState('idle')
    setAiResult('')
  }

  const handleEditResult = () => {
    setSummary(aiResult)
    setAiState('idle')
    setAiResult('')
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Professional Summary
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerate}
                disabled={aiState === 'loading'}
                className="h-7 text-xs gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {aiState === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate with AI
              </Button>
            </div>

            <Textarea
              placeholder="Write a compelling professional summary that highlights your experience, key skills, and career goals..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={7}
              className={cn(
                'resize-none text-sm leading-relaxed',
                isOver ? 'border-red-400 focus-visible:ring-red-400' : '',
              )}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Recommended: {CHAR_MIN}–{CHAR_MAX} characters
              </div>
              <div className={cn('text-xs font-medium tabular-nums', getCharColor())}>
                {charCount} / {CHAR_MAX}
              </div>
            </div>

            {isOver && (
              <p className="text-xs text-red-500 mt-1">
                Your summary is too long. Try to keep it under {CHAR_MAX} characters.
              </p>
            )}
            {isUnder && charCount > 0 && (
              <p className="text-xs text-amber-500 mt-1">
                A bit short. Add more detail to reach {CHAR_MIN} characters.
              </p>
            )}
            {aiError && (
              <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1.5">
                {aiError}
              </p>
            )}
          </div>

          {/* AI Result preview */}
          {aiState === 'result' && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  AI Suggestion
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                {aiResult}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={handleUseResult}
                  className="h-7 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  Use this
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerate}
                  className="h-7 text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditResult}
                  className="h-7 text-xs gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Writing tips sidebar */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Writing Tips
            </span>
          </div>
          <ul className="space-y-2.5">
            {WRITING_TIPS.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
