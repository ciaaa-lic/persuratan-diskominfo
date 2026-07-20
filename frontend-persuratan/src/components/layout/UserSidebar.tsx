'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function UserSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    {
      name: 'Dasbor Bidang',
      href: '/user/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Pengajuan Surat Baru',
      href: '/user/pengajuan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: 'Riwayat & Arsip Saya',
      href: '/user/arsip',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-20 bg-[#380404] text-white flex flex-col justify-between items-center py-6 shadow-2xl flex-shrink-0 min-h-screen border-r border-red-950/40 z-40">
      {/* Top: Logo & Main Navigation */}
      <div className="flex flex-col items-center gap-6 w-full px-2">
        {/* Brand Icon */}
        <Link href="/user/dashboard" className="group" title={`Bidang ${user?.bidang || 'Operasional'}`}>
          <div className="w-11 h-11 bg-red-600 group-hover:bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40 transition-all">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-3.5 items-center w-full mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/user/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 font-bold scale-105'
                    : 'text-red-200/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Shield Icon / Version */}
      <div className="flex flex-col items-center w-full px-2">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-red-300/40" title="e-Surat DISKOMINFO v2.0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
