'use client'

import { useRef, useEffect, useState } from 'react'
import { ResumeData } from '@/types'
import { ModernTemplate } from './templates/ModernTemplate'
import { MinimalTemplate } from './templates/MinimalTemplate'
import { CreativeTemplate } from './templates/CreativeTemplate'
import { DeveloperTemplate } from './templates/DeveloperTemplate'
import { ExecutiveTemplate } from './templates/ExecutiveTemplate'

interface ResumePreviewProps {
  resumeData: ResumeData
  template: string
  scale?: number
}

const RESUME_WIDTH = 595
const RESUME_HEIGHT = 842

function TemplateRenderer({
  resumeData,
  template,
}: {
  resumeData: ResumeData
  template: string
}) {
  switch (template) {
    case 'minimal':
      return <MinimalTemplate resumeData={resumeData} />
    case 'creative':
      return <CreativeTemplate resumeData={resumeData} />
    case 'developer':
      return <DeveloperTemplate resumeData={resumeData} />
    case 'executive':
      return <ExecutiveTemplate resumeData={resumeData} />
    case 'modern':
    default:
      return <ModernTemplate resumeData={resumeData} />
  }
}

export function ResumePreview({ resumeData, template, scale }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [computedScale, setComputedScale] = useState(scale ?? 1)

  useEffect(() => {
    if (scale !== undefined) {
      setComputedScale(scale)
      return
    }

    function updateScale() {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      const newScale = containerWidth / RESUME_WIDTH
      setComputedScale(newScale)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [scale])

  return (
    <div ref={containerRef} id="resume-container" className="w-full" style={{ height: RESUME_HEIGHT * computedScale }}>
      <div
        id="resume-preview-root"
        style={{
          width: RESUME_WIDTH,
          minHeight: RESUME_HEIGHT,
          transformOrigin: 'top left',
          transform: `scale(${computedScale})`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <TemplateRenderer resumeData={resumeData} template={template} />
      </div>
    </div>
  )
}
