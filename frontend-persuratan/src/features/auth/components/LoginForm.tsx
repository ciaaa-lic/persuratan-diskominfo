'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useLogin } from '../api';
import { AuthResponse } from '../types';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const loginMutation = useLogin();

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Silakan isi email dan password');
      return;
    }

    const payload = { email, password };

    loginMutation.mutate(payload, {
      onSuccess: (data: any) => {
        const resPayload = data?.user ? data : data?.data || data;
        const role = resPayload?.user?.role || 'BIDANG';
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      },
      onError: (error: unknown) => {
        const err = error as AxiosError<{ message?: string }>;
        const msg = err.response?.data?.message || err.message || 'Email atau password salah';
        setErrorMessage(msg);
      },
    });
  };

  return (
    <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex bg-white dark:bg-gray-900 min-h-[580px]">
      {/* LEFT: Brand Panel */}
      <div
        className="hidden md:flex flex-col justify-between p-10 w-5/12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
        }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 50px)',
            }}
          />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner backdrop-blur-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3 tracking-tight">
            Sistem<br />
            e-Surat<br />
            <span className="text-red-300">DISKOMINFO</span>
          </h1>
          <p className="text-red-200/90 text-sm leading-relaxed font-light">
            Pencatatan dan penomoran surat resmi secara digital, aman, dan terstruktur.
          </p>
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10">
          <p className="text-red-300/60 text-xs">© 2026 DISKOMINFO. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT: Login Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-10 py-10">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">e-Surat DISKOMINFO</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
          Selamat Datang!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-light">
          Masuk dengan email dinas atau gunakan akun demo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="nama@diskominfo.go.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {!showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loginMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider font-semibold mb-3">
            — Klik Akun Demo Cepat —
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@diskominfo.go.id', 'admin')}
              className="text-left p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 hover:border-red-300 hover:bg-red-50/80 dark:hover:border-red-700 transition-all group"
            >
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">
                Admin Utama
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">admin@diskominfo...</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('aptika@diskominfo.go.id', 'aptika')}
              className="text-left p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 hover:border-red-300 hover:bg-red-50/80 dark:hover:border-red-700 transition-all group"
            >
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">
                Bid. APTIKA
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">aptika@diskominfo...</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('persandian@diskominfo.go.id', 'persandian')}
              className="text-left p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 hover:border-red-300 hover:bg-red-50/80 dark:hover:border-red-700 transition-all group"
            >
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">
                Bid. PERSANDIAN
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">persandian@disk...</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('pde@diskominfo.go.id', 'pde')}
              className="text-left p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 hover:border-red-300 hover:bg-red-50/80 dark:hover:border-red-700 transition-all group"
            >
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">
                Bid. PDE
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">pde@diskominfo...</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('humas@diskominfo.go.id', 'humas')}
              className="text-left p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 hover:border-red-300 hover:bg-red-50/80 dark:hover:border-red-700 transition-all group"
            >
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">
                Bid. HUMAS
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">humas@diskominfo...</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
