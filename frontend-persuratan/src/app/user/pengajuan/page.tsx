'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreateSurat, useCreateSuratBatch, useUploadFile } from '@/features/surat/api';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function PengajuanSuratPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [pemohon, setPemohon] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [bidang, setBidang] = useState(user?.bidang || 'APTIKA');
  const [perihal, setPerihal] = useState('');
  const [batchCount, setBatchCount] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const createSingleMutation = useCreateSurat();
  const createBatchMutation = useCreateSuratBatch();
  const uploadMutation = useUploadFile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('File Terlalu Besar', 'Ukuran file maksimal adalah 5MB.', 'warning');
        return;
      }
      setSelectedFile(file);
      setIsUploading(true);
      setErrorMsg(null);

      try {
        const res = await uploadMutation.mutateAsync(file);
        if (res.url) {
          setFileUrl(res.url);
        }
      } catch (err: any) {
        setErrorMsg('Gagal mengunggah file: ' + (err?.response?.data?.message || err.message));
        setSelectedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pemohon.trim() || !perihal.trim()) {
      setErrorMsg('Harap lengkapi semua kolom wajib.');
      return;
    }

    if (isUploading) {
      setErrorMsg('Tunggu proses pengunggahan file selesai.');
      return;
    }

    setErrorMsg(null);

    try {
      if (batchCount > 1) {
        const batchList = Array.from({ length: batchCount }, (_, i) => ({
          pengirim: pemohon,
          bidang: user?.bidang || bidang,
          perihal: `${perihal} (${i + 1}/${batchCount})`,
          tanggalSurat,
          lampiran: fileUrl,
        }));
        await createBatchMutation.mutateAsync(batchList);
        await Swal.fire({
          title: 'Pengajuan Kolektif Berhasil!',
          text: `Berhasil mengajukan ${batchCount} nomor surat serentak.`,
          icon: 'success',
          confirmButtonColor: '#dc2626',
        });
      } else {
        await createSingleMutation.mutateAsync({
          pengirim: pemohon,
          bidang: user?.bidang || bidang,
          perihal,
          tanggalSurat,
          lampiran: fileUrl,
        });
        await Swal.fire({
          title: 'Pengajuan Berhasil!',
          text: 'Surat telah diajukan dan sedang menunggu penerbitan nomor resmi.',
          icon: 'success',
          confirmButtonColor: '#dc2626',
        });
      }

      router.push('/user/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Gagal mengajukan surat.';
      setErrorMsg(msg);
      Swal.fire('Gagal Mengajukan', msg, 'error');
    }
  };

  const isPending = createSingleMutation.isPending || createBatchMutation.isPending || isUploading;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Ajukan Surat Baru
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
          Isi formulir berikut untuk mengajukan penomoran surat resmi dengan lengkap dan akurat.
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
                Formulir Pengajuan Penomoran
              </h2>
              <p className="text-xs text-gray-400">
                Pastikan data surat dan klasifikasi sudah sesuai sebelum dikirim
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Two Column Row: Pengirim + Tanggal */}
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
                  Tanggal Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none focus:bg-white transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bidang */}
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
                <option value="APTIKA">APTIKA (Aplikasi Informatika)</option>
                <option value="PERSANDIAN">PERSANDIAN (Persandian & Keamanan Informasi)</option>
                <option value="PDE">PDE (Pengolahan Data Elektronik & Statistik)</option>
                <option value="HUMAS">HUMAS (Humas, Informatika & Komunikasi Publik)</option>
              </select>
              {user?.bidang && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Bidang dikunci otomatis sesuai akun Anda ({user.bidang})
                </p>
              )}
            </div>


            {/* Jumlah Surat (Batch Slider) */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                  Jumlah Nomor yang Diajukan Sekaligus (Kolektif / Batch)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-mono font-bold text-xs">
                  {batchCount} Nomor
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="w-16 px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center font-bold text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-light leading-relaxed">
                Jika memilih &gt; 1, sistem otomatis mengajukan beberapa nomor surat serentak dengan penanda urutan <strong className="font-mono text-red-600 dark:text-red-400">(1/{batchCount}), (2/{batchCount}), dst.</strong> pada keterangan Perihal / Berita Acara (BA).
              </p>
            </div>

            {/* Perihal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Perihal / Berita Acara (BA) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                required
                placeholder="Jelaskan Perihal / Berita Acara (BA) secara singkat, padat, dan jelas..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none focus:bg-white transition-all text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Lampiran File Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Lampiran Dokumen <span className="text-xs font-normal text-gray-400">(Opsional / Maks 5MB)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="block w-full text-xs text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-bold
                    file:bg-red-50 file:text-red-700
                    dark:file:bg-red-950/60 dark:file:text-red-400
                    hover:file:bg-red-100 dark:hover:file:bg-red-900/40
                    border border-gray-200 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-800
                    cursor-pointer transition-all"
                />
              </div>
              {isUploading && (
                <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Mengunggah file ke server...
                </p>
              )}
              {selectedFile && !isUploading && fileUrl && (
                <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg w-fit border border-emerald-200 dark:border-emerald-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  File tersimpan: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Status default notice */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60 rounded-2xl">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-yellow-900 dark:text-yellow-300">
                  Proses Penomoran Surat
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-400 mt-0.5 font-light leading-relaxed">
                  Setelah diajukan, surat akan berstatus <strong className="font-bold">Menunggu Nomor Surat</strong> hingga pihak administrator melakukan verifikasi dan menerbitkan nomor resmi.
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
                {isPending ? 'Mengirim Pengajuan...' : 'Simpan Pengajuan'}
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Alur Penomoran Surat</h3>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Isi Formulir Pengajuan</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-light">Lengkapi identitas pengirim, bidang, dan perihal surat dengan benar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Verifikasi Admin</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-light">Admin meninjau pengajuan dan menentukan kode klasifikasi dinas (234 kode).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Terbit Nomor Resmi</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-light">Nomor surat otomatis digenerate secara berurutan sesuai kapasitas blok harian (1-40).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
