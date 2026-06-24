'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResumeData, ResumeTemplate } from '@/types'
import { generateId } from '@/lib/utils'

const defaultResumeData: ResumeData = {
  personalInfo: {
    name: '', title: '', email: '', phone: '', location: '',
    website: '', linkedin: '', github: '', twitter: '', profileImage: '',
  },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  awards: [],
  references: [],
}

interface ResumeStore {
  resumeId: string | null
  title: string
  template: ResumeTemplate
  resumeData: ResumeData
  currentStep: number
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null

  // Setters
  setResumeId: (id: string) => void
  setTitle: (title: string) => void
  setTemplate: (template: ResumeTemplate) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  markSaved: () => void
  setIsSaving: (saving: boolean) => void
  resetStore: () => void

  // Personal Info
  setPersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void

  // Summary
  setSummary: (summary: string) => void

  // Education
  addEducation: (edu: Omit<ResumeData['education'][0], 'id'>) => void
  updateEducation: (id: string, edu: Partial<ResumeData['education'][0]>) => void
  deleteEducation: (id: string) => void

  // Experience
  addExperience: (exp: Omit<ResumeData['experience'][0], 'id'>) => void
  updateExperience: (id: string, exp: Partial<ResumeData['experience'][0]>) => void
  deleteExperience: (id: string) => void

  // Projects
  addProject: (proj: Omit<ResumeData['projects'][0], 'id'>) => void
  updateProject: (id: string, proj: Partial<ResumeData['projects'][0]>) => void
  deleteProject: (id: string) => void

  // Skills
  setSkills: (skills: ResumeData['skills']) => void
  addSkill: (skill: ResumeData['skills'][0]) => void
  removeSkill: (name: string) => void

  // Certifications
  addCertification: (cert: Omit<ResumeData['certifications'][0], 'id'>) => void
  updateCertification: (id: string, cert: Partial<ResumeData['certifications'][0]>) => void
  deleteCertification: (id: string) => void

  // Awards
  addAward: (award: Omit<ResumeData['awards'][0], 'id'>) => void
  updateAward: (id: string, award: Partial<ResumeData['awards'][0]>) => void
  deleteAward: (id: string) => void

  // References
  addReference: (ref: Omit<ResumeData['references'][0], 'id'>) => void
  updateReference: (id: string, ref: Partial<ResumeData['references'][0]>) => void
  deleteReference: (id: string) => void

  // Load existing resume
  loadResume: (data: { id: string; title: string; template: string; data: ResumeData }) => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumeId: null,
      title: 'My Resume',
      template: 'modern',
      resumeData: defaultResumeData,
      currentStep: 0,
      isDirty: false,
      isSaving: false,
      lastSaved: null,

