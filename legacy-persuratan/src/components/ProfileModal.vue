<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-box max-w-md">
      <!-- Header -->
      <div class="modal-header">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <UserCircleIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Pengaturan Profil</h3>
            <p class="text-xs text-gray-400 mt-0.5">Kelola informasi akun dan kata sandi Anda</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Body / Form -->
      <form @submit.prevent="handleSave" class="modal-body space-y-4 py-4">
        <!-- Username (Read-Only) -->
        <div>
          <label class="form-label text-xs">Username Akun</label>
          <div class="relative">
            <input
              type="text"
              :value="authStore.user?.username"
              disabled
              class="input-modern bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono text-xs"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
              {{ authStore.user?.role }}
            </span>
          </div>
        </div>

        <!-- Bidang (Read-Only if present) -->
        <div v-if="authStore.user?.bidang">
          <label class="form-label text-xs">Bidang Kerja</label>
          <input
            type="text"
            :value="authStore.user?.bidang"
            disabled
            class="input-modern bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed font-bold text-xs"
          />
        </div>

        <!-- Nama Lengkap / Bidang -->
        <div>
          <label for="name" class="form-label text-xs">Nama Lengkap / Identitas Bidang <span class="text-red-500">*</span></label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            placeholder="Masukkan nama lengkap / bidang"
            class="input-modern text-sm"
          />
        </div>

        <!-- Password Baru -->
        <div>
          <label for="new-password" class="form-label text-xs">Kata Sandi Baru <span class="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span></label>
          <div class="relative">
            <input
              id="new-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan kata sandi baru..."
              class="input-modern text-sm pr-10"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
              <EyeIcon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Error / Success Alert -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>
      </form>

      <!-- Footer -->
      <div class="modal-footer flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button type="button" @click="$emit('close')" :disabled="loading" class="btn-secondary text-xs px-4 py-2">
          Batal
        </button>
        <button type="button" @click="handleSave" :disabled="loading" class="btn-primary text-xs px-5 py-2 flex items-center gap-2">
          <svg v-if="loading" class="animate-spin -ml-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { notify } from '../utils/swal'
import {
  UserCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const name = ref(authStore.user?.name || '')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleSave = async () => {
  if (!name.value.trim()) {
    errorMessage.value = 'Nama tidak boleh kosong!'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const payload = { name: name.value.trim() }
    if (password.value) {
      payload.password = password.value
    }
    await authStore.updateProfile(payload)
    notify.success('Profil Diperbarui', 'Informasi akun Anda berhasil disimpan.')
    emit('close')
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memperbarui profil'
  } finally {
    loading.value = false
  }
}
</script>
