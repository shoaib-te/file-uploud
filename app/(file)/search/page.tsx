"use client"

import FileOptions from '@/components/FileOptions'
import { fetchFiles } from '@/features/fileSlice'
import type { AppDispatch, RootState } from '@/lib/store'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function formatSize(bytes: number) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export default function SearchPage() {
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim().toLowerCase() || ''
  const { files, loading, error } = useSelector((state: RootState) => state.file)

  useEffect(() => {
    if (!files.length) dispatch(fetchFiles())
  }, [dispatch, files.length])

  const results = files.filter((file) => {
    if (!query) return true
    return [file.name, file.extension, file.type].some((value) => value.toLowerCase().includes(query))
  })

  return (
    <section className="min-h-full w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Search className="h-6 w-6 text-[#FF6B6B]" />
        <div>
          <h1 className="text-2xl font-extrabold text-[#212529] sm:text-3xl">Search files</h1>
          <p className="mt-2 text-sm text-gray-500">
            {query ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"` : `${files.length} files`}
          </p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading files...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="text-sm text-gray-500">No files match your search.</p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map((file) => (
          <article key={file._id} className="flex h-[175px] flex-col justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F0] text-2xl">{file.type === 'image' ? 'IMG' : file.type === 'document' ? 'DOC' : file.type === 'video' || file.type === 'audio' ? 'MED' : 'FILE'}</div>
              <div className="text-right">
                <FileOptions file={{ id: file._id, name: file.name, size: file.size, type: file.type, extension: file.extension, url: file.url, date: file.createdAt ? new Date(file.createdAt).toLocaleString() : undefined }} />
                <span className="mt-2 block text-[13px] font-bold text-gray-800">{formatSize(file.size)}</span>
              </div>
            </div>
            <div>
              <h2 className="mb-1 line-clamp-1 text-sm font-bold text-[#212529]" title={file.name}>{file.name}</h2>
              <p className="text-[11px] font-semibold text-[#A3AED0]">{file.type}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}