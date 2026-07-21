'use client';

import React, { useState } from 'react';
import { useSuratList, PengajuanSurat } from '@/features/surat/api';
import { exportSuratToExcel } from '@/lib/exportExcel';
import { SuratDetailModal } from '@/components/surat/SuratDetailModal';
import Swal from 'sweetalert2';

export default function AdminRekapPage() {
  const [tanggalSuratStart, setTanggalSuratStart] = useState('');
  const [tanggalSuratEnd, setTanggalSuratEnd] = useState('');
  const [tanggalPengajuanStart, setTanggalPengajuanStart] = useState('');
  const [tanggalPengajuanEnd, setTanggalPengajuanEnd] = useState('');
  const [filterBidang, setFilterBidang] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedSurat, setSelectedSurat] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: suratList, isLoading } = useSuratList({
    bidang: filterBidang || undefined,
    status: filterStatus || undefined,
  });

  const rawList: PengajuanSurat[] = Array.isArray(suratList) ? suratList : (suratList && Array.isArray((suratList as any).data) ? (suratList as any).data : []);
  const list = rawList.filter((s: PengajuanSurat) => {
    // Tanggal Surat filter
    if (s.tanggalSurat) {
      const ts = new Date(s.tanggalSurat);
      if (tanggalSuratStart && ts < new Date(`${tanggalSuratStart}T00:00:00`)) return false;
      if (tanggalSuratEnd && ts > new Date(`${tanggalSuratEnd}T23:59:59`)) return false;
    } else if (tanggalSuratStart || tanggalSuratEnd) {
      return false; // required by filter but missing
    }

    // Tanggal Pengajuan filter
    if (s.tanggalPengajuan) {
      const tp = new Date(s.tanggalPengajuan);
      if (tanggalPengajuanStart && tp < new Date(`${tanggalPengajuanStart}T00:00:00`)) return false;
      if (tanggalPengajuanEnd && tp > new Date(`${tanggalPengajuanEnd}T23:59:59`)) return false;
    } else if (tanggalPengajuanStart || tanggalPengajuanEnd) {
      return false;
    }

    return true;
  });

  // Group by Bidang
  const bidangCounts: Record<string, number> = {
    APTIKA: 0,
    PERSANDIAN: 0,
    PDE: 0,
    HUMAS: 0,
  };

  // Group by Klasifikasi Code prefix
  const klasifikasiCounts: Record<string, number> = {};

  // Group by Bulan (Jan - Des)
  const monthlyCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  list.forEach((s) => {
    if (s.bidang && bidangCounts[s.bidang] !== undefined) {
      bidangCounts[s.bidang]++;
    } else if (s.bidang) {
      bidangCounts[s.bidang] = (bidangCounts[s.bidang] || 0) + 1;
    }

    if (s.nomorTerpakai?.kodeKlasifikasi) {
      const k = s.nomorTerpakai.kodeKlasifikasi;
      klasifikasiCounts[k] = (klasifikasiCounts[k] || 0) + 1;
    } else if (s.nomorSurat) {
      const code = s.nomorSurat.split('/')[0] || 'Lainnya';
      klasifikasiCounts[code] = (klasifikasiCounts[code] || 0) + 1;
    }

    const dateStr = s.tanggalPengajuan || s.tanggalSurat;
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getMonth())) {
        monthlyCounts[date.getMonth()]++;
      }
    }
  });

  const maxMonthCount = Math.max(...monthlyCounts, 10);

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

  const handleExport = () => {
    exportSuratToExcel(list);
  };

  const resetFilters = () => {
    setTanggalSuratStart('');
    setTanggalSuratEnd('');
    setTanggalPengajuanStart('');
    setTanggalPengajuanEnd('');
    setFilterBidang('');
    setFilterStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Rekapitulasi & Statistik Penomoran Surat
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
            Ringkasan agregat, filter bulanan, grafik visual, dan ekspor data surat resmi DISKOMINFO
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Excel / CSV
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Tanggal Surat Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              TANGGAL SURAT
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={tanggalSuratStart}
                onChange={(e) => setTanggalSuratStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-gray-400 text-xs font-medium">s/d</span>
              <input
                type="date"
                value={tanggalSuratEnd}
                onChange={(e) => setTanggalSuratEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Tanggal Pengajuan Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              TANGGAL PENGAJUAN
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={tanggalPengajuanStart}
                onChange={(e) => setTanggalPengajuanStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-gray-400 text-xs font-medium">s/d</span>
              <input
                type="date"
                value={tanggalPengajuanEnd}
                onChange={(e) => setTanggalPengajuanEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Filter Bidang
            </label>
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Semua Bidang Kerja</option>
              <option value="APTIKA">APTIKA</option>
              <option value="PERSANDIAN">PERSANDIAN</option>
              <option value="PDE">PDE</option>
              <option value="HUMAS">HUMAS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/60 dark:bg-gray-800/60">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daftar Rekapitulasi Surat</h3>
            <p className="text-[11px] text-gray-400">Seluruh data pengajuan dan penomoran resmi yang sesuai kriteria</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200">
            {list.length} Surat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nomor Surat Resmi</th>
                <th className="py-3.5 px-4">Tanggal Surat</th>
                <th className="py-3.5 px-4">Pemohon & Bidang</th>
                <th className="py-3.5 px-4 min-w-[220px]">Perihal / BA</th>
                <th className="py-3.5 px-4">Klasifikasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                    Memuat data rekapitulasi dari database...
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
                        <span className="text-gray-400 italic">— Belum —</span>
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
                      <p className="font-bold text-gray-900 dark:text-white">{item.pengirim}</p>
                      <span className="text-[10px] text-gray-400">Bid. {item.bidang}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {item.perihal}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-semibold">
                      {item.nomorTerpakai?.kodeKlasifikasi || item.nomorSurat?.split('/')[0] || '—'}
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
                      <button
                        onClick={() => {
                          setSelectedSurat(item);
                          setIsDetailOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                    Tidak ada data rekap yang sesuai filter
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
