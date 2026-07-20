<template>
  <!-- Full-screen gradient background -->
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #1e1b4b 100%);">
    <!-- Background decorative circles -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style="background: radial-gradient(circle, #ef4444, transparent)"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15" style="background: radial-gradient(circle, #7c3aed, transparent)"></div>
    </div>

    <!-- Split-Screen Card -->
    <div class="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex" style="min-height: 560px;">
      
      <!-- LEFT: Brand Panel -->
      <div class="hidden md:flex flex-col justify-between p-10 w-5/12 relative overflow-hidden" style="background: linear-gradient(145deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%);">
        <!-- Decorative pattern lines -->
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <div class="absolute top-0 left-0 w-full h-full" style="background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 50px);"></div>
        </div>

        <!-- Top: Logo -->
        <div class="relative z-10">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 class="text-3xl font-extrabold text-white leading-tight mb-3">
            Sistem<br/>e-Surat<br/><span class="text-red-300">DISKOMINFO</span>
          </h1>
          <p class="text-red-200 text-sm leading-relaxed">
            Pencatatan dan penomoran surat resmi secara digital, aman, dan terstruktur.
          </p>
        </div>

        <!-- Bottom: Copyright -->
        <div class="relative z-10">
          <p class="text-red-300/60 text-xs">© 2026 DISKOMINFO. All rights reserved.</p>
        </div>
      </div>

      <!-- RIGHT: Login Form Panel -->
      <div class="flex-1 bg-white dark:bg-gray-900 flex flex-col justify-center px-10 py-12">
        <!-- Mobile logo -->
        <div class="md:hidden flex items-center gap-2 mb-8">
          <div class="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-bold text-gray-900 dark:text-white text-lg">e-Surat DISKOMINFO</span>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Selamat Datang!</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Masuk untuk mengakses sistem persuratan.</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username -->
          <div>
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              placeholder="Masukkan username"
              class="input-modern"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="form-label">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Masukkan password"
                class="input-modern pr-10"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              </button>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="loading" class="btn-primary w-full py-3 text-base mt-2">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'Memproses...' : 'Masuk Sekarang' }}
          </button>
        </form>

        <!-- Demo credentials -->
        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p class="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">— Klik Akun Demo —</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button type="button" @click="fillCredentials('admin', 'admin')"
              class="text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-all cursor-pointer group">
              <p class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">Admin Utama</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">admin / admin</p>
            </button>
            <button type="button" @click="fillCredentials('aptika', 'aptika')"
              class="text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-all cursor-pointer group">
              <p class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">Bid. APTIKA</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">aptika / aptika</p>
            </button>
            <button type="button" @click="fillCredentials('persandian', 'persandian')"
              class="text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-all cursor-pointer group">
              <p class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">Bid. PERSANDIAN</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">persandian / persandian</p>
            </button>
            <button type="button" @click="fillCredentials('pde', 'pde')"
              class="text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-all cursor-pointer group">
              <p class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">Bid. PDE</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">pde / pde</p>
            </button>
            <button type="button" @click="fillCredentials('humas', 'humas')"
              class="text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-all cursor-pointer group">
              <p class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">Bid. HUMAS</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">humas / humas</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const fillCredentials = (user, pass) => {
  username.value = user
  password.value = pass
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Silakan isi username dan password'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const user = await authStore.login(username.value, password.value)
    if (user.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  } catch (err) {
    error.value = err.message || 'Username atau password salah'
  } finally {
    loading.value = false
  }
}
</script>
