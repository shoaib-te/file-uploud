import Navbar from '@/components/Navbar'
import NavItem from '@/components/NavItem'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { File, Film, FolderOpen, Images, LayoutDashboard, Upload, UserRound } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Fixed: h-screen and overflow-hidden prevent unwanted dual page scrollbars
    <div className="flex h-screen w-full overflow-hidden bg-[#ffffff]">
      
      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className="hidden h-screen w-72 shrink-0 flex-col justify-between bg-white p-6 md:flex">
        {/* Top Section: Logo & Navigation */}
        <div className="flex flex-col gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="relative h-7 w-7">
              <div className="absolute inset-0 rounded-full bg-[#FF6B6B]/20" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#FF6B6B]" />
            </div>
            <span className="text-xl font-bold text-[#212529]">Storage</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <NavItem
              label="Dashboard"
              href="/"
                icon={<LayoutDashboard className="h-5 w-5" aria-hidden="true" />}
            />
            <NavItem
              label="Documents"
              href="/Documents"
                icon={<File className="h-5 w-5" aria-hidden="true" />}
            />
            <NavItem
              label="Images"
              href="/Images"
                icon={<Images className="h-5 w-5" aria-hidden="true" />}
            />
            <NavItem
              label="Media"
              href="/Media"
                icon={<Film className="h-5 w-5" aria-hidden="true" />}
            />
            <NavItem
              label="Others"
              href="/Others"
                icon={<FolderOpen className="h-5 w-5" aria-hidden="true" />}
            />
            <NavItem
              label="Upload"
              href="/upload"
                icon={<Upload className="h-5 w-5" aria-hidden="true" />}
            />
            <NavItem
              label="Profile"
              href="/profile"
                icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
            />
          </nav>
        </div>

        {/* Bottom Section: Footer Illustration Card */}
        <div className="relative mt-auto overflow-hidden rounded-2xl bg-[#FFF5F5] p-5 text-center flex flex-col items-center justify-center">
          <Image 
            src="/files.svg" 
            alt="file Picture" 
            width={190} // Fixed: Scaled down image dimensions to sit nicely in sidebar
            height={190} 
            loading="eager"
            className="object-contain"
          />
          <p className="mt-3 text-xs font-semibold text-[#FF6B6B]">Upgrade Storage</p>
        </div>
      </aside>

      {/* 2. RIGHT WORKSPACE CONTAINER (Holds Navbar on top of Content Area) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Sticky Header Top */}
        <Navbar />

        {/* Dynamic Scrollable Page Content Frame */}
        <PageTransition>{children}</PageTransition>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-gray-100 bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgba(33,37,41,0.08)] backdrop-blur md:hidden" aria-label="Mobile navigation">
        {[
          { href: '/', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" aria-hidden="true" /> },
          { href: '/Documents', label: 'Docs', icon: <File className="h-5 w-5" aria-hidden="true" /> },
          { href: '/Images', label: 'Images', icon: <Images className="h-5 w-5" aria-hidden="true" /> },
          { href: '/upload', label: 'Upload', icon: <Upload className="h-5 w-5" aria-hidden="true" /> },
          { href: '/profile', label: 'Profile', icon: <UserRound className="h-5 w-5" aria-hidden="true" /> },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-[#FFF5F5] hover:text-[#FF6B6B]">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

    </div>
  )
}
