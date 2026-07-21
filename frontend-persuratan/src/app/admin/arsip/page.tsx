'use client';

import React, { useState } from 'react';
import { useSuratList, PengajuanSurat } from '@/features/surat/api';
import { SuratDetailModal } from '@/components/surat/SuratDetailModal';
import Swal from 'sweetalert2';

const BIDANG_LIST = ['APTIKA', 'PERSANDIAN', 'PDE', 'HUMAS'];

export default function AdminArsipPage() {
  const [selectedBidang, setSelectedBidang] = useState<string>('APTIKA');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurat, setSelectedSurat] = useState<PengajuanSurat | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch only completed (Selesai) letters for Archive filtered by active Bidang
  const { data: suratList, isLoading } = useSuratList({
    bidang: selectedBidang,
    status: 'Selesai',
    search: searchQuery || undefined,
  });

  // Fetch all completed letters to count per Bidang
  const { data: allSuratList } = useSuratList({
    status: 'Selesai',
  });

  const list: PengajuanSurat[] = Array.isArray(suratList) ? suratList : (suratList && Array.isArray((suratList as any).data) ? (suratList as any).data : []);

  const getBidangCount = (b: string) => {
    const arr: PengajuanSurat[] | null = Array.isArray(allSuratList) ? allSuratList : (allSuratList && Array.isArray((allSuratList as any).data) ? (allSuratList as any).data : null);
    if (!arr || !Array.isArray(arr)) return 0;
    return arr.filter((s: PengajuanSurat) => s.bidang?.toUpperCase() === b).length;
  };

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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Arsip per Bidang
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
          Pencarian cepat nomor surat resmi dan riwayat surat keluar yang telah selesai diterbitkan per bidang
        </p>
      </div>

      {/* 4 Bidang Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {BIDANG_LIST.map((bidang) => {
          const count = getBidangCount(bidang);
          const isActive = selectedBidang === bidang;
          return (
            <button
              key={bidang}
              onClick={() => setSelectedBidang(bidang)}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isActive
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 shadow-md shadow-red-500/10 scale-[1.02]'
                  : 'border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-red-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {bidang}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className={`text-lg sm:text-xl font-extrabold ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {count} surat
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Surat Bidang: <span className="text-red-600 dark:text-red-400">{selectedBidang}</span>
            </h3>
            <p className="text-xs text-gray-400">Daftar surat resmi yang telah memiliki nomor SOP</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              placeholder={`Cari surat di bidang ${selectedBidang}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-xl whitespace-nowrap border border-red-200 dark:border-red-800">
            {list.length} surat
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nomor Surat Resmi</th>
                <th className="py-3.5 px-4">Pengirim / Pemohon</th>
                <th className="py-3.5 px-4 min-w-[220px]">Perihal / Berita Acara (BA)</th>
                <th className="py-3.5 px-4">Tgl Surat</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Memuat arsip digital bidang {selectedBidang}...
                  </td>
                </tr>
              ) : list && list.length > 0 ? (
                list.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-gray-400 font-semibold">{index + 1}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.nomorSurat ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                            {item.nomorSurat}
                          </span>
                          <button
                            onClick={() => item.nomorSurat && copyNomor(item.nomorSurat)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                            title="Salin Nomor Resmi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900 dark:text-white">{item.pengirim}</p>
                      <span className="text-[10px] text-gray-400">Bid. {item.bidang}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-900 dark:text-white leading-relaxed line-clamp-2">
                        {item.perihal}
                      </p>
                      {item.lampiran && (
                        <a
                          href={item.lampiran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline mt-1"
                        >
                          Lihat Lampiran Dokumen
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                      {item.tanggalSurat
                        ? new Date(item.tanggalSurat).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedSurat(item);
                          setIsDetailOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-colors"
                      >
                        Detail & Salin
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Belum ada arsip surat untuk bidang {selectedBidang}
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
