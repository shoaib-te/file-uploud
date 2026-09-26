"use client"

import Image from 'next/image'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import FileOptions from '@/components/FileOptions'
import { fetchFiles, type FileItem, type FileType } from '@/features/fileSlice'
import type { AppDispatch, RootState } from '@/lib/store'

type PageCategory = 'document' | 'image' | 'media' | 'other'

interface FileGridProps {
  category: PageCategory
  title: string
}

function matchesCategory(file: FileItem, category: PageCategory) {
  if (category === 'media') return file.type === 'video' || file.type === 'audio'
  if (category === 'other') return file.type === 'other'
  return file.type === category
}

function iconForType(type: FileType) {
  if (type === 'image') return '/jpeg.png'
  if (type === 'video' || type === 'audio') return '/mp4.png'
  return '/file.png'
}

function formatSize(bytes: number) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export default function FileGrid({ category, title }: FileGridProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { files, loading, error } = useSelector((state: RootState) => state.file)
  const categoryFiles = files.filter((file) => matchesCategory(file, category))

  useEffect(() => {
    if (!files.length) dispatch(fetchFiles())
  }, [dispatch, files.length])

  return (
    <section className="min-h-full w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#212529] sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm font-semibold text-gray-500">{categoryFiles.length} files</p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading files...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && categoryFiles.length === 0 && (
        <p className="text-sm text-gray-500">No {title.toLowerCase()} uploaded yet.</p>
      )}

      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {categoryFiles.map((file) => (
          <motion.article
            key={file._id}
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group flex h-[175px] min-w-0 flex-col justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F0]">
                <Image src={iconForType(file.type)} alt={`${file.type} icon`} width={32} height={32} unoptimized className="h-8 w-auto object-contain" />
              </div>
              <div className="text-right">
                <FileOptions file={{ id: file._id, name: file.name, size: file.size, type: file.type, extension: file.extension, url: file.url, date: file.createdAt ? new Date(file.createdAt).toLocaleString() : undefined }} />
                <span className="mt-2 block text-[13px] font-bold text-gray-800">{formatSize(file.size)}</span>
              </div>
            </div>
            <div>
              <h2 className="mb-1 line-clamp-1 text-sm font-bold text-[#212529]" title={file.name}>{file.name}</h2>
              <p className="text-[11px] font-semibold text-[#A3AED0]">{file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Recently uploaded'}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
