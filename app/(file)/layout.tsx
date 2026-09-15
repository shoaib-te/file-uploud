import Navbar from '@/components/Navbar'
import NavItem from '@/components/NavItem'
import Image from 'next/image'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Fixed: h-screen and overflow-hidden prevent unwanted dual page scrollbars
    <div className="flex h-screen w-full overflow-hidden bg-[#ffffff]">
      
      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className="flex h-screen w-72 flex-col justify-between   bg-white p-6 shrink-0">
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
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
              }
            />
            <NavItem
              label="Documents"
              href="/Documents"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              }
            />
            <NavItem
              label="Images"
              href="/Images"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a1 1 0 011.414 0L16 17m0 0l2.586-2.586a1 1 0 011.414 0L22 17V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12zm6-9a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <NavItem
              label="Media"
              href="/Media"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />
            <NavItem
              label="Others"
              href="/Others"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 012-2h6a2 2 0 012 2v1zM11 13a2 2 0 114 0v1a2 2 0 01-2 2H3a2 2 0 01-2-2v-1a2 2 0 012-2h6a2 2 0 012 2v1z" />
                </svg>
              }
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
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

    </div>
  )
}