      setResumeId: (id) => set({ resumeId: id }),
      setTitle: (title) => set({ title, isDirty: true }),
      setTemplate: (template) => set({ template, isDirty: true }),
      setCurrentStep: (step) => set({ currentStep: Math.max(0, Math.min(8, step)) }),
      nextStep: () => set((s) => ({ currentStep: Math.min(8, s.currentStep + 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
      setIsSaving: (saving) => set({ isSaving: saving }),
      resetStore: () => set({ resumeId: null, title: 'My Resume', template: 'modern', resumeData: defaultResumeData, currentStep: 0, isDirty: false }),

      setPersonalInfo: (info) =>
        set((s) => ({ resumeData: { ...s.resumeData, personalInfo: { ...s.resumeData.personalInfo, ...info } }, isDirty: true })),

      setSummary: (summary) =>
        set((s) => ({ resumeData: { ...s.resumeData, summary }, isDirty: true })),

      addEducation: (edu) =>
        set((s) => ({ resumeData: { ...s.resumeData, education: [...s.resumeData.education, { ...edu, id: generateId() }] }, isDirty: true })),
      updateEducation: (id, edu) =>
        set((s) => ({ resumeData: { ...s.resumeData, education: s.resumeData.education.map((e) => e.id === id ? { ...e, ...edu } : e) }, isDirty: true })),
      deleteEducation: (id) =>
        set((s) => ({ resumeData: { ...s.resumeData, education: s.resumeData.education.filter((e) => e.id !== id) }, isDirty: true })),

      addExperience: (exp) =>
        set((s) => ({ resumeData: { ...s.resumeData, experience: [...s.resumeData.experience, { ...exp, id: generateId() }] }, isDirty: true })),
      updateExperience: (id, exp) =>
        set((s) => ({ resumeData: { ...s.resumeData, experience: s.resumeData.experience.map((e) => e.id === id ? { ...e, ...exp } : e) }, isDirty: true })),
      deleteExperience: (id) =>
        set((s) => ({ resumeData: { ...s.resumeData, experience: s.resumeData.experience.filter((e) => e.id !== id) }, isDirty: true })),

      addProject: (proj) =>
        set((s) => ({ resumeData: { ...s.resumeData, projects: [...s.resumeData.projects, { ...proj, id: generateId() }] }, isDirty: true })),
      updateProject: (id, proj) =>
        set((s) => ({ resumeData: { ...s.resumeData, projects: s.resumeData.projects.map((p) => p.id === id ? { ...p, ...proj } : p) }, isDirty: true })),
      deleteProject: (id) =>
        set((s) => ({ resumeData: { ...s.resumeData, projects: s.resumeData.projects.filter((p) => p.id !== id) }, isDirty: true })),

      setSkills: (skills) =>
        set((s) => ({ resumeData: { ...s.resumeData, skills }, isDirty: true })),
      addSkill: (skill) =>
        set((s) => ({ resumeData: { ...s.resumeData, skills: [...s.resumeData.skills.filter((sk) => sk.name !== skill.name), skill] }, isDirty: true })),
      removeSkill: (name) =>
        set((s) => ({ resumeData: { ...s.resumeData, skills: s.resumeData.skills.filter((sk) => sk.name !== name) }, isDirty: true })),

      addCertification: (cert) =>
        set((s) => ({ resumeData: { ...s.resumeData, certifications: [...s.resumeData.certifications, { ...cert, id: generateId() }] }, isDirty: true })),
      updateCertification: (id, cert) =>
        set((s) => ({ resumeData: { ...s.resumeData, certifications: s.resumeData.certifications.map((c) => c.id === id ? { ...c, ...cert } : c) }, isDirty: true })),
      deleteCertification: (id) =>
        set((s) => ({ resumeData: { ...s.resumeData, certifications: s.resumeData.certifications.filter((c) => c.id !== id) }, isDirty: true })),

      addAward: (award) =>
        set((s) => ({ resumeData: { ...s.resumeData, awards: [...s.resumeData.awards, { ...award, id: generateId() }] }, isDirty: true })),
      updateAward: (id, award) =>
        set((s) => ({ resumeData: { ...s.resumeData, awards: s.resumeData.awards.map((a) => a.id === id ? { ...a, ...award } : a) }, isDirty: true })),
      deleteAward: (id) =>
        set((s) => ({ resumeData: { ...s.resumeData, awards: s.resumeData.awards.filter((a) => a.id !== id) }, isDirty: true })),

      addReference: (ref) =>
        set((s) => ({ resumeData: { ...s.resumeData, references: [...s.resumeData.references, { ...ref, id: generateId() }] }, isDirty: true })),
      updateReference: (id, ref) =>
        set((s) => ({ resumeData: { ...s.resumeData, references: s.resumeData.references.map((r) => r.id === id ? { ...r, ...ref } : r) }, isDirty: true })),
      deleteReference: (id) =>
        set((s) => ({ resumeData: { ...s.resumeData, references: s.resumeData.references.filter((r) => r.id !== id) }, isDirty: true })),

      loadResume: ({ id, title, template, data }) =>
        set({ resumeId: id, title, template: template as ResumeTemplate, resumeData: data, isDirty: false }),
    }),
    { name: 'resume-store', partialize: (s) => ({ resumeId: s.resumeId, title: s.title, template: s.template, resumeData: s.resumeData }) }
  )
)
