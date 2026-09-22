"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export default function NavItem({ icon, label, href }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/' && pathname === '/');

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
    >
    <Link
      href={href}
      className={`flex w-full items-center gap-4 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200
        ${isActive
          ? 'bg-[#FF6B6B] text-white shadow-lg shadow-red-200'
          : 'text-[#6C757D] hover:bg-gray-50'
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
    </motion.div>
  );
}