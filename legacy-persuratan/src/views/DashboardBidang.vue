<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <p class="text-sm text-gray-400 dark:text-gray-500">Selamat datang, <span class="font-bold text-gray-700 dark:text-gray-200">{{ authStore.user?.name }}</span></p>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard Bidang</h1>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <button @click="calendarOpen = true" class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 transition-all shadow-sm cursor-pointer" title="Klik untuk lihat Kalender Bulanan DISKOMINFO">
          <CalendarDaysIcon class="w-4 h-4 text-red-500" />
          <span>{{ new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
        </button>
        <router-link to="/user/pengajuan" class="btn-primary gap-2 self-start sm:self-auto">
          <PlusCircleIcon class="w-4 h-4" />
          Ajukan Surat
        </router-link>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="stat-card primary">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-red-100 text-xs font-semibold uppercase tracking-wide">Total Pengajuan</p>
            <p class="text-3xl font-bold text-white mt-1">{{ mySuratList.length }}</p>
          </div>
          <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <DocumentDuplicateIcon class="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Menunggu Nomor</p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{{ mySuratList.filter(s => s.status === 'Menunggu').length }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
            <ClockIcon class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Sudah Dinomori</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{{ mySuratList.filter(s => s.status === 'Selesai').length }}</p>
          </div>
          <div class="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <CheckCircleIcon class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="stat-card p-0 overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">Riwayat Surat Saya</h3>
        <span class="text-xs text-gray-400">{{ mySuratList.length }} surat</span>
      </div>
      <DataTable
        :columns="tableColumns"
        :data="mySuratList"
        :loading="suratStore.loading"
        :itemsPerPage="8"
      >
        <template #cell-status="{ item }">
          <span
            class="badge cursor-pointer"
            :class="item.status === 'Selesai' ? 'badge-done' : 'badge-waiting'"
            @click="bukaTimeline(item)"
            title="Klik untuk lihat riwayat"
          >
            {{ item.status }}
          </span>
        </template>
        <template #cell-nomorSurat="{ item }">
          <div v-if="item.nomorSurat" class="flex items-center gap-2">
            <span class="text-xs font-mono font-semibold text-gray-700 dark:text-gray-200">{{ item.nomorSurat }}</span>
            <button
              @click.stop="copyNomor(item.nomorSurat)"
              class="p-1 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
              title="Salin Nomor Resmi"
            >
              <ClipboardIcon class="w-3.5 h-3.5" />
            </button>
          </div>
          <span v-else class="text-xs text-gray-400 italic">Belum ada</span>
        </template>
        <template #cell-actions="{ item }">
          <div class="flex items-center gap-1.5">
            <button
              @click.stop="bukaTimeline(item)"
              class="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
              title="Detail & Timeline"
            >
              <EyeIcon class="w-4 h-4" />
            </button>
            <button
              @click.stop="duplikatSurat(item)"
              class="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer"
              title="Duplikat & Ajukan Ulang"
            >
              <DocumentDuplicateIcon class="w-4 h-4" />
            </button>
            <button
              v-if="item.status === 'Menunggu' || item.status === 'Belum Selesai' || item.status === 'Belum Diproses'"
              @click.stop="editSurat(item)"
              class="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer"
              title="Edit Pengajuan"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button
              v-if="item.status === 'Menunggu' || item.status === 'Belum Selesai' || item.status === 'Belum Diproses'"
              @click.stop="batalkanSurat(item)"
              class="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
              title="Batalkan Pengajuan"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Modal Timeline -->
    <div v-if="timelineOpen" class="modal-backdrop" @click.self="timelineOpen = false">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Detail & Timeline</h3>
            <p class="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{{ selectedSurat?.perihal }}</p>
          </div>
          <button @click="timelineOpen = false" class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="modal-body">
          <!-- Nomor Surat -->
          <div v-if="selectedSurat?.nomorSurat" class="mb-5 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl">
            <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">Nomor Surat Resmi</p>
            <p class="text-sm font-bold text-gray-900 dark:text-white font-mono">{{ selectedSurat.nomorSurat }}</p>
          </div>
          <div v-else class="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-2xl">
            <p class="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Status: Menunggu Penomoran</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Tanggal Surat</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedSurat?.tanggalSurat }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
              <span class="badge" :class="selectedSurat?.status === 'Selesai' ? 'badge-done' : 'badge-waiting'">{{ selectedSurat?.status }}</span>
            </div>
          </div>

          <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Timeline Proses</h4>
          <Timeline :history="selectedSurat?.statusHistory || []" />
        </div>
        <div class="modal-footer flex flex-wrap items-center justify-end gap-2">
          <button @click="duplikatSurat(selectedSurat)" class="btn-secondary text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50 hover:bg-purple-50 flex items-center gap-1.5 cursor-pointer">
            <DocumentDuplicateIcon class="w-4 h-4" /> Duplikat
          </button>
          <button
            v-if="selectedSurat?.status === 'Menunggu' || selectedSurat?.status === 'Belum Selesai' || selectedSurat?.status === 'Belum Diproses'"
            @click="editSurat(selectedSurat)"
            class="btn-secondary text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 hover:bg-amber-50 flex items-center gap-1.5 cursor-pointer"
          >
            <PencilSquareIcon class="w-4 h-4" /> Edit
          </button>
          <button
            v-if="selectedSurat?.status === 'Menunggu' || selectedSurat?.status === 'Belum Selesai' || selectedSurat?.status === 'Belum Diproses'"
            @click="batalkanSurat(selectedSurat)"
            class="btn-secondary text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
          >
            <TrashIcon class="w-4 h-4" /> Batalkan
          </button>
          <button @click="timelineOpen = false" class="btn-secondary cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Pengajuan -->
    <div v-if="editModalOpen" class="modal-backdrop" @click.self="editModalOpen = false">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Edit Pengajuan Surat</h3>
            <p class="text-xs text-gray-400 mt-0.5">Perbarui data sebelum dinomori admin</p>
          </div>
          <button @click="editModalOpen = false" class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <form @submit.prevent="simpanEditSurat">
          <div class="modal-body space-y-4">
            <div>
              <label class="form-label">Nama Pengirim <span class="text-red-500">*</span></label>
              <input v-model="editForm.pengirim" type="text" required class="input-modern" />
            </div>
            <div>
              <label class="form-label">Tanggal Surat <span class="text-red-500">*</span></label>
              <input v-model="editForm.tanggalSurat" type="date" required class="input-modern" />
            </div>
            <div>
              <label class="form-label">Klasifikasi <span class="text-red-500">*</span></label>
              <select v-model="editForm.klasifikasi" required class="input-modern">
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
            <div>
              <label class="form-label">Perihal / Berita Acara (BA) <span class="text-red-500">*</span></label>
              <textarea v-model="editForm.perihal" rows="3" required class="input-modern resize-none"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="editModalOpen = false" class="btn-secondary cursor-pointer">Batal</button>
            <button type="submit" :disabled="suratStore.loading" class="btn-primary cursor-pointer">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Kalender Bulanan Modal -->
    <KalenderBulananModal v-if="calendarOpen" @close="calendarOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSuratStore } from '../stores/suratStore'
import { useAuthStore } from '../stores/authStore'
import DataTable from '../components/DataTable.vue'
import Timeline from '../components/Timeline.vue'
import KalenderBulananModal from '../components/KalenderBulananModal.vue'
import {
  DocumentDuplicateIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClipboardIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { notify, dialog } from '../utils/swal'

const router = useRouter()
const suratStore = useSuratStore()
const authStore = useAuthStore()

const timelineOpen = ref(false)
const calendarOpen = ref(false)
const editModalOpen = ref(false)
const selectedSurat = ref(null)
const editForm = ref({ id: null, pengirim: '', tanggalSurat: '', klasifikasi: 'Biasa', perihal: '', bidang: '' })

const tableColumns = [
  { key: 'tanggalSurat', label: 'Tanggal Surat' },
  { key: 'perihal', label: 'Perihal / Berita Acara (BA)' },
  { key: 'nomorSurat', label: 'Nomor Surat' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]

const mySuratList = computed(() => {
  if (authStore.user?.bidang) {
    return suratStore.suratList.filter(s => s.bidang === authStore.user.bidang)
  }
  return suratStore.suratList
})

onMounted(() => suratStore.fetchSurat())

const bukaTimeline = (item) => {
  selectedSurat.value = item
  timelineOpen.value = true
}

const copyNomor = async (nomor) => {
  if (!nomor) return
  try {
    await navigator.clipboard.writeText(nomor)
    notify.success('Berhasil Disalin!', '📋 Nomor resmi berhasil disalin ke clipboard.')
  } catch (e) {
    notify.error('Gagal Salin', 'Tidak dapat menyalin nomor ke clipboard.')
  }
}

const duplikatSurat = (item) => {
  timelineOpen.value = false
  router.push({
    path: '/user/pengajuan',
    query: {
      duplikat: 'true',
      pengirim: item.pengirim,
      klasifikasi: item.klasifikasi,
      bidang: item.bidang,
      perihal: item.perihal
    }
  })
}

const editSurat = (item) => {
  timelineOpen.value = false
  editForm.value = {
    id: item.id,
    pengirim: item.pengirim,
    tanggalSurat: item.tanggalSurat,
    klasifikasi: item.klasifikasi || 'Biasa',
    perihal: item.perihal,
    bidang: item.bidang
  }
  editModalOpen.value = true
}

const simpanEditSurat = async () => {
  try {
    await suratStore.updateSuratInfo(editForm.value.id, editForm.value)
    editModalOpen.value = false
    notify.success('Tersimpan!', 'Informasi pengajuan berhasil diperbarui.')
  } catch (err) {
    notify.error('Gagal Edit', 'Terjadi kesalahan saat menyimpan perubahan.')
  }
}

const batalkanSurat = async (item) => {
  timelineOpen.value = false
  const confirm = await dialog.confirm(
    'Batalkan Pengajuan?',
    `Apakah Anda yakin ingin membatalkan pengajuan "${item.perihal}"? Data yang dibatalkan tidak dapat dikembalikan.`,
    'Ya, Batalkan!'
  )
  if (confirm.isConfirmed) {
    try {
      await suratStore.deleteSurat(item.id)
      notify.success('Dibatalkan!', 'Pengajuan surat berhasil dibatalkan.')
    } catch (err) {
      notify.error('Gagal Batal', 'Terjadi kesalahan saat membatalkan pengajuan.')
    }
  }
}
</script>
