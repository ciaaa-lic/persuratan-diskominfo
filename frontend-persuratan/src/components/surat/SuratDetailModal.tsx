'use client';

import React from 'react';
import { PengajuanSurat, useDeleteSurat } from '@/features/surat/api';
import { useAuthStore } from '@/store/useAuthStore';
import Swal from 'sweetalert2';

interface SuratDetailModalProps {
  surat: PengajuanSurat | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SuratDetailModal({ surat, isOpen, onClose }: SuratDetailModalProps) {
  const { user } = useAuthStore();
  const deleteMutation = useDeleteSurat();

  if (!isOpen || !surat) return null;

  const copyNomor = (nomor: string) => {
    navigator.clipboard.writeText(nomor);
    Swal.fire({
      title: 'Disalin!',
      text: `Nomor surat berhasil disalin: ${nomor}`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Hapus Pengajuan?',
      text: "Data surat dan nomor yang terpakai akan dihapus. Nomor akan kembali tersedia untuk pengajuan lain pada tanggal yang sama.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(surat.id, {
          onSuccess: () => {
            Swal.fire({
              title: 'Terhapus!',
              text: 'Pengajuan surat berhasil dihapus.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            onClose();
          },
          onError: (error: any) => {
            Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
          }
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Detail Pengajuan Surat</h3>
            <p className="text-xs text-gray-500">Informasi lengkap dan riwayat pemrosesan</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Nomor Surat Banner */}
          {surat.nomorSurat ? (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/20 border border-red-200 dark:border-red-800/60 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                  Nomor Surat Resmi Diterbitkan
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {surat.nomorSurat}
                </p>
              </div>
              <button
                onClick={() => surat.nomorSurat && copyNomor(surat.nomorSurat)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Salin Nomor
              </button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase">
                Status Penomoran
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                Surat masih dalam proses verifikasi / menunggu penerbitan nomor dari Admin.
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Pemohon / Pengirim</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{surat.pengirim}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Bidang Kerja</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{surat.bidang}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 sm:col-span-2">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Perihal / Tujuan Surat</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{surat.perihal}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Tanggal Pengajuan</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {surat.tanggalPengajuan ? new Date(surat.tanggalPengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Tanggal Terbit Surat</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {surat.tanggalSurat ? new Date(surat.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum Terbit'}
              </p>
            </div>
          </div>

          {/* Lampiran / File */}
          {surat.lampiran && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Lampiran Dokumen Surat</p>
                  <p className="text-[11px] text-gray-400 truncate">{surat.lampiran.split('/').pop()}</p>
                </div>
              </div>
              <a
                href={surat.lampiran}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 text-gray-800 dark:text-white rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-600 shadow-sm transition-all flex items-center gap-1.5"
              >
                Unduh / Lihat
              </a>
            </div>
          )}

          {/* Status Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
              Riwayat Proses (Timeline)
            </h4>
            <div className="space-y-4 pl-2 border-l-2 border-red-500/30 dark:border-red-500/20 ml-2">
              {surat.statusHistory && surat.statusHistory.length > 0 ? (
                surat.statusHistory.map((hist, i) => (
                  <div key={hist.id || i} className="relative pl-5">
                    <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-2 border-red-600 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        hist.status === 'Selesai'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {hist.status}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(hist.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {hist.keterangan && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 pl-1 font-light">
                        {hist.keterangan}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative pl-5">
                  <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-2 border-red-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                      {surat.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {surat.tanggalPengajuan
                        ? new Date(surat.tanggalPengajuan).toLocaleString('id-ID')
                        : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 pl-1 font-light">
                    Surat baru diajukan oleh bidang {surat.bidang}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
          <div>
            {(user?.role === 'ADMIN' || user?.bidang === surat.bidang) && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/50 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Pengajuan'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
