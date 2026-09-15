"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDispatch } from "react-redux"
import { deleteFile, shareFile, updateFileName } from "@/features/fileSlice"
import type { AppDispatch } from "@/lib/store"

export interface FileOptionItem {
  id?: string
  name: string
  size?: number | string
  date?: string
  type?: string
  extension?: string
  url?: string
}

interface FileOptionsProps {
  file: FileOptionItem
}

type ModalType = "rename" | "details" | "share" | "trash" | null

function formatSize(size: number | string | undefined) {
  if (typeof size === "string") return size
  if (!size) return "Unknown size"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export default function FileOptions({ file }: FileOptionsProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [modal, setModal] = useState<ModalType>(null)
  const [name, setName] = useState(file.name.replace(/\.[^/.]+$/, ""))
  const [shareEmail, setShareEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const closeModal = () => {
    if (!loading) setModal(null)
  }

  const handleRename = async () => {
    const nextName = name.trim()
    if (!nextName) return

    if (!file.id) {
      toast.success("Name updated", { description: `This demo file is now called ${nextName}.` })
      setModal(null)
      return
    }

    try {
      setLoading(true)
      const extension = file.extension || file.name.split(".").pop() || ""
      const fullName = extension && !nextName.endsWith(`.${extension}`)
        ? `${nextName}.${extension}`
        : nextName
      await dispatch(updateFileName({ id: file.id, name: fullName })).unwrap()
      toast.success("File renamed")
      setModal(null)
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Unable to rename file")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const email = shareEmail.trim()
    if (!email) return

    if (!file.id) {
      toast.success("Share link ready", { description: `Sharing ${file.name} with ${email}.` })
      setShareEmail("")
      setModal(null)
      return
    }

    try {
      setLoading(true)
      await dispatch(shareFile({ id: file.id, userEmailToShare: email })).unwrap()
      toast.success("File shared")
      setShareEmail("")
      setModal(null)
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Unable to share file")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!file.id) {
      toast.success("File moved to trash")
      setModal(null)
      return
    }

    try {
      setLoading(true)
      await dispatch(deleteFile(file.id)).unwrap()
      toast.success("File moved to trash")
      setModal(null)
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Unable to move file to trash")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (file.id) {
      window.open(`/api/files/${file.id}`, "_blank", "noopener,noreferrer")
      return
    }
    if (file.url) {
      window.open(file.url, "_blank", "noopener,noreferrer")
      return
    }
    toast.info("Download is available for uploaded files")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label={`Options for ${file.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-2xl bg-white p-2 shadow-xl">
          <DropdownMenuItem onClick={() => setModal("rename")} className="gap-3 rounded-xl px-3 py-2.5">
            <Pencil className="h-4 w-4 text-emerald-400" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("details")} className="gap-3 rounded-xl px-3 py-2.5">
            <Eye className="h-4 w-4 text-fuchsia-300" /> Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("share")} className="gap-3 rounded-xl px-3 py-2.5">
            <Share2 className="h-4 w-4 text-orange-300" /> Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} className="gap-3 rounded-xl px-3 py-2.5">
            <Download className="h-4 w-4 text-sky-400" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("trash")} variant="destructive" className="gap-3 rounded-xl px-3 py-2.5">
            <Trash2 className="h-4 w-4" /> Move to Trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={closeModal}>
          <section className="relative w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={closeModal} className="absolute right-5 top-5 rounded-full text-slate-300 hover:text-slate-600" aria-label="Close dialog">
              <X className="h-5 w-5" />
            </button>

            {modal === "rename" && (
              <>
                <h2 className="text-center text-lg font-bold text-slate-700">Rename</h2>
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-6 h-12 w-full rounded-full bg-slate-50 px-5 text-sm outline-none ring-1 ring-transparent focus:ring-[#ff6b6b]" autoFocus />
                <button type="button" onClick={handleRename} disabled={loading || !name.trim()} className="mt-5 h-12 w-full rounded-full bg-[#ff6b6b] text-sm font-semibold text-white transition hover:bg-[#f2555c] disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
              </>
            )}

            {modal === "details" && (
              <>
                <h2 className="text-center text-lg font-bold text-slate-700">Details</h2>
                <div className="mt-6 space-y-4 rounded-2xl border border-slate-100 p-5 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Name</span><span className="text-right font-medium text-slate-700">{file.name}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Format</span><span className="font-medium text-slate-700">{file.extension || file.type || "Unknown"}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Size</span><span className="font-medium text-slate-700">{formatSize(file.size)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Last edit</span><span className="text-right font-medium text-slate-700">{file.date || "Unknown"}</span></div>
                </div>
              </>
            )}

            {modal === "share" && (
              <>
                <h2 className="text-center text-lg font-bold text-slate-700">Share File</h2>
                <p className="mt-2 text-center text-sm text-slate-500">Share <span className="font-semibold text-slate-700">{file.name}</span> with another user.</p>
                <input type="email" value={shareEmail} onChange={(event) => setShareEmail(event.target.value)} placeholder="Enter email address" className="mt-6 h-12 w-full rounded-full border border-slate-200 px-5 text-sm outline-none focus:border-[#ff6b6b]" autoFocus />
                <button type="button" onClick={handleShare} disabled={loading || !shareEmail.trim()} className="mt-5 h-12 w-full rounded-full bg-[#ff6b6b] text-sm font-semibold text-white transition hover:bg-[#f2555c] disabled:opacity-50">{loading ? "Sharing..." : "Share Now"}</button>
              </>
            )}

            {modal === "trash" && (
              <>
                <h2 className="text-center text-lg font-bold text-slate-700">Move to Trash</h2>
                <p className="mt-6 text-center text-sm leading-6 text-slate-500">Are you sure you want to move <span className="font-semibold text-slate-700">{file.name}</span> to Trash?</p>
                <div className="mt-6 flex gap-3"><button type="button" onClick={closeModal} className="h-12 flex-1 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" onClick={handleDelete} disabled={loading} className="h-12 flex-1 rounded-full bg-[#ff6b6b] text-sm font-semibold text-white hover:bg-[#f2555c] disabled:opacity-50">{loading ? "Moving..." : "Move"}</button></div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}
