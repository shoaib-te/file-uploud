import React from 'react';
import Image from 'next/image';

interface StorageCardProps {
  iconSrc?: string;        // Path to folder image or SVG icon
  storageUsed?: string;    // e.g., "12 GB"
  title?: string;          // e.g., "Documents"
  updateTime?: string;     // e.g., "10:15am, 10 Oct"
}

export default function StorageCard({
  iconSrc = "/file.png",
  storageUsed = "12 GB",
  title = "Documents",
  updateTime = "10:15am, 10 Oct"
}: StorageCardProps) {
  return (
    <div className="relative h-[233px] w-[226px] bg-transparent font-sans">
      
      {/* 1. THE MAIN BACKGROUND CONTAINER WITH CUSTOM TOP CURVE OUTLINE */}
      <div className="absolute bottom-0 left-0 right-0 top-[40px] flex flex-col justify-between rounded-3xl bg-white p-5 pt-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] border border-gray-50">
        
        {/* Storage Volume Text */}
        <div className="flex justify-end pr-2">
          <span className="text-[20px] font-bold text-[#212529] tracking-tight">{storageUsed}</span>
        </div>

        {/* Card Title Label */}
        <div className="mt-2 text-center">
          <h3 className="text-[18px] font-bold text-[#212529]">{title}</h3>
          <div className="mx-auto mt-4 w-4/5 border-t border-gray-100" />
        </div>

        {/* Card Sub-Info Section */}
        <div className="text-center mb-1">
          <p className="text-[14px] font-medium text-[#A3AED0] tracking-wide">Last update</p>
          <p className="mt-1 text-[15px] font-bold text-[#212529]">{updateTime}</p>
        </div>
      </div>

      {/* 2. THE INVERSE NOTCH MASK BLOCK (Constructs smooth background cutout corner) */}
      <div className="absolute top-[20px] left-0 h-[65px] w-[95px] bg-[#FAFAFA] rounded-br-[40px] pointer-events-none">
        {/* Subtle bottom-left smoothing hook */}
        <div className="absolute -bottom-[20px] left-0 h-[20px] w-[20px] bg-white rounded-tl-[20px]" />
        {/* Subtle top-right smoothing hook */}
        <div className="absolute right-[0px] -top-[20px] h-[20px] w-[20px] bg-white rounded-tl-[20px]" />
      </div>

      {/* 3. ABSOLUTE TOP FLOATING LAYERS (Icon & Profile tag) */}
      <div className="absolute left-1 top-0 z-10">
        {/* Floating Core Red Folder Circle Badge */}
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF6B6B] shadow-[0_8px_20px_rgba(255,107,107,0.35)]">
          {/* Inner Folder Graphic Asset */}
          <div className="relative h-9 w-9">
            <Image 
              src={iconSrc} 
              alt="Folder Type" 
              fill
              sizes="36px"
              unoptimized
              className="object-contain brightness-0 invert" // Inverts standard colorful icons to white text layout style
            />
          </div>
        </div>

        {/* Small Avatar Indicator Overlay Node ("M") */}
        <div className="absolute -bottom-1 -right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#2B4C3F] border-2 border-white shadow-md">
          <span className="text-[10px] font-extrabold text-[#74E291]">M</span>
        </div>
      </div>

    </div>
  );
}
