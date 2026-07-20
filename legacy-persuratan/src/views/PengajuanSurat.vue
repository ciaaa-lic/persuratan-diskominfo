<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Ajukan Surat Baru</h1>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Isi formulir berikut untuk mengajukan penomoran surat resmi dengan lengkap dan akurat.</p>
    </div>

    <!-- Main Content Grid: Left Form + Right Information & Guidelines -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- Left Column: Form Pengajuan (2 cols span) -->
      <div class="lg:col-span-2 stat-card shadow-sm border border-gray-100 dark:border-gray-700/60">
        <div class="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
          <div class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <DocumentTextIcon class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Formulir Pengajuan Penomoran</h2>
            <p class="text-xs text-gray-400">Pastikan data surat dan klasifikasi sudah sesuai sebelum dikirim</p>
          </div>
        </div>

        <!-- Banner jika mode duplikat -->
        <div v-if="isDuplikat" class="mb-5 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-start gap-3">
          <SparklesIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-xs font-bold text-blue-900 dark:text-blue-300">Mode Duplikat Pengajuan Aktif</p>
            <p class="text-xs text-blue-700 dark:text-blue-400 mt-0.5">Formulir telah diisi otomatis berdasarkan data surat duplikat. Silakan sesuaikan Perihal / Berita Acara (BA) atau tanggal jika diperlukan sebelum menekan tombol simpan.</p>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="space-y-5">
          <!-- Two Column Row: Nama Pengirim + Tanggal Surat -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="pengirim" class="form-label">Nama Pengirim <span class="text-red-500">*</span></label>
              <input id="pengirim" v-model="form.pengirim" type="text" required placeholder="Masukkan nama lengkap pengirim" class="input-modern" />
            </div>

            <div>
              <label for="tanggal" class="form-label">Tanggal Surat <span class="text-red-500">*</span></label>
              <input id="tanggal" v-model="form.tanggalSurat" type="date" required class="input-modern" />
            </div>
          </div>

          <!-- Two Column Row: Klasifikasi + Bidang -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="klasifikasi" class="form-label">Klasifikasi Surat <span class="text-red-500">*</span></label>
              <select id="klasifikasi" v-model="form.klasifikasi" required class="input-modern">
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

            <div>
              <label for="bidang" class="form-label">Bidang <span class="text-red-500">*</span></label>
              <select
                id="bidang"
                v-model="form.bidang"
                :disabled="!!authStore.user?.bidang"
                required
                class="input-modern disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
              >
                <option value="APTIKA">APTIKA (Aplikasi Informatika)</option>
                <option value="PERSANDIAN">PERSANDIAN (Persandian & Keamanan Informasi)</option>
                <option value="PDE">PDE (Pengolahan Data Elektronik & Statistik)</option>
                <option value="HUMAS">HUMAS (Humas, Informatika & Komunikasi Publik)</option>
              </select>
              <p v-if="authStore.user?.bidang" class="text-[11px] text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1 font-medium">
                <CheckCircleIcon class="w-3.5 h-3.5 flex-shrink-0" /> Bidang dikunci otomatis sesuai akun Anda ({{ authStore.user.bidang }})
              </p>
            </div>
          </div>

          <!-- Jumlah Surat (Batch) -->
          <div class="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200/80 dark:border-gray-700">
            <label for="batchCount" class="form-label flex items-center justify-between">
              <span>Jumlah Nomor yang Diajukan Sekaligus <span class="text-xs font-normal text-gray-400">(Kolektif / Batch)</span></span>
              <span class="badge badge-waiting font-mono">{{ batchCount }} Nomor</span>
            </label>
            <div class="flex items-center gap-3 mt-1.5">
              <input id="batchCount" v-model.number="batchCount" type="range" min="1" max="10" class="w-full accent-red-600 dark:accent-red-500 cursor-pointer" />
              <input v-model.number="batchCount" type="number" min="1" max="10" class="w-16 input-modern text-center font-bold font-mono py-1.5" />
            </div>
            <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              Jika memilih &gt; 1, sistem otomatis mengajukan beberapa nomor surat serentak dengan penanda urutan <span class="font-mono font-semibold text-red-600 dark:text-red-400">(1/{{ batchCount }}), (2/{{ batchCount }}), dst.</span> pada keterangan Perihal / Berita Acara (BA).
            </p>
          </div>

          <!-- Perihal -->
          <div>
            <label for="perihal" class="form-label">Perihal / Berita Acara (BA) <span class="text-red-500">*</span></label>
            <textarea id="perihal" v-model="form.perihal" rows="3" required placeholder="Jelaskan Perihal / Berita Acara (BA) secara singkat, padat, dan jelas..." class="input-modern resize-none"></textarea>
          </div>

          <!-- Lampiran -->
          <div>
            <label for="lampiran" class="form-label">Lampiran <span class="text-xs font-normal text-gray-400">(Opsional)</span></label>
            <div class="relative mt-1">
              <input
                id="lampiran"
                type="file"
                @change="handleFileChange"
                class="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-3 file:py-2.5 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  dark:file:bg-red-900/20 dark:file:text-red-400
                  hover:file:bg-red-100 dark:hover:file:bg-red-900/30
                  border border-gray-200 dark:border-gray-600 rounded-xl p-2 bg-white dark:bg-gray-700
                  cursor-pointer transition-all"
              />
            </div>
            <p v-if="selectedFileName" class="mt-2 text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircleIcon class="w-4 h-4" />
              File terpilih: {{ selectedFileName }}
            </p>
            <p v-else class="mt-1.5 text-xs text-gray-400">Format yang didukung: PDF, DOCX. Ukuran maksimal 5MB.</p>
          </div>

          <!-- Status default notice -->
          <div class="flex items-start gap-3 p-3.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/80 dark:border-yellow-800/50 rounded-xl">
            <ClockIcon class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-yellow-800 dark:text-yellow-300">Proses Penomoran Surat</p>
              <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5 leading-relaxed">
                Setelah diajukan, surat akan berstatus <span class="font-bold">Menunggu Nomor Surat</span> hingga pihak administrator melakukan verifikasi dan menerbitkan nomor resmi.
              </p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" @click="router.back()" class="btn-secondary px-5">Batal</button>
            <button type="submit" :disabled="loading" class="btn-primary px-6 shadow-sm">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? 'Menyimpan Pengajuan...' : 'Simpan Pengajuan' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Right Column: Quick Guide & Information Card (1 col span) -->
      <div class="space-y-5">
        <!-- Panduan & Alur -->
        <div class="stat-card border-t-4 border-red-500 space-y-4 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <SparklesIcon class="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Alur Penomoran Surat</h3>
          </div>

          <div class="space-y-3 pt-1">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <p class="text-xs font-semibold text-gray-800 dark:text-gray-200">Isi Formulir Pengajuan</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Lengkapi identitas pengirim, bidang, dan perihal surat dengan benar.</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <p class="text-xs font-semibold text-gray-800 dark:text-gray-200">Verifikasi Admin</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Admin meninjau pengajuan dan menentukan kode klasifikasi dinas.</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <p class="text-xs font-semibold text-gray-800 dark:text-gray-200">Terbit Nomor Resmi</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Nomor surat otomatis digenerate secara berurutan sesuai stok nomor.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Klasifikasi -->
        <div class="stat-card space-y-3.5 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Klasifikasi Surat</h3>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <div>
                <p class="font-bold text-gray-800 dark:text-gray-200">Surat Biasa</p>
                <p class="text-gray-400 text-[11px]">Korespondensi umum & rutin</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Biasa</span>
            </div>

            <div class="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <div>
                <p class="font-bold text-gray-800 dark:text-gray-200">Surat Penting</p>
                <p class="text-gray-400 text-[11px]">Membutuhkan perhatian khusus</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Penting</span>
            </div>

            <div class="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <div>
                <p class="font-bold text-gray-800 dark:text-gray-200">Surat Rahasia</p>
                <p class="text-gray-400 text-[11px]">Terbatas & dokumen rahasia</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Rahasia</span>
            </div>
          </div>
        </div>

        <!-- Bantuan -->
        <div class="p-4 bg-gradient-to-br from-gray-900 to-red-950 text-white rounded-2xl shadow-sm space-y-2">
          <div class="flex items-center gap-2">
            <InformationCircleIcon class="w-5 h-5 text-red-400 flex-shrink-0" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-red-300">Bantuan & Informasi</h4>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">
            Apabila terdapat kendala saat pengajuan atau perubahan klasifikasi mendesak, silakan hubungi tim <span class="font-semibold text-white">Administrator Diskominfo</span> melalui portal bantuan internal.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSuratStore } from '../stores/suratStore'
