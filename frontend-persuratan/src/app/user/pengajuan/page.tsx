'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreateSuratBatch, useUploadFile } from '@/features/surat/api';
import { useKlasifikasi } from '@/features/klasifikasi/api';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface SuratItemForm {
  id: number;
  perihal: string;
  kodeKlasifikasi: string;
  tanggalSurat: string;
  jumlahSurat: number;
  file: File | null;
  fileUrl?: string;
}

export default function PengajuanSuratPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [pemohon, setPemohon] = useState('');
  const [bidang, setBidang] = useState(user?.bidang || 'APTIKA');
  
  const [items, setItems] = useState<SuratItemForm[]>([
    { id: Date.now(), perihal: '', kodeKlasifikasi: '', tanggalSurat: new Date().toISOString().split('T')[0], jumlahSurat: 1, file: null }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const createBatchMutation = useCreateSuratBatch();
  const uploadMutation = useUploadFile();
  const { data: klasifikasiOptions = [] } = useKlasifikasi();

  const handleItemChange = (index: number, field: keyof SuratItemForm, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), perihal: '', kodeKlasifikasi: '', tanggalSurat: new Date().toISOString().split('T')[0], jumlahSurat: 1, file: null }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pemohon.trim()) {
      setErrorMsg('Harap lengkapi nama pengirim.');
      return;
    }
    for (const item of items) {
      if (!item.perihal.trim() || !item.kodeKlasifikasi || !item.tanggalSurat) {
        setErrorMsg('Harap lengkapi perihal, klasifikasi, dan tanggal untuk semua surat.');
        return;
      }
      if (!item.jumlahSurat || item.jumlahSurat < 1 || isNaN(item.jumlahSurat)) {
        setErrorMsg('Jumlah surat minimal 1.');
        return;
      }
    }
    setErrorMsg(null);
    setIsUploading(true);

    try {
      const finalBatch = [];
      for (const item of items) {
        let uploadedUrl = item.fileUrl;
        if (item.file && !uploadedUrl) {
          const res = await uploadMutation.mutateAsync(item.file);
          uploadedUrl = res.url || undefined;
        }
        for (let i = 0; i < item.jumlahSurat; i++) {
          finalBatch.push({
            pengirim: pemohon,
            bidang: user?.bidang || bidang,
            perihal: item.jumlahSurat > 1 ? `${item.perihal} (${i + 1}/${item.jumlahSurat})` : item.perihal,
            kodeKlasifikasi: item.kodeKlasifikasi,
            tanggalSurat: item.tanggalSurat,
            lampiran: uploadedUrl || undefined,
          });
        }
      }

      await createBatchMutation.mutateAsync(finalBatch);
      await Swal.fire({
        title: 'Penomoran Berhasil!',
        text: `Berhasil menerbitkan nomor untuk ${finalBatch.length} surat.`,
        icon: 'success',
        confirmButtonColor: '#dc2626',
      });
      router.push('/user/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Gagal mengajukan surat.';
      setErrorMsg(msg);
      Swal.fire('Gagal Mengajukan', msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createBatchMutation.isPending || isUploading;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Pengajuan Penomoran Surat
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
          Isi formulir berikut, pilih klasifikasi, dan sistem akan langsung menerbitkan nomor surat resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Pengajuan */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Formulir Surat
              </h2>
              <p className="text-xs text-gray-400">
                Data umum pengirim dan daftar surat yang akan dinomori
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Three Column Row: Pengirim + Tanggal Pengajuan + Bidang */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Pengirim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pemohon}
                  onChange={(e) => setPemohon(e.target.value)}
                  required
                  placeholder="Masukkan nama pengirim"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none focus:bg-white transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Tanggal Pengajuan <span className="text-gray-400 font-normal">(Otomatis)</span>
                </label>
                <input
                  type="date"
                  value={todayStr}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Bidang Kerja Dinas <span className="text-red-500">*</span>
                </label>
                <select
                  value={user?.bidang || bidang}
                  disabled={!!user?.bidang}
                  onChange={(e) => setBidang(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none focus:bg-white transition-all text-gray-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed font-semibold"
                >
                  <option value="APTIKA">APTIKA</option>
                  <option value="PERSANDIAN">PERSANDIAN</option>
                  <option value="PDE">PDE</option>
                  <option value="HUMAS">HUMAS</option>
                </select>
                {user?.bidang && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Otomatis ({user.bidang})
                  </p>
                )}
              </div>
            </div>



            {/* Dynamic Items List */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daftar Surat yang Akan Dinomori</h3>
                <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-mono font-bold text-xs">
                  {items.length} Item
                </span>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-500 uppercase">Surat #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus surat ini"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Perihal / Berita Acara (BA) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={item.perihal}
                      onChange={(e) => handleItemChange(index, 'perihal', e.target.value)}
                      required
                      placeholder="Perihal surat..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Tanggal Surat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={item.tanggalSurat}
                        onChange={(e) => handleItemChange(index, 'tanggalSurat', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Kode Klasifikasi <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={klasifikasiOptions}
                        value={item.kodeKlasifikasi}
                        onChange={(val) => handleItemChange(index, 'kodeKlasifikasi', val ? String(val) : '')}
                        placeholder="Cari (misal: 000.1.2.3)..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Jumlah Kolektif <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={item.jumlahSurat || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleItemChange(index, 'jumlahSurat', val === '' ? '' : parseInt(val));
                        }}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Lampiran Dokumen <span className="text-xs font-normal text-gray-400">(Opsional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        key={item.file ? 'has-file' : 'empty-file'}
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            if (e.target.files[0].size > 5 * 1024 * 1024) {
                              Swal.fire('File Terlalu Besar', 'Maksimal 5MB.', 'warning');
                              return;
                            }
                            handleItemChange(index, 'file', e.target.files[0]);
                          }
                        }}
                        accept=".pdf,.doc,.docx"
                        className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
                      />
                      {item.file && (
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'file', undefined)}
                          className="px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors whitespace-nowrap border border-red-100 dark:border-red-900/60"
                        >
                          Hapus File
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Surat Lainnya
              </button>
            </div>

            {/* Status default notice */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Penomoran Otomatis Aktif
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5 font-light leading-relaxed">
                  Sistem akan langsung menerbitkan nomor surat resmi setelah Anda klik simpan. Pastikan Klasifikasi sudah benar.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold border border-red-300 dark:border-red-800">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-800 dark:text-white text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
              >
                {isPending ? 'Memproses Penomoran...' : 'Terbitkan Nomor Surat'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Guidelines */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm border-t-4 border-t-red-600 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-50 dark:bg-red-950/60 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Alur Penomoran Cepat</h3>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Isi Formulir & Klasifikasi</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-light">Lengkapi identitas, perihal, dan tentukan sendiri kode klasifikasi dinas (234 kode).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Terbit Nomor Otomatis</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-light">Nomor surat langsung digenerate secara berurutan sesuai kapasitas blok harian (1-40) tanpa menunggu Admin.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
