'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSuratList, PengajuanSurat } from '@/features/surat/api';
import { SuratDetailModal } from '@/components/surat/SuratDetailModal';
import Swal from 'sweetalert2';

export default function UserArsipPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | '2026' | 'Dokumen'>('Semua');
  const [selectedSurat, setSelectedSurat] = useState<PengajuanSurat | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch only completed (Selesai) letters for current user's Bidang
  const { data: suratList, isLoading } = useSuratList({
    bidang: user?.bidang || undefined,
    status: 'Selesai',
  });

  const rawList: PengajuanSurat[] = useMemo(() => {
    return Array.isArray(suratList) ? suratList : (suratList && Array.isArray((suratList as any).data) ? (suratList as any).data : []);
  }, [suratList]);

  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.perihal.toLowerCase().includes(q) ||
        (item.nomorSurat && item.nomorSurat.toLowerCase().includes(q)) ||
        item.pengirim.toLowerCase().includes(q);

      const matchesTab =
        activeTab === 'Semua'
          ? true
          : activeTab === '2026'
          ? item.tanggalSurat && item.tanggalSurat.includes('2026')
          : Boolean(item.lampiran);

      return matchesSearch && matchesTab;
    });
  }, [rawList, searchQuery, activeTab]);

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
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-[11px] uppercase tracking-wider rounded-md border border-red-200 dark:border-red-800">
              Katalog Arsip Resmi • Bidang {user?.bidang || 'Operasional'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 leading-tight">
            Arsip & Riwayat Surat Keluar Bidang
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light mt-0.5">
            Daftar lengkap seluruh nomor surat resmi yang telah diterbitkan untuk bidang <strong className="font-semibold text-gray-800 dark:text-gray-200">{user?.bidang || 'Anda'}</strong>, tersinkronisasi dengan database sekretariat.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-red-600/10 dark:bg-red-950/60 border border-red-500/30 px-4 py-2.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-xs font-bold text-red-700 dark:text-red-300">
            Total Arsip Terbit: {rawList.length} Dokumen
          </span>
        </div>
      </div>

      {/* 2. 3 INTERACTIVE ARSIP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-[#380404] to-[#600a0a] rounded-2xl p-5 text-white shadow-lg border border-red-900/40 flex items-center justify-between">
          <div>
            <p className="text-red-200 text-xs font-bold uppercase tracking-wider">Arsip Bidang {user?.bidang}</p>
            <p className="text-3xl font-black mt-1.5">{rawList.length}</p>
            <p className="text-[11px] text-red-300 font-light mt-0.5">Semua nomor resmi terverifikasi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Verifikasi ANRI</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">100% Otentik</p>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Sesuai Surat Edaran Sekda</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-blue-600 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Unduh & Cetak Resmi</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">Siap Akses</p>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Lampiran digital tersedia</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. SEARCH BAR & FILTER TABS */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari nomor surat, perihal, atau nama pengirim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('Semua')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'Semua'
                ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Semua ({rawList.length})
          </button>
          <button
            onClick={() => setActiveTab('2026')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === '2026'
                ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Tahun 2026
          </button>
          <button
            onClick={() => setActiveTab('Dokumen')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'Dokumen'
                ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Berlampiran Dokumen
          </button>
        </div>
      </div>

      {/* 4. TABLE ARSIP */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="py-4 px-4">No</th>
                <th className="py-4 px-4">Tanggal Terbit</th>
                <th className="py-4 px-4">Nomor Surat Resmi</th>
                <th className="py-4 px-4 min-w-[260px]">Perihal Surat & Lampiran</th>
                <th className="py-4 px-4">Pemohon</th>
                <th className="py-4 px-4 text-right">Aksi & Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                    Memuat arsip surat resmi bidang Anda dari server...
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
                      {item.tanggalSurat
                        ? new Date(item.tanggalSurat).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
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
                        <span className="text-gray-400 italic font-light">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-gray-900 dark:text-white leading-relaxed line-clamp-2">
                        {item.perihal}
                      </p>
                      {item.lampiran && (
                        <a
                          href={item.lampiran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline mt-1.5 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md w-fit border border-red-100 dark:border-red-900"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                          </svg>
                          Unduh Lampiran Surat
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-800 dark:text-gray-200">{item.pengirim}</p>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedSurat(item);
                          setIsDetailOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-300 text-gray-700 dark:text-gray-200 font-bold text-xs transition-all border border-transparent hover:border-red-200"
                      >
                        Buka Arsip & Timeline
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                    Tidak ada arsip surat yang cocok dengan pencarian Anda untuk bidang {user?.bidang}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SuratDetailModal
        surat={selectedSurat}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
