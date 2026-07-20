'use client';

import React, { useState } from 'react';
import { useSuratList, PengajuanSurat, useDeleteSurat } from '@/features/surat/api';
import { SuratDetailModal } from '@/components/surat/SuratDetailModal';
import { GenerateNomorModal } from '@/components/surat/GenerateNomorModal';
import Swal from 'sweetalert2';

export default function AdminSuratManagementPage() {
  const [filterBidang, setFilterBidang] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedDetail, setSelectedDetail] = useState<PengajuanSurat | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedGenerate, setSelectedGenerate] = useState<PengajuanSurat | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const { data: suratList, isLoading } = useSuratList({
    bidang: filterBidang || undefined,
    status: filterStatus || undefined,
    search: searchQuery || undefined,
  });

  const deleteMutation = useDeleteSurat();

  const list: PengajuanSurat[] = Array.isArray(suratList) ? suratList : (suratList && Array.isArray((suratList as any).data) ? (suratList as any).data : []);

  const handleDelete = (id: number, perihal: string) => {
    if (confirm(`Yakin ingin menghapus pengajuan surat "${perihal}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => alert('Berhasil menghapus pengajuan surat.'),
      });
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Kelola Penomoran Surat
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
            Verifikasi, terbitkan nomor surat resmi, atau kelola data surat masuk dari seluruh bidang
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Bidang Dropdown */}
          <select
            value={filterBidang}
            onChange={(e) => setFilterBidang(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Semua Bidang Kerja</option>
            <option value="APTIKA">APTIKA</option>
            <option value="PERSANDIAN">PERSANDIAN</option>
            <option value="PDE">PDE</option>
            <option value="HUMAS">HUMAS</option>
          </select>

          {/* Status Tabs */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu Penomoran</option>
            <option value="Selesai">Selesai Dinomori</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari perihal atau pengirim..."
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
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                <th className="py-3.5 px-4">Pemohon & Bidang</th>
                <th className="py-3.5 px-4 min-w-[220px]">Perihal Surat</th>
                <th className="py-3.5 px-4">Nomor Surat Resmi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Memuat data surat dari database...
                  </td>
                </tr>
              ) : list.length > 0 ? (
                list.map((item, index) => (
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
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900 dark:text-white">{item.pengirim}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Bid. {item.bidang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                        {item.perihal}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.nomorSurat ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                            {item.nomorSurat}
                          </span>
                          <button
                            onClick={() => item.nomorSurat && copyNomor(item.nomorSurat)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">— Belum Dinomori —</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
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
                        {item.status === 'Menunggu' && (
                          <button
                            onClick={() => {
                              setSelectedGenerate(item);
                              setIsGenerateOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 text-xs transition-all"
                          >
                            Generate Nomor
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedDetail(item);
                            setIsDetailOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.perihal)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus Pengajuan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Tidak ada pengajuan surat yang sesuai filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SuratDetailModal
        surat={selectedDetail}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <GenerateNomorModal
        surat={selectedGenerate}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
      />
    </div>
  );
}
