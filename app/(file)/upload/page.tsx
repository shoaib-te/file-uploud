'use client'

import { ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, FileUp, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadedFile {
  name: string
  url: string
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPreviewable(file: File) {
  return file.type.startsWith('image/') || file.type.startsWith('video/')
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [message, setMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile) return

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const nextPreviewUrl = isPreviewable(nextFile) ? URL.createObjectURL(nextFile) : null
    previewUrlRef.current = nextPreviewUrl
    setPreviewUrl(nextPreviewUrl)
    setUploadedFile(null)
    setMessage('')
    setProgress(0)

    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setPreviewUrl(null)
      previewUrlRef.current = null
      setStatus('error')
      setMessage('This file is larger than the 10 MB limit.')
      return
    }

    setFile(nextFile)
    setStatus('idle')
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0])
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  const handleDropZoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fileInputRef.current?.click()
    }
  }

  const handleUpload = () => {
    if (!file || status === 'uploading') return

    setStatus('uploading')
    setProgress(0)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    const request = new XMLHttpRequest()
    request.open('POST', '/api/files')
    request.withCredentials = true

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    request.addEventListener('load', () => {
      let result: { success?: boolean; data?: UploadedFile; error?: string } = {}

      try {
        result = JSON.parse(request.responseText)
      } catch {
        result.error = 'The server returned an invalid response.'
      }

      if (request.status >= 200 && request.status < 300 && result.success && result.data) {
        setProgress(100)
        setStatus('success')
        setUploadedFile({ name: result.data.name, url: result.data.url })
        setMessage(`${result.data.name} has been uploaded successfully.`)
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
        setPreviewUrl(null)
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      setStatus('error')
      setMessage(result.error || 'Something went wrong during upload.')
    })

    request.addEventListener('error', () => {
      setStatus('error')
      setMessage('Failed to connect to the server.')
    })

    request.send(formData)
  }

  const clearFile = () => {
    if (status === 'uploading') return
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setFile(null)
    setPreviewUrl(null)
    setProgress(0)
    setMessage('')
    setStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B6B]">Cloud storage</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Upload files</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-500">Upload documents, images, or videos securely to your dashboard.</p>
      </header>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileChange}
        />

        <div
          role="button"
          tabIndex={0}
          aria-label="Choose a file to upload"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleDropZoneKeyDown}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging ? 'border-[#FF6B6B] bg-[#FFF0F0]' : 'border-gray-200 bg-gray-50 hover:border-[#FF9B9B] hover:bg-[#FFF8F8]'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#FF6B6B]">
            <FileUp className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold text-gray-800">Drag and drop a file here, or <span className="text-[#FF6B6B] underline">browse</span></p>
          <p className="mt-2 text-xs text-gray-400">Images, videos, PDF, and Word files up to 10 MB</p>
        </div>

        <AnimatePresence mode="wait">
        {file && status !== 'success' && (
          <motion.div initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-5 flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#FFD6D6] bg-[#FFF8F8] p-4 sm:flex-row sm:items-center">
            {previewUrl ? (
              file.type.startsWith('image/') ? (
                <Image src={previewUrl} alt="Selected file preview" width={64} height={64} unoptimized className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <video src={previewUrl} muted className="h-16 w-16 rounded-xl object-cover" />
              )
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#FFE4E4] text-xs font-bold uppercase text-[#E25555]">
                {file.name.split('.').pop() || 'file'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">{file.name}</p>
              <p className="mt-1 text-xs text-gray-500">{formatFileSize(file.size)}</p>
              {status === 'uploading' && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#FFE1E1]">
                    <motion.div className="h-full rounded-full bg-[#FF6B6B]" animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut', duration: 0.2 }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-[#E25555]">{progress}%</span>
                </div>
              )}
            </div>
            {status !== 'uploading' && (
              <button type="button" onClick={clearFile} className="self-end p-2 text-gray-400 hover:text-gray-700 sm:self-center" aria-label="Remove selected file">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="mt-6 w-full rounded-2xl bg-[#FF6B6B] py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-100 transition-colors hover:bg-[#ff5252] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {status === 'uploading' ? `Uploading ${progress}%` : 'Upload file'}
        </button>

        <AnimatePresence>
        {message && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-4 flex items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm font-medium ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
            {status === 'success' && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            {message}
          </motion.p>
        )}
        </AnimatePresence>
      </motion.section>

      {uploadedFile && (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-emerald-600">Upload complete</p>
          <a href={uploadedFile.url} target="_blank" rel="noreferrer" className="mt-2 inline-block truncate text-sm font-semibold text-gray-800 hover:text-[#FF6B6B]">
            {uploadedFile.name}
          </a>
        </section>
      )}
    </main>
  )
}
