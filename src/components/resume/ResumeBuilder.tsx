'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  User2,
  FileText,
  GraduationCap,
  Briefcase,
  Code,
  Zap,
  Award,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { ResumeTemplate } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Step components
import PersonalInfoStep from './steps/PersonalInfoStep'
import SummaryStep from './steps/SummaryStep'
import EducationStep from './steps/EducationStep'
import ExperienceStep from './steps/ExperienceStep'
import ProjectsStep from './steps/ProjectsStep'
import SkillsStep from './steps/SkillsStep'
import CertificationsStep from './steps/CertificationsStep'
import AwardsStep from './steps/AwardsStep'
import ReferencesStep from './steps/ReferencesStep'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { ATSScorePanel } from '@/components/resume/ATSScorePanel'

interface ResumeBuilderProps {
  resumeId: string
}

const STEPS = [
  { label: 'Personal Info', icon: User2, description: 'Basic contact information' },
  { label: 'Summary', icon: FileText, description: 'Professional summary' },
  { label: 'Education', icon: GraduationCap, description: 'Academic background' },
  { label: 'Experience', icon: Briefcase, description: 'Work history' },
  { label: 'Projects', icon: Code, description: 'Portfolio projects' },
  { label: 'Skills', icon: Zap, description: 'Technical & soft skills' },
  { label: 'Certifications', icon: Award, description: 'Professional certifications' },
  { label: 'Awards', icon: Trophy, description: 'Honors & achievements' },
  { label: 'References', icon: Users, description: 'Professional references' },
] as const

const TEMPLATES: { value: ResumeTemplate; label: string }[] = [
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
  { value: 'developer', label: 'Developer' },
  { value: 'executive', label: 'Executive' },
]

const STEP_COMPONENTS = [
  PersonalInfoStep,
  SummaryStep,
  EducationStep,
  ExperienceStep,
  ProjectsStep,
  SkillsStep,
  CertificationsStep,
  AwardsStep,
  ReferencesStep,
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved'

export default function ResumeBuilder({ resumeId }: ResumeBuilderProps) {
  const {
    currentStep,
    nextStep,
    prevStep,
    setCurrentStep,
    setResumeId,
    template,
    setTemplate,
    resumeData,
    isDirty,
    setIsSaving,
    markSaved,
  } = useResumeStore()

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [direction, setDirection] = useState<1 | -1>(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevStepRef = useRef(currentStep)

  // Set resume ID on mount
  useEffect(() => {
    setResumeId(resumeId)
  }, [resumeId, setResumeId])

  // Auto-save with 2s debounce
  const save = useCallback(async () => {
    setSaveStatus('saving')
    setIsSaving(true)
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: resumeData, template }),
      })
      if (!res.ok) throw new Error('Save failed')
      markSaved()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('unsaved')
    } finally {
      setIsSaving(false)
    }
  }, [resumeId, resumeData, template, markSaved, setIsSaving])

  useEffect(() => {
    if (!isDirty) return
    setSaveStatus('unsaved')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(save, 2000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [isDirty, resumeData, template, save])

  const handleStepChange = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1)
    prevStepRef.current = currentStep
    setCurrentStep(newStep)
  }

  const handleNext = () => {
    if (currentStep < 8) {
      setDirection(1)
      nextStep()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1)
      prevStep()
    }
  }

  const StepComponent = STEP_COMPONENTS[currentStep]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400 tracking-tight">
              ResumeAI
            </span>
            <span className="hidden sm:block text-gray-300 dark:text-gray-700">|</span>
            <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
              Resume Builder
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status */}
            <div className="flex items-center gap-1.5 text-xs">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="text-amber-500">Unsaved changes</span>
              )}
            </div>

            {/* ATS Score */}
            <ATSScorePanel resumeData={resumeData} />

            {/* Template selector */}
            <Select
              value={template}
              onValueChange={(v) => setTemplate(v as ResumeTemplate)}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-3 pt-1">
          {/* Progress fill */}
          <div className="relative mb-2 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
              animate={{ width: `${((currentStep + 1) / 9) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>

          {/* Step labels */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isDone = index < currentStep
              return (
                <button
                  key={index}
                  onClick={() => handleStepChange(index)}
                  className={cn(
                    'flex flex-col items-center gap-1 group transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded',
                  )}
                  title={step.label}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 border-2',
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white scale-110'
                        : isDone
                        ? 'bg-blue-100 border-blue-300 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                        : 'bg-white border-gray-200 text-gray-400 dark:bg-gray-900 dark:border-gray-700 group-hover:border-blue-300 group-hover:text-blue-500',
                    )}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'hidden md:block text-[10px] font-medium transition-colors duration-200 leading-none',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : isDone
                        ? 'text-blue-500 dark:text-blue-500'
                        : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400',
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">
        {/* Left panel: form (60%) */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Step header */}
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {STEPS[currentStep].label}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {STEPS[currentStep].description}
            </p>
          </div>

          {/* Animated step content */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="h-full"
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-sm text-gray-400 dark:text-gray-600">
              Step {currentStep + 1} of 9
            </span>

            {currentStep < 8 ? (
              <Button onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={save}
                disabled={saveStatus === 'saving'}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Finish & Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right panel: preview (40%, desktop only) */}
        <aside className="hidden lg:flex flex-col w-[42%] max-w-[520px]">
          <div className="sticky top-[120px] h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <div className="flex-1 min-h-0 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-md">
              <div className="h-full overflow-auto p-2">
                <ResumePreview resumeData={resumeData} template={template} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
