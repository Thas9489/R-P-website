'use client'

import { useState } from 'react'
import { BarChart2, Loader2, CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ResumeData, ATSAnalysis } from '@/types'
import { cn } from '@/lib/utils'

interface ATSScorePanelProps {
  resumeData: ResumeData
}

function ScoreRing({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const color =
    score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="55"
          y="55"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x="55"
          y="72"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fill="#9ca3af"
        >
          / 100
        </text>
      </svg>
      <span
        className="text-sm font-semibold"
        style={{ color }}
      >
        {score >= 75 ? 'Strong Match' : score >= 50 ? 'Partial Match' : 'Needs Work'}
      </span>
    </div>
  )
}

export function ATSScorePanel({ resumeData }: ATSScorePanelProps) {
  const [open, setOpen] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ATSAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!jobDescription.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Analysis failed')
      setResult(json.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) {
      setResult(null)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          ATS Score
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            ATS Score Checker
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {!result ? (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Paste the job description below to see how well your resume matches ATS requirements and get tailored improvement tips.
              </p>
              <Textarea
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="resize-none text-sm"
              />
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              <Button
                onClick={handleAnalyze}
                disabled={loading || !jobDescription.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-5">
              {/* Score ring */}
              <div className="flex justify-center pt-1">
                <ScoreRing score={result.score} />
              </div>

              {/* Keywords found */}
              {result.keywords.found.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Keywords Found ({result.keywords.found.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.found.map((kw) => (
                      <span
                        key={kw}
                        className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords missing */}
              {result.keywords.missing.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Missing Keywords ({result.keywords.missing.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.missing.map((kw) => (
                      <span
                        key={kw}
                        className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Suggestions
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setResult(null)}
              >
                Try a different job description
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
