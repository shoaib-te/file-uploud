import Image from 'next/image'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen  items-center  bg-[#ffffff] ">
      {/* Main Container Card */}
      <section className="relative md:flex  hidden  h-screen w-1/3 flex-col justify-between overflow-hidden  bg-[#f86c6b] p-8 text-white shadow-2xl">

        {/* Top Section: Header & Branding */}
        <div className="flex flex-col gap-12">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              {/* Back overlapping circle */}
              <div className="absolute inset-0 translate-x-[-4px] translate-y-[-2px] rounded-full bg-white/40" />
              {/* Front solid circle */}
              <div className="absolute inset-0 translate-x-[4px] translate-y-[2px] rounded-full bg-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">StoreIt</span>
          </div>

          {/* Typography Content */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
              Manage your files <br />
              the best way
            </h1>
            <p className="text-sm font-medium leading-relaxed text-white/80">
              Awesome, we&apos;ve created the perfect place for you to store all your documents.
            </p>
          </div>
        </div>

        {/* Bottom Section: Decorative Illustrations */}
        <div className="relative flex h-52 w-full items-end justify-center sm:h-64 lg:h-80">
          <Image
            src="/files.svg"
            alt="File storage illustration"
            fill
            sizes="(max-width: 1024px) 33vw, 500px"
            loading="eager"
            unoptimized
            className="object-contain object-bottom"
          />

        </div>

      </section>
      <section className="flex min-h-screen w-full flex-1 flex-col items-center justify-center bg-[#ffffff] p-4 sm:p-8 md:h-screen md:w-2/3">
        <div className="flex  md:hidden flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3 p-4 select-none sm:p-8">
            {/* Dynamic Overlapping Logo Mark */}
            <div className="relative h-12 w-12 flex-shrink-0">

              {/* Back translucent circle */}
              <div className="absolute inset-y-0 left-0 h-10 w-10 rounded-full bg-[#f86c6b]/30" />

              {/* Front solid white circle */}
              <div className="absolute inset-y-0 left-3 h-10 w-10 rounded-full bg-[#f86c6b] shadow-sm" />

            </div>

            {/* Brand Text Styling */}
            <span className="text-3xl font-bold tracking-tight text-black font-serif">
              StoreIt
            </span>
          </div>
        </div>


        {children}

      </section>
    </div>
  )
}





export default layout