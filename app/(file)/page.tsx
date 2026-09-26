"use client";

import StorageCard from '@/components/StorageCard';
import FileOptions from '@/components/FileOptions';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchFiles } from '@/features/fileSlice';
import type { AppDispatch, RootState } from '@/lib/store';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { files: items, dashboard } = useSelector((state: RootState) => state.file);

  useEffect(() => {
    dispatch(fetchFiles());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const category = (name: 'image' | 'other' | 'media' | 'document') =>
    dashboard?.categories.find((item) => item.name === name);

  const updatedAt = dashboard?.lastUpdated
    ? new Date(dashboard.lastUpdated).toLocaleString()
    : 'Waiting for data';

  const recentFiles = items.map((file) => ({
    id: file._id,
    name: file.name,
    size: file.size,
    extension: file.extension,
    url: file.url,
    type: file.type,
    time: file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Recently uploaded',
    color: file.type === 'image'
      ? 'bg-blue-100 text-blue-500'
      : file.type === 'video'
        ? 'bg-emerald-100 text-emerald-500'
        : file.type === 'audio'
          ? 'bg-violet-100 text-violet-500'
          : file.type === 'document'
            ? 'bg-red-100 text-red-500'
            : 'bg-purple-100 text-purple-500',
  }));

  return (
    <main className="grid min-h-full w-full grid-cols-1 gap-5 rounded-2xl bg-gray-50 p-3 sm:p-5 lg:grid-cols-12">
      
      {/* LEFT COLUMN: Storage Overview & Category Grid */}
      <section className="flex flex-col gap-6 lg:col-span-7">
        
        {/* Available Storage Main Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-between rounded-3xl bg-[#FF6B6B] p-5 text-white shadow-xl shadow-red-100 sm:p-8"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Available Storage</h2>
            <p className="text-sm font-medium opacity-90">
              {dashboard?.storageUsed || '0 KB'} / {dashboard?.storageLimit || '128 GB'}
            </p>
          </div>
          
          {/* Progress Circular Dial Ring */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-28 sm:w-28">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-white/20" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-white" strokeWidth="3.5" strokeDasharray={`${dashboard?.usedPercentage || 0}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center">
              <p className="text-lg font-extrabold">{dashboard?.usedPercentage || 0}%</p>
              <p className="text-[10px] font-medium opacity-80">Space used</p>
            </div>
          </div>
        </motion.div>

        {/* Category Cards Workspace Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        >
          
        <StorageCard title="Documents" storageUsed={category('document')?.size || '0 KB'} updateTime={updatedAt} />
        <StorageCard title="Images" storageUsed={category('image')?.size || '0 KB'} updateTime={updatedAt} iconSrc="/jpeg.png" />
        <StorageCard title="Media" storageUsed={category('media')?.size || '0 KB'} updateTime={updatedAt} iconSrc="/mp4.png" />
        <StorageCard title="Others" storageUsed={category('other')?.size || '0 KB'} updateTime={updatedAt} />

        </motion.div>
      </section>

      {/* RIGHT COLUMN: Recent Files Uploaded Panel */}
      <motion.section
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className="rounded-3xl bg-white p-6 shadow-sm border border-gray-50 lg:col-span-5 flex flex-col gap-6"
      >
        <h2 className="text-lg font-bold text-gray-800">Recent files uploaded</h2>
        
        {/* Dynamic File List mapping */}
        <motion.div className="flex flex-col gap-4 overflow-y-auto max-h-[660px] pr-1" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          {!recentFiles.length && <p className="text-sm text-gray-500">No files uploaded yet.</p>}
          {recentFiles.map((file, idx) => (
            <motion.div key={`${file.name}-${idx}`} variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-2xl transition-colors">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full overflow-hidden ${file.color}`}>
                  {file.type === 'document' && (
                    <Image src="/file.png" alt="Document icon" width={24} height={24} unoptimized className="object-contain w-auto" />
                  )}
                  {file.type === 'image' && (
                    <Image src="/jpeg.png" alt="Image icon" width={24} height={24} unoptimized className="object-contain w-auto" />
                  )}
                  {file.type === 'video' && (
                    <Image src="/mp4.png" alt="Video icon" width={24} height={24} unoptimized className="object-contain w-auto" />
                  )}
                  {(file.type === 'other' || file.type === 'audio') && (
                    <Image src="/file.png" alt="File icon" width={24} height={24} unoptimized className="object-contain w-auto" />
                  )}
                </div>

                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold text-gray-800 line-clamp-1">{file.name}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{file.time}</span>
                </div>
              </div>

              <FileOptions file={file} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

    </main>
  )
}
