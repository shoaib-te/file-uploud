"use client"

import React, { FormEvent, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { logoutUser } from '@/features/userSlice'
import type { AppDispatch } from '@/lib/store'
import { LogOut, Search, Upload } from 'lucide-react'

function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const dispatch = useDispatch<AppDispatch>()

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
          <Search className="h-5 w-5" aria-hidden="true" />
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
        {/* Upload Button */}
        <button
          type="button"
          onClick={() => router.push('/upload')}
          className="flex items-center gap-2 rounded-full bg-[#FF6B6B] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-100 hover:bg-[#ff5252] transition-colors"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload
        </button>

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
          <LogOut className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
