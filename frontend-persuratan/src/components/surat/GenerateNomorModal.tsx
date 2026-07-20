'use client';

import React, { useState } from 'react';
import { PengajuanSurat, useGenerateNomor } from '@/features/surat/api';
import { useKlasifikasi } from '@/features/klasifikasi/api';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import Swal from 'sweetalert2';

interface GenerateNomorModalProps {
  surat: PengajuanSurat | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateNomorModal({ surat, isOpen, onClose }: GenerateNomorModalProps) {
  const [selectedKode, setSelectedKode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: klasifikasiList, isLoading: loadingKlasifikasi } = useKlasifikasi();
  const generateMutation = useGenerateNomor();

  if (!isOpen || !surat) return null;

  const handleGenerate = () => {
    if (!selectedKode) {
      setErrorMsg('Pilih kode klasifikasi terlebih dahulu');
      return;
    }
    setErrorMsg(null);

    generateMutation.mutate(
      { id: surat.id, kodeKlasifikasi: selectedKode },
      {
        onSuccess: (res: any) => {
          Swal.fire({
            title: 'Nomor Surat Diterbitkan!',
            text: `Nomor Resmi: ${res.nomorSurat || selectedKode + '/...'}`,
            icon: 'success',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Tutup & Salin',
          }).then(() => {
            if (res.nomorSurat) {
              navigator.clipboard.writeText(res.nomorSurat);
            }
          });
          onClose();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err.message || 'Gagal generate nomor';
          setErrorMsg(msg);
          Swal.fire({
            title: 'Gagal Menerbitkan Nomor',
            text: msg,
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        },
      },
    );
  };

  const getMonthRomawi = () => {
    const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return months[new Date().getMonth()];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-red-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Terbitkan Nomor Surat</h3>
              <p className="text-xs text-red-100">Algoritma SOP Harian DISKOMINFO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 uppercase font-semibold">Surat yang akan dinomori:</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 leading-snug">{surat.perihal}</p>
            <p className="text-xs text-gray-500 mt-1">Pengirim: <span className="font-semibold">{surat.pengirim} ({surat.bidang})</span></p>
          </div>

          {/* Classification Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Pilih Kode Klasifikasi (234 Klasifikasi Resmi)
            </label>
            {loadingKlasifikasi ? (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400">
                Memuat 234 klasifikasi resmi...
              </div>
            ) : (
              <SearchableSelect
                value={selectedKode}
                onChange={(val) => setSelectedKode(val ? String(val) : null)}
                options={klasifikasiList || []}
                labelKey="nama"
                valueKey="kode"
                placeholder="Ketik kode (000.1.2) atau uraian (Perjalanan Dinas)..."
              />
            )}
          </div>

          {/* Selected Preview */}
          {selectedKode && (
            <div className="p-3.5 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-800/40 text-xs text-red-800 dark:text-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>Kode Terpilih: <strong className="font-mono text-sm">{selectedKode}</strong></span>
              <span className="text-[11px] font-semibold font-mono bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800/50">
                {selectedKode}/[Stok]/DISKOMINFO/{getMonthRomawi()}/{new Date().getFullYear()}
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold border border-red-300 dark:border-red-800">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-800 dark:text-white text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={generateMutation.isPending || !selectedKode}
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            {generateMutation.isPending ? 'Menerbitkan Nomor...' : 'Generate Nomor Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}
