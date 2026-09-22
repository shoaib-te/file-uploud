'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, CheckCircle2, Save } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface ProfileUser {
  _id: string
  fullName: string
  email: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile', { credentials: 'include' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load profile')
        setUser(result.user)
        setFullName(result.user.fullName)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be smaller than 5 MB.')
      return
    }

    setError('')
    setMessage('')
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = URL.createObjectURL(file)
    setPreviewUrl(previewUrlRef.current)
    setAvatarFile(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('fullName', fullName)
    if (avatarFile) formData.append('avatar', avatarFile)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save profile')

      setUser(result.user)
      setFullName(result.user.fullName)
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
      setPreviewUrl(null)
      setAvatarFile(null)
      setMessage('Profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-4xl text-sm text-gray-500">Loading profile...</main>
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B6B]">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Your profile</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your account details and profile image.</p>
      </header>

      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <motion.section whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="flex flex-col items-center rounded-3xl bg-[#FFF8F8] p-6 text-center">
          <motion.div layout className="relative h-32 w-32 overflow-hidden rounded-full bg-[#FF6B6B] text-4xl font-bold text-white">
            {previewUrl || user?.avatar ? (
              <Image src={previewUrl || user?.avatar || ''} alt="Profile avatar" fill unoptimized className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center">{initials(user?.fullName || fullName)}</span>
            )}
          </motion.div>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 rounded-full border border-[#FF6B6B] px-5 py-2.5 text-sm font-semibold text-[#FF6B6B] hover:bg-[#FFF0F0]"
          >
            <span className="flex items-center gap-2"><Camera className="h-4 w-4" aria-hidden="true" />Change image</span>
          </button>
          <p className="mt-3 text-xs text-gray-400">JPG, PNG, GIF up to 5 MB</p>
        </motion.section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-gray-700">
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="rounded-xl border border-gray-200 px-4 py-3 font-normal text-gray-900 outline-none focus:border-[#FF6B6B]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">
              Email address
              <input value={user?.email || ''} disabled className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal text-gray-500" />
            </label>
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold text-gray-700">Account created</p>
              <p className="mt-1 text-gray-500">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Last updated</p>
              <p className="mt-1 text-gray-500">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>

          <AnimatePresence>
          {error && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</motion.p>}
          {message && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{message}</motion.p>}
          </AnimatePresence>

          <button type="submit" disabled={saving} className="mt-6 flex items-center gap-2 rounded-full bg-[#FF6B6B] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-100 hover:bg-[#ff5252] disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </section>
      </motion.form>
    </main>
  )
}
