'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSuratList, PengajuanSurat } from '@/features/surat/api';
import { SuratDetailModal } from '@/components/surat/SuratDetailModal';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const [selectedSurat, setSelectedSurat] = useState<PengajuanSurat | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Menunggu' | 'Selesai'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter surat by current user's bidang
  const { data: suratList, isLoading } = useSuratList({
    bidang: user?.bidang || undefined,
  });

  const mySuratList: PengajuanSurat[] = useMemo(() => {
    return Array.isArray(suratList) ? suratList : (suratList && Array.isArray((suratList as any).data) ? (suratList as any).data : []);
  }, [suratList]);
  
  const waitingCount = useMemo(
    () => mySuratList.filter((s) => s.status === 'Menunggu').length,
    [mySuratList]
  );
  const doneCount = useMemo(
    () => mySuratList.filter((s) => s.status === 'Selesai').length,
    [mySuratList]
  );

  // Filtered list based on tab and search
  const filteredList = useMemo(() => {
    return mySuratList.filter((item) => {
      const matchesTab =
        activeTab === 'Semua' ? true : activeTab === 'Menunggu' ? item.status === 'Menunggu' : item.status === 'Selesai';
      
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.perihal.toLowerCase().includes(q) ||
        (item.nomorSurat && item.nomorSurat.toLowerCase().includes(q)) ||
        item.pengirim.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [mySuratList, activeTab, searchQuery]);

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
    <div className="space-y-8 pb-12 font-sans">
      {/* 1. TOP HEADER & GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-[11px] uppercase tracking-wider rounded-md border border-red-200 dark:border-red-800">
              Bidang {user?.bidang || 'Operasional'}
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700">
              User Akses
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 leading-tight">
            Dasbor Layanan & Penomoran Bidang
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light mt-0.5">
            Selamat datang, <strong className="font-semibold text-gray-800 dark:text-gray-200">{user?.name || 'User'}</strong>. Kelola pengajuan, riwayat arsip, dan pantau status surat keluar secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-800 shadow-sm">
            <svg className="w-4 h-4 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{todayStr}</span>
          </div>
          <Link
            href="/user/pengajuan"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajukan Surat Baru</span>
          </Link>
        </div>
      </div>

      {/* 2. SOP BANNER HARIAN BIDANG */}
      <div className="bg-gradient-to-r from-[#380404] via-[#5c0a0a] to-[#380404] rounded-2xl p-6 text-white shadow-xl border border-red-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-[11px] font-bold uppercase tracking-wider text-red-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SOP Penomoran Resmi Tersinkronisasi • Bidang {user?.bidang || 'DISKOMINFO'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Penerbitan Nomor Surat Resmi Otomatis & Terintegrasi Buku Agenda
          </h2>
          <p className="text-xs sm:text-sm text-red-100/80 font-light max-w-3xl leading-relaxed">
            Seluruh nomor surat keluar bidang Anda mengikuti format baku Surat Edaran Sekretaris Daerah Kota Makassar dan Klasifikasi Arsip Nasional (ANRI). Setiap pengajuan diverifikasi dan diterbitkan secara akurat dan terintegrasi pada jam kerja operasional.
          </p>
        </div>
        <div className="flex-shrink-0 relative z-10 flex flex-col sm:flex-row md:flex-col gap-2.5">
          <Link
            href="/user/pengajuan"
            className="px-4 py-2.5 rounded-xl bg-white text-red-950 hover:bg-red-50 font-extrabold text-xs shadow-md text-center transition-all"
          >
            + Buat Pengajuan Sekarang
          </Link>
          <Link
            href="/user/arsip"
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-950/90 text-red-200 font-bold text-xs border border-red-800/60 text-center transition-all"
          >
            Lihat Arsip Bidang &rarr;
          </Link>
        </div>
      </div>

      {/* 3. 3 MINI INFO CARDS SOP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-sm flex-shrink-0">
            HK
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hari & Jam Kerja</p>
            <p className="text-xs font-extrabold text-gray-800 dark:text-gray-100 mt-0.5">Senin–Jumat • 08.00–16.00</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm flex-shrink-0">
            SF
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suffix Bidang Resmi</p>
            <p className="text-xs font-extrabold text-gray-800 dark:text-gray-100 mt-0.5 font-mono">/{user?.bidang || 'DISKOMINFO'}/2026</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0">
            PL
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pola Penomoran</p>
            <p className="text-xs font-extrabold text-gray-800 dark:text-gray-100 mt-0.5 font-mono">000.x/XXX/DISKOMINFO</p>
          </div>
        </div>
      </div>

      {/* 4. 4 COLORED OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pengajuan Saya */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-5 text-white shadow-lg shadow-red-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-red-100 text-[11px] font-bold uppercase tracking-wider">Total Pengajuan Saya</p>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black">{mySuratList.length}</p>
            <p className="text-xs text-red-200 mt-1 font-light">Keseluruhan surat bidang</p>
          </div>
        </div>

        {/* Card 2: Menunggu Penomoran */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-yellow-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Menunggu Verifikasi</p>
            <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{waitingCount}</p>
            <p className="text-xs text-gray-400 mt-1">Diproses admin sekretariat</p>
          </div>
        </div>

        {/* Card 3: Selesai Dinomori */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-emerald-600 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Selesai Dinomori</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{doneCount}</p>
            <p className="text-xs text-gray-400 mt-1">Nomor resmi telah terbit</p>
          </div>
        </div>

        {/* Card 4: Arsip Tersedia */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-blue-600 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Arsip Tersedia</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{doneCount}</p>
            <p className="text-xs text-gray-400 mt-1">Siap diunduh & dicetak</p>
          </div>
        </div>
      </div>

      {/* 5. MONITORING BLOK NOMOR HARIAN BIDANG */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Monitoring Ketersediaan Blok Nomor Harian ({user?.bidang || 'Bidang'})</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-light">
              Alokasi kuota penomoran otomatis hari ini berdasarkan rotasi bidang dinas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Blok Nomor Tersedia: 100/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700 dark:text-gray-300">Blok Penomoran {user?.bidang || 'APTIKA'}</span>
              <span className="text-red-600 font-mono">{doneCount} terpakai</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, doneCount * 15))}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 font-light">Prioritas penomoran cepat sesuai jam operasional</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700 dark:text-gray-300">Sinkronisasi Klasifikasi ANRI</span>
              <span className="text-emerald-600 font-mono">100% Cocok</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full w-full transition-all duration-500" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 font-light">234 Kode resmi terhubung dengan database</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700 dark:text-gray-300">Integritas Buku Agenda</span>
              <span className="text-blue-600 font-mono">Real-time</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full w-full transition-all duration-500" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 font-light">Nomor langsung terdaftar di sistem pusat</p>
          </div>
        </div>
      </div>

      {/* 6. TABEL DATA PENGAJUAN DENGAN FILTER TABS & SEARCH */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Table Toolbar / Tabs */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Data Pengajuan & Riwayat Surat Resmi ({user?.bidang || 'Bidang'})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Klik tab di bawah untuk memvalidasi status surat yang sedang diverifikasi atau telah selesai
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-gray-200/60 dark:bg-gray-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('Semua')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Semua'
                  ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Semua ({mySuratList.length})
            </button>
            <button
              onClick={() => setActiveTab('Menunggu')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Menunggu'
                  ? 'bg-white dark:bg-gray-900 text-yellow-600 dark:text-yellow-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Menunggu ({waitingCount})
            </button>
            <button
              onClick={() => setActiveTab('Selesai')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Selesai'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Selesai ({doneCount})
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari perihal, nomor surat, atau pengirim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 italic">
            Menampilkan {filteredList.length} dari {mySuratList.length} surat
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Tanggal Pengajuan</th>
                <th className="py-3 px-4">Perihal Surat</th>
                <th className="py-3 px-4">Nomor Surat Resmi</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi & Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                    Memuat riwayat surat Anda dari server...
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-gray-400 font-bold">{index + 1}</td>
                    <td className="py-4 px-4 whitespace-nowrap font-medium">
                      {item.tanggalPengajuan
                        ? new Date(item.tanggalPengajuan).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-4 px-4 min-w-[240px]">
                      <p className="font-extrabold text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                        {item.perihal}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">Pengirim: <span className="font-semibold text-gray-600 dark:text-gray-300">{item.pengirim}</span></p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.nomorSurat ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800/60 shadow-2xs">
                            {item.nomorSurat}
                          </span>
                          <button
                            onClick={() => item.nomorSurat && copyNomor(item.nomorSurat)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                            title="Salin Nomor Resmi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900 text-[11px] font-semibold">
                          Menunggu Verifikasi Admin
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
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
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedSurat(item);
                          setIsDetailOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-300 text-gray-700 dark:text-gray-200 font-bold text-xs transition-all border border-transparent hover:border-red-200"
                      >
                        Lihat Detail & Timeline &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                    Tidak ada pengajuan surat yang sesuai dengan kriteria filter tab atau pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. LOG AKTIVITAS & RIWAYAT PENOMORAN TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Aktivitas Surat Keluar Terbaru</h3>
              <p className="text-[11px] text-gray-400">Jejak aktivitas pengajuan surat dari bidang Anda</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          </div>

          <div className="space-y-4">
            {mySuratList && mySuratList.slice(0, 3).map((s, idx) => (
              <div key={s.id || idx} className="flex items-start gap-3.5 text-xs">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-gray-200 leading-snug">{s.perihal}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {s.nomorSurat ? `Nomor: ${s.nomorSurat} • Selesai` : 'Status: Menunggu verifikasi admin'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                  {s.tanggalPengajuan ? new Date(s.tanggalPengajuan).toLocaleDateString('id-ID') : 'Hari Ini'}
                </span>
              </div>
            ))}
            {(!mySuratList || mySuratList.length === 0) && (
              <p className="text-xs text-gray-400 italic text-center py-4">Belum ada aktivitas surat tercatat.</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-[#280202] rounded-2xl p-6 text-white shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Bantuan & Layanan Cepat</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[10px] font-extrabold border border-red-500/30">
                Hubungi Sekretariat
              </span>
            </div>
            <h3 className="text-lg font-black mt-2">Perlu percepatan nomor atau pembaruan klasifikasi ANRI?</h3>
            <p className="text-xs text-gray-300 mt-1 font-light leading-relaxed">
              Tim admin persuratan DISKOMINFO siap membantu penerbitan nomor surat darurat, undangan mendesak pimpinan, atau koordinasi arsip statis.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-white">Sekretariat DISKOMINFO</p>
              <p className="text-[11px] text-gray-400">Ext: 104 • email: aptika@diskominfo.go.id</p>
            </div>
            <Link
              href="/user/arsip"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              Buka Katalog Arsip
            </Link>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <SuratDetailModal
        surat={selectedSurat}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
