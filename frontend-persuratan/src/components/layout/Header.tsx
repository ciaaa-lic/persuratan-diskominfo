'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { KalenderBulananModal } from './KalenderBulananModal';
import { ProfileModal } from './ProfileModal';
import { NotificationDropdown } from './NotificationDropdown';
import { useGetNotifications } from '@/features/surat/api';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data: notifications } = useGetNotifications();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  // Tentukan Judul & Subjudul berdasarkan Path
  const getPageInfo = () => {
    if (pathname.includes('/admin/dashboard')) {
      return { title: 'Dashboard', subtitle: 'Sistem e-Surat DISKOMINFO' };
    }
    if (pathname.includes('/admin/arsip')) {
      return { title: 'Arsip per Bidang', subtitle: 'Sistem e-Surat DISKOMINFO' };
    }
    if (pathname.includes('/admin/rekap')) {
      return { title: 'Rekap & Laporan', subtitle: 'Sistem e-Surat DISKOMINFO' };
    }
    if (pathname.includes('/user/dashboard')) {
      return { title: 'Dashboard Bidang', subtitle: `Sistem e-Surat DISKOMINFO • ${user?.bidang || 'Operasional'}` };
    }
    if (pathname.includes('/user/arsip')) {
      return { title: 'Arsip & Riwayat Saya', subtitle: `Sistem e-Surat DISKOMINFO • ${user?.bidang || 'Operasional'}` };
    }
    if (pathname.includes('/user/pengajuan')) {
      return { title: 'Pengajuan Surat Baru', subtitle: `Sistem e-Surat DISKOMINFO • ${user?.bidang || 'Operasional'}` };
    }
    return { title: 'Sistem e-Surat', subtitle: 'Dinas Komunikasi dan Informatika' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <>
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors">
        {/* LEFT: Dynamic Page Title */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none truncate">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-light mt-1 truncate">
            {subtitle}
          </p>
        </div>

        {/* RIGHT: Action Buttons Group & Avatar Pill */}
        <div className="flex items-center gap-2 sm:gap-4 relative">

          {/* Action Buttons Group (Sejajar dan Rapi) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-gray-50/80 dark:bg-gray-800/60 p-1 rounded-full border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
            {/* 1. Tombol Kalender / Tanggal */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              title="Buka Kalender Kerja & SOP"
              className="p-2 sm:p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm transition-all"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* 2. Tombol Notifikasi (Bell Icon) */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Lihat Daftar Notifikasi"
                className="relative p-2 sm:p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Red Notification Indicator Badge */}
                {notifications && notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-[16px] h-4 px-1 bg-red-600 border-2 border-white dark:border-gray-900 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>

            {/* 3. Tombol Ganti Tema (Dark / Light) */}
            <button
              onClick={toggleDarkMode}
              title="Ganti Mode Tampilan (Gelap/Terang)"
              className="p-2 sm:p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-yellow-500 transition-all hover:shadow-sm"
            >
              {isDarkMode ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* 4. Tombol Logout */}
            <button
              onClick={logout}
              title="Keluar dari Sistem"
              className="p-2 sm:p-2.5 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all hover:shadow-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Notification Popover */}
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

          {/* User Avatar Pill */}
          <button
            onClick={() => setIsProfileOpen(true)}
            title="Kelola Profil & Ubah Password"
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-800 hover:opacity-85 transition-opacity text-left group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-light mt-0.5">
                {user?.role === 'ADMIN' ? 'Admin' : `Bid. ${user?.bidang || 'User'}`}
              </p>
            </div>
          </button>
        </div>
      </header>

      <KalenderBulananModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
