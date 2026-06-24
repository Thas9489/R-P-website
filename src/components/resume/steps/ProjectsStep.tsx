'use client'

import { useState, KeyboardEvent } from 'react'
import { Plus, Pencil, Trash2, Code, ExternalLink, Github, Sparkles, RefreshCw, Check, Loader2, Star } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type FormState = Omit<Project, 'id'>
const defaultForm: FormState = {
  name: '',
  description: '',
  technologies: [],
  url: '',
  github: '',
  featured: false,
}

export default function ProjectsStep() {
  const { resumeData, addProject, updateProject, deleteProject } = useResumeStore()
  const projects = resumeData.projects

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [techInput, setTechInput] = useState('')
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [aiResult, setAiResult] = useState('')

  const openAdd = () => {
    setEditId(null)
    setForm(defaultForm)
    setErrors({})
    setTechInput('')
    setAiState('idle')
    setOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditId(project.id)
    setForm({
      name: project.name,
      description: project.description,
      technologies: [...project.technologies],
      url: project.url ?? '',
      github: project.github ?? '',
      featured: project.featured,
    })
    setErrors({})
    setTechInput('')
    setAiState('idle')
    setOpen(true)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editId) updateProject(editId, form)
    else addProject(form)
    setOpen(false)
  }

  const addTech = () => {
    const tech = techInput.trim()
    if (!tech || form.technologies.includes(tech)) return
    set('technologies', [...form.technologies, tech])
    setTechInput('')
  }

  const removeTech = (tech: string) => {
    set('technologies', form.technologies.filter((t) => t !== tech))
  }

  const handleTechKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTech()
    }
  }

  const handleAiGenerate = async () => {
    setAiState('loading')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'project',
          context: `Project: ${form.name}, Technologies: ${form.technologies.join(', ')}`,
          resumeData: { projects: resumeData.projects },
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setAiResult(data.result)
      setAiState('result')
    } catch {
      setAiState('idle')
    }
  }

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
          <Code className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No projects added yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Showcase your best work to stand out from the crowd</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <Code className="w-5 h-5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{project.name}</p>
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span key={tech} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-[10px] text-gray-400">+{project.technologies.length - 5}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                        <ExternalLink className="w-3 h-3" /> Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:underline">
                        <Github className="w-3 h-3" /> GitHub
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(project)} className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteProject(project.id)} className="h-7 w-7 p-0 text-gray-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={openAdd}
        className="w-full gap-2 border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/20"
      >
        <Plus className="w-4 h-4" />
        Add Project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Project Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. E-Commerce Platform"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={errors.name ? 'border-red-400' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleAiGenerate}
                  disabled={aiState === 'loading' || !form.name}
                  className="h-6 text-xs gap-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  {aiState === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                placeholder="Describe what this project does, its impact, and what you built..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                className={`resize-none text-sm ${errors.description ? 'border-red-400' : ''}`}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* AI result */}
            {aiState === 'result' && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Suggestion
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{aiResult}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { set('description', aiResult); setAiState('idle') }} className="h-6 text-xs gap-1 bg-blue-600 hover:bg-blue-700">
                    <Check className="w-3 h-3" /> Use
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAiGenerate} className="h-6 text-xs gap-1">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                </div>
              </div>
            )}

            {/* Technologies tag input */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Technologies <span className="text-gray-400 font-normal">(press Enter to add)</span></Label>
              {form.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {form.technologies.map((tech) => (
                    <span key={tech} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)} className="text-violet-400 hover:text-violet-600 leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React, TypeScript, Node.js..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  className="text-sm"
                />
                <Button type="button" variant="outline" onClick={addTech} className="flex-shrink-0 gap-1 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <ExternalLink className="w-3 h-3 inline mr-1" />Live URL
                </Label>
                <Input placeholder="https://myproject.com" value={form.url} onChange={(e) => set('url', e.target.value)} className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Github className="w-3 h-3 inline mr-1" />GitHub URL
                </Label>
                <Input placeholder="https://github.com/user/repo" value={form.github} onChange={(e) => set('github', e.target.value)} className="text-sm" />
              </div>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Featured Project</span>
                <p className="text-xs text-gray-400">Highlighted prominently on your resume</p>
              </div>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
              {editId ? 'Save Changes' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
