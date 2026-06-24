'use client'

import { useState, KeyboardEvent } from 'react'
import { Plus, Zap, Sparkles, Loader2 } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Skill, SkillLevel } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const LEVEL_COLORS: Record<SkillLevel, string> = {
  Beginner: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Advanced: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Expert: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}

const LEVEL_DOT_COLORS: Record<SkillLevel, string> = {
  Beginner: 'bg-gray-400',
  Intermediate: 'bg-blue-500',
  Advanced: 'bg-indigo-500',
  Expert: 'bg-violet-500',
}

const POPULAR_SKILLS: Array<{ name: string; level: SkillLevel }> = [
  { name: 'JavaScript', level: 'Advanced' },
  { name: 'TypeScript', level: 'Intermediate' },
  { name: 'React', level: 'Advanced' },
  { name: 'Node.js', level: 'Intermediate' },
  { name: 'Python', level: 'Intermediate' },
  { name: 'SQL', level: 'Intermediate' },
  { name: 'Git', level: 'Advanced' },
  { name: 'HTML/CSS', level: 'Advanced' },
  { name: 'Next.js', level: 'Intermediate' },
  { name: 'AWS', level: 'Beginner' },
  { name: 'Docker', level: 'Intermediate' },
  { name: 'GraphQL', level: 'Intermediate' },
  { name: 'Figma', level: 'Beginner' },
  { name: 'Tailwind CSS', level: 'Advanced' },
  { name: 'Vue.js', level: 'Intermediate' },
]

export default function SkillsStep() {
  const { resumeData, addSkill, removeSkill, setSkills } = useResumeStore()
  const skills = resumeData.skills

  const [inputName, setInputName] = useState('')
  const [inputLevel, setInputLevel] = useState<SkillLevel>('Intermediate')
  const [aiState, setAiState] = useState<'idle' | 'loading'>('idle')
  const [inputError, setInputError] = useState('')

  const hasSkill = (name: string) =>
    skills.some((s) => s.name.toLowerCase() === name.toLowerCase())

  const handleAdd = () => {
    const name = inputName.trim()
    if (!name) { setInputError('Please enter a skill name'); return }
    if (hasSkill(name)) { setInputError('This skill is already added'); return }
    addSkill({ name, level: inputLevel })
    setInputName('')
    setInputError('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
  }

  const handleAiSuggest = async () => {
    setAiState('loading')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'skills',
          context: `Current skills: ${skills.map((s) => s.name).join(', ')}`,
          resumeData: {
            personalInfo: resumeData.personalInfo,
            experience: resumeData.experience,
            skills: resumeData.skills,
          },
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      // Expect result to be a JSON array or newline-separated list
      let suggested: string[] = []
      try {
        suggested = JSON.parse(data.result)
      } catch {
        suggested = data.result.split('\n').map((s: string) => s.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean)
      }
      suggested.forEach((name) => {
        if (!hasSkill(name)) addSkill({ name, level: 'Intermediate' })
      })
    } catch {
      // silent fail
    } finally {
      setAiState('idle')
    }
  }

  // Group skills by level for display
  const grouped = SKILL_LEVELS.reduce<Record<SkillLevel, Skill[]>>(
    (acc, level) => ({ ...acc, [level]: skills.filter((s) => s.level === level) }),
    { Beginner: [], Intermediate: [], Advanced: [], Expert: [] },
  )

  const unpopularSkills = POPULAR_SKILLS.filter((s) => !hasSkill(s.name))

  return (
    <div className="space-y-5">
      {/* Add skill input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Add a Skill</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAiSuggest}
            disabled={aiState === 'loading'}
            className="h-7 text-xs gap-1.5 border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/20"
          >
            {aiState === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Suggest Skills
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="e.g. React, Python, Figma..."
              value={inputName}
              onChange={(e) => { setInputName(e.target.value); setInputError('') }}
              onKeyDown={handleKeyDown}
              className={cn('h-9 text-sm', inputError ? 'border-red-400' : '')}
            />
            {inputError && <p className="text-xs text-red-500 mt-1">{inputError}</p>}
          </div>
          <select
            value={inputLevel}
            onChange={(e) => setInputLevel(e.target.value as SkillLevel)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Button onClick={handleAdd} className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 flex-shrink-0">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      {/* Current skills cloud */}
      {skills.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Your Skills <span className="text-gray-400 font-normal">({skills.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {SKILL_LEVELS.map((level) => {
              if (grouped[level].length === 0) return null
              return (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('w-2 h-2 rounded-full', LEVEL_DOT_COLORS[level])} />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{level}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {grouped[level].map((skill) => (
                      <span
                        key={skill.name}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all',
                          LEVEL_COLORS[skill.level],
                        )}
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.name)}
                          className="opacity-60 hover:opacity-100 transition-opacity leading-none ml-0.5"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick-add popular skills */}
      {unpopularSkills.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Add — Popular Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {unpopularSkills.map((skill) => (
              <button
                key={skill.name}
                type="button"
                onClick={() => addSkill(skill)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                  'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
                  'hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:text-blue-400 dark:hover:bg-blue-900/20',
                )}
              >
                <Plus className="w-3 h-3" />
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="text-center py-6 text-gray-400 dark:text-gray-600 text-sm">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Add skills above or use AI to suggest relevant ones based on your experience.
        </div>
      )}
    </div>
  )
}
