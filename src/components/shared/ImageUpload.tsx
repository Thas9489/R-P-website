'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Camera, Loader2, AlertCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
  shape?: 'circle' | 'square'
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type UploadStatus = 'idle' | 'uploading' | 'error'

export default function ImageUpload({
  value,
  onChange,
  className,
  shape = 'circle',
}: ImageUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const displayImage = preview ?? value

  const onDrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejections
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0]
        if (err.code === 'file-too-large') {
          setError('File is too large. Maximum size is 5 MB.')
        } else if (err.code === 'file-invalid-type') {
          setError('Invalid file type. Use JPEG, PNG, WebP, or GIF.')
        } else {
          setError('Could not upload file. Please try again.')
        }
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      setError(null)
      setStatus('uploading')
      setProgress(0)

      // Local preview immediately
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress (real XHR would use onUploadProgress)
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 12, 85))
        }, 120)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!res.ok) {
          const { error: apiError } = await res.json().catch(() => ({}))
          throw new Error(apiError ?? 'Upload failed')
        }

        setProgress(100)
        const { url } = await res.json()

        URL.revokeObjectURL(objectUrl)
        setPreview(null)
        onChange(url)
        setStatus('idle')
        setProgress(0)
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        setPreview(null)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
        setProgress(0)
      }
    },
    [onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES.reduce<Record<string, string[]>>((acc, type) => {
      acc[type] = []
      return acc
    }, {}),
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: status === 'uploading',
  })

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setPreview(null)
    setError(null)
    setStatus('idle')
  }

  const isUploading = status === 'uploading'
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative group cursor-pointer transition-all duration-200',
          'w-28 h-28',
          shapeClass,
          isDragActive
            ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
            : 'ring-2 ring-transparent hover:ring-indigo-300 hover:ring-offset-2',
          isUploading && 'cursor-wait',
        )}
      >
        <input {...getInputProps()} />

        {/* Background / image */}
        <div
          className={cn(
            'w-full h-full overflow-hidden bg-slate-100',
            shapeClass,
          )}
        >
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt="Profile"
              className={cn('w-full h-full object-cover', isUploading && 'opacity-50')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <User className="w-10 h-10 text-slate-300" />
            </div>
          )}
        </div>

        {/* Upload overlay */}
        <AnimatePresence>
          {!isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isDragActive ? 1 : 0 }}
              whileHover={{ opacity: 1 }}
              className={cn(
                'absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center gap-1',
                shapeClass,
              )}
            >
              {isDragActive ? (
                <Upload className="w-6 h-6 text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
              <span className="text-white text-[10px] font-medium">
                {isDragActive ? 'Drop here' : 'Change'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-2',
                shapeClass,
              )}
            >
              <Loader2 className="w-7 h-7 text-white animate-spin" />
              <div className="w-14 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-white text-[10px] font-medium">{progress}%</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove button */}
        {displayImage && !isUploading && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleRemove}
            title="Remove image"
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* Hint text */}
      <div className="text-center">
        <p className="text-[11px] text-slate-400">
          {isDragActive ? (
            <span className="text-indigo-600 font-medium">Drop to upload</span>
          ) : (
            'Click or drag to upload'
          )}
        </p>
        <p className="text-[10px] text-slate-300 mt-0.5">JPG, PNG, WebP · Max 5 MB</p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 max-w-[200px]"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
