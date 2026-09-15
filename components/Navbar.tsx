"use client"

import React, { FormEvent, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { uploadFile } from '@/features/fileSlice'
import { logoutUser } from '@/features/userSlice'
import type { AppDispatch, RootState } from '@/lib/store'

function Navbar() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.file)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    await dispatch(uploadFile(file))

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = search.trim()
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <header className="flex w-full  items-center justify-between bg-white px-8 py-4">
    
      {/* Middle Section: Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-xl px-4">
        <span className="absolute inset-y-0 left-8 flex items-center text-gray-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text" 
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={pathname === '/search' ? 'Search your files' : 'Search files'}
          className="w-full rounded-full bg-[#FAFAFA] py-3 pl-12 pr-6 text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-700 focus:bg-gray-100"
        />
      </form>

      {/* Right Section: Action Buttons */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleUpload}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-[#FF6B6B] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-100 hover:bg-[#ff5252] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {error && <span className="max-w-40 text-xs text-red-500">{error}</span>}

        {/* Logout / Exit Icon Button */}
        <button
          type="button"
          onClick={async () => {
            await dispatch(logoutUser())
            router.push('/sign-in')
          }}
          className="rounded-xl p-2 text-[#FF6B6B] hover:bg-red-50 transition-colors"
          aria-label="Sign out"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Navbar
