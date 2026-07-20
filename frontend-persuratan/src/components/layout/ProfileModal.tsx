'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import Swal from 'sweetalert2';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // State Profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bidang, setBidang] = useState(user?.bidang || 'APTIKA');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBidang(user.bidang || 'APTIKA');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.patch('/user/profile', {
        name,
        bidang: user?.role === 'ADMIN' ? 'Kesekretariatan' : user?.bidang,
      });

      if (res.data && user) {
        setUser({
          ...user,
          name: res.data.name || name,
          bidang: user?.role === 'ADMIN' ? 'Kesekretariatan' : (res.data.bidang || user.bidang),
        });
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal memperbarui profil.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMessage(null);

    if (newPassword.length < 8) {
      setPwdMessage({ type: 'error', text: 'Password baru minimal 8 karakter.' });
      setPwdLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      setPwdLoading(false);
      return;
    }

    try {
      await api.post('/user/change-password', {
        oldPassword,
        newPassword,
      });

      setPwdMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Password Anda telah berhasil diubah.',
        confirmButtonColor: '#dc2626',
      });
    } catch (err: any) {
      setPwdMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal mengubah password. Pastikan password lama sesuai.',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden font-sans transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-800 to-red-950 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">Profil & Keamanan Akun</h3>
              <p className="text-[11px] text-red-200/80 font-medium mt-0.5">
                Kelola informasi identitas atau ubah password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-800/60 hover:bg-red-700 flex items-center justify-center text-red-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-6 pt-3 gap-6">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`pb-3 text-xs font-bold transition-colors relative ${
              activeTab === 'profile'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Informasi Profil
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setPwdMessage(null); }}
            className={`pb-3 text-xs font-bold transition-colors relative ${
              activeTab === 'password'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Ubah Password
            {activeTab === 'password' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Alamat Email (Login ID)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Email digunakan sebagai identitas masuk utama</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Nama Lengkap / Identitas
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Bidang Kerja Dinas
              </label>
              {user?.role === 'ADMIN' ? (
                <div>
                  <input
                    type="text"
                    disabled
                    value="Kesekretariatan"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 font-semibold cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Akun administrator mengelola seluruh bidang kerja
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={bidang}
                    disabled
                    onChange={(e) => setBidang(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <option value="APTIKA">APTIKA (Aplikasi Informatika)</option>
                    <option value="PERSANDIAN">PERSANDIAN (Persandian & Keamanan Informasi)</option>
                    <option value="PDE">PDE (Pengolahan Data Elektronik & Statistik)</option>
                    <option value="HUMAS">HUMAS (Humas, Informatika & Komunikasi Publik)</option>
                  </select>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Penempatan bidang dikunci oleh Administrator
                  </p>
                </>
              )}
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Password Lama
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan password saat ini..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Gunakan kombinasi huruf dan angka minimal 8 karakter</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                required
                placeholder="Ulangi password baru..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {pwdMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  pwdMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                }`}
              >
                {pwdMessage.text}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
              >
                {pwdLoading ? 'Memperbarui...' : 'Ubah Password Sekarang'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