import { useAuthStore } from '../stores/authStore'
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { notify, dialog } from '../utils/swal'

const router = useRouter()
const route = useRoute()
const suratStore = useSuratStore()
const authStore = useAuthStore()
const loading = ref(false)
const selectedFileName = ref('')
const batchCount = ref(1)
const isDuplikat = ref(false)

const form = reactive({
  pengirim: '',
  tanggalSurat: new Date().toISOString().split('T')[0],
  klasifikasi: 'Biasa',
  perihal: '',
  bidang: authStore.user?.bidang || 'APTIKA'
})

onMounted(() => {
  if (route.query.duplikat === 'true' || route.query.perihal) {
    isDuplikat.value = true
    if (route.query.pengirim) form.pengirim = route.query.pengirim
    if (route.query.klasifikasi) form.klasifikasi = route.query.klasifikasi
    if (route.query.bidang && !authStore.user?.bidang) form.bidang = route.query.bidang
    if (route.query.perihal) form.perihal = route.query.perihal
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  selectedFileName.value = file ? file.name : ''
}

const submitForm = async () => {
  loading.value = true
  try {
    if (batchCount.value > 1) {
      const batchList = []
      for (let i = 1; i <= batchCount.value; i++) {
        batchList.push({
          ...form,
          perihal: `${form.perihal} (${i}/${batchCount.value})`
        })
      }
      await suratStore.addSuratBatch(batchList)
      await dialog.success('Pengajuan Kolektif Berhasil!', `${batchCount.value} nomor surat telah berhasil diajukan serentak. Admin akan segera memproses penomoran.`)
    } else {
      await suratStore.addSurat({ ...form })
      await dialog.success('Pengajuan Berhasil!', 'Surat Anda telah tersimpan. Admin akan segera memproses penomoran.')
    }
    router.push('/user/dashboard')
  } catch (error) {
    notify.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan pengajuan surat.')
  } finally {
    loading.value = false
  }
}
</script>
