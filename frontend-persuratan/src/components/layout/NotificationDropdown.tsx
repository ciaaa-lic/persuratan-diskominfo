'use client';

import React, { useEffect } from 'react';
import { useGetNotifications, NotificationItem, markNotificationsAsRead } from '@/features/surat/api';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { data: notifications, isLoading } = useGetNotifications();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && notifications) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        markNotificationsAsRead(unreadIds);
        // Refresh notifications to reflect read status
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }, 100);
      }
    }
  }, [isOpen, notifications, queryClient]);

  if (!isOpen) return null;

  const handleItemClick = (link: string) => {
    onClose();
    router.push(link);
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Backdrop for closing when clicking outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Box */}
      <div className="absolute right-0 top-14 sm:top-16 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                Notifikasi Sistem
              </h3>
              <p className="text-[11px] text-gray-400 font-light">
                Riwayat aktivitas & penomoran surat
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[11px] font-bold">
            {notifications?.filter(n => !n.read).length || 0} Baru
          </span>
        </div>

        {/* Content List */}
        <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              Memuat daftar notifikasi...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Belum ada notifikasi baru untuk Anda
            </div>
          ) : (
            notifications.map((item: NotificationItem) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.link)}
                className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors flex items-start gap-3 group"
              >
                {/* Icon based on notification type */}
                {item.type === 'nomor' ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-gray-400 font-light flex-shrink-0">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-normal line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Tutup Notifikasi
          </button>
        </div>
      </div>
    </>
  );
}
