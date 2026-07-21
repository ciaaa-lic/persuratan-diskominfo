'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboardStats } from '@/features/dashboard/api';
import { useSuratList, PengajuanSurat } from '@/features/surat/api';
import { useActivityLogs } from '@/features/log/api';
import { SuratDetailModal } from '@/components/surat/SuratDetailModal';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [filterBidang, setFilterBidang] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedSuratDetail, setSelectedSuratDetail] = useState<PengajuanSurat | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const totalSisaKuota = stats?.stokSummary?.groups?.reduce((acc: number, curr: { total: number; used: number }) => acc + (curr.total - curr.used), 0) || 0;
  
  const { data: suratList, isLoading: loadingSurat } = useSuratList({
    status: filterStatus || undefined,
    search: searchQuery || undefined,
  });
  const { data: logs } = useActivityLogs(20);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const copyNomor = (nomor: string) => {
    navigator.clipboard.writeText(nomor);
    Swal.fire({
      title: 'Disalin!',
      text: `Nomor surat resmi berhasil disalin: ${nomor}`,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-light">
            Selamat datang di pusat kontrol, <span className="font-bold text-gray-800 dark:text-gray-100">{user?.name || 'Admin Utama'}</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
            Dashboard Utama Admin
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rekap"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-2v2m-3-3a3 3 0 10-6 0 3 3 0 006 0z" />
            </svg>
            Rekap & Laporan Surat
          </Link>
        </div>
      </div>

      {/* Blok Nomor Hari Ini (SOP Banner Box) */}
      <div className="bg-gradient-to-r from-red-900/10 via-red-950/5 to-gray-900/10 dark:from-red-950/40 dark:via-gray-900 dark:to-gray-900 rounded-2xl border border-red-200/60 dark:border-red-900/40 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-100 dark:border-red-900/30 pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-red-600/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                Blok Nomor Harian SOP Sekretariat
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Alur otomatis penomoran berurutan tanpa jeda dengan batas kapasitas harian 40 nomor per suffix (A–Z)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              SOP Aktif & Sinkron
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase block">Tanggal</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-1 block truncate">
              {todayStr}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase block">Hari Kerja Ke-</span>
            <span className="text-xs sm:text-sm font-extrabold text-red-600 dark:text-red-400 mt-1 block">
              {loadingStats ? '...' : `Ke-${stats?.workingDayIndex || '1'}`}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase block">Rentang Blok Dasar</span>
            <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
              {loadingStats ? '...' : stats?.numberRange || '1 - 40'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase block">Rotasi Suffix</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              Tanpa Suffix → A — Z (Max 40/Grup)
            </span>
          </div>
        </div>
      </div>

      {/* 6 Information Cards (Hari Ini & Bulan Ini) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Hari Ini: Pengajuan */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Pengajuan (Hari Ini)</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1.5">
            {loadingStats ? '-' : stats?.hariIni?.pengajuan || '0'}
          </p>
        </div>
        


        {/* Hari Ini: Selesai */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Selesai (Hari Ini)</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {loadingStats ? '-' : stats?.hariIni?.selesai || '0'}
          </p>
        </div>

        {/* Bulan Ini: Surat Masuk */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Surat Masuk (Bulan Ini)</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1.5">
            {loadingStats ? '-' : stats?.bulanIni?.masuk || '0'}
          </p>
        </div>

        {/* Bulan Ini: Surat Keluar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Surat Keluar (Bulan Ini)</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1.5">
            {loadingStats ? '-' : stats?.bulanIni?.keluar || '0'}
          </p>
        </div>

        {/* Bulan Ini: Terpakai */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Nomor Terpakai (Bulan Ini)</p>
          <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1.5">
            {loadingStats ? '-' : stats?.bulanIni?.terpakai || '0'}
          </p>
        </div>

        {/* Hari Ini: Sisa Kuota */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-yellow-500">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Sisa Kuota Nomor (Hari Ini)</p>
          <p className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400 mt-1.5">
            {loadingStats ? '-' : totalSisaKuota}
          </p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Data Pengajuan Penomoran Surat
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Seluruh riwayat pengajuan penomoran dari berbagai bidang
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Tabs */}
            <div className="flex rounded-xl bg-gray-200/70 dark:bg-gray-800 p-1 text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === ''
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('Dibatalkan')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  filterStatus === 'Dibatalkan'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
                }`}
              >
                Dibatalkan
              </button>
              <button
                onClick={() => setFilterStatus('Selesai')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  filterStatus === 'Selesai'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
                }`}
              >
                Selesai
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari perihal / pengirim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-44 sm:w-56"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Tanggal Pengajuan</th>
                <th className="py-3 px-4">Pemohon & Bidang</th>
                <th className="py-3 px-4 min-w-[200px]">Perihal Surat</th>
                <th className="py-3 px-4">Nomor Surat Resmi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {loadingSurat ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Memuat data pengajuan dari database...
                  </td>
                </tr>
              ) : suratList && suratList.length > 0 ? (
                suratList.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-gray-400 font-semibold">{index + 1}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.tanggalPengajuan
                        ? new Date(item.tanggalPengajuan).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 dark:text-white">{item.pengirim}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Bid. {item.bidang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                        {item.perihal}
                      </p>
                      {item.lampiran && (
                        <a
                          href={item.lampiran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline mt-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Lihat Lampiran
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.nomorSurat ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                            {item.nomorSurat}
                          </span>
                          <button
                            onClick={() => item.nomorSurat && copyNomor(item.nomorSurat)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Salin Nomor Resmi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic font-light">— Belum Dinomori —</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs ${
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Selesai' ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedSuratDetail(item);
                            setIsDetailOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-colors"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Tidak ada pengajuan surat yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Stok & Riwayat Aktivitas (Bottom 2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Box 1 Kiri: Monitoring Stok */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-red-600 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Monitoring Kuota Stok Harian</h3>
                  <p className="text-xs text-gray-400">Referensi ketersediaan kuota blok nomor</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                1–40 / Suffix
              </span>
            </div>

            <div className="space-y-4">
              {/* Group Utama */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Blok Utama Tanpa Suffix (1–40)
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    {stats?.stokSummary?.groups?.find(g => g.suffix === '')?.used || 0} / 40 Terpakai
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((stats?.stokSummary?.groups?.find(g => g.suffix === '')?.used || 0) / 40) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Group Suffix A */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Blok Cadangan Suffix &quot;A&quot; (1.A–40.A)
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    {stats?.stokSummary?.groups?.some(g => g.suffix === 'A') ? 'Aktif' : 'Tersedia'} (Max 40)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: stats?.stokSummary?.groups?.some(g => g.suffix === 'A') ? '50%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 font-light">
            💡 <strong className="font-medium text-gray-600 dark:text-gray-400">Otomatis SOP:</strong> Jika 40 nomor utama habis dalam satu hari, sistem otomatis membuka blok suffix A, B, dst.
          </p>
        </div>

        {/* Box 2 Kanan: Riwayat Aktivitas Log */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full max-h-[460px]">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Riwayat Aktivitas Sistem</h3>
              <p className="text-[11px] text-gray-400">Catatan audit trail waktu nyata</p>
            </div>
            <span className="text-xs text-gray-400 font-medium">{logs?.length || 0} catatan log</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {log.userName ? log.userName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {log.userName} <span className="text-[10px] font-normal text-gray-400">({log.role})</span>
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(log.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-semibold">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-gray-400 font-light">
                Belum ada catatan aktivitas di sistem
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <SuratDetailModal
        surat={selectedSuratDetail}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
