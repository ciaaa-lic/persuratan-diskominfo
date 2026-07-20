<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Arsip per Bidang</h1>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Pengelompokan arsip surat berdasarkan bidang kerja</p>
    </div>

    <!-- Bidang counts summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <button
        v-for="b in daftarBidang"
        :key="b"
        @click="activeBidang = b"
        :class="[
          'stat-card cursor-pointer text-left transition-all border-2',
          activeBidang === b
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
        ]"
      >
        <p class="text-xs font-semibold uppercase tracking-wide mb-1"
           :class="activeBidang === b ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
          {{ b }}
        </p>
        <p class="text-2xl font-bold"
           :class="activeBidang === b ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'">
          {{ suratStore.suratList.filter(s => s.bidang === b).length }}
        </p>
        <p class="text-xs mt-1" :class="activeBidang === b ? 'text-red-500 dark:text-red-400' : 'text-gray-400'">surat</p>
      </button>
    </div>

    <!-- Table -->
    <div class="stat-card p-0 overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">Surat Bidang: <span class="text-red-600 dark:text-red-400">{{ activeBidang }}</span></h3>
        <span class="text-xs text-gray-400">{{ filteredData.length }} surat</span>
      </div>
      <DataTable
        :columns="tableColumns"
        :data="filteredData"
        :loading="suratStore.loading"
        :itemsPerPage="8"
      >
        <template #cell-status="{ item }">
          <span class="badge" :class="item.status === 'Selesai' ? 'badge-done' : 'badge-waiting'">
            {{ item.status }}
          </span>
        </template>
        <template #cell-tanggalSurat="{ item }">
          <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ item.tanggalSurat ? new Date(item.tanggalSurat).toLocaleDateString('id-ID') : '—' }}</span>
        </template>
        <template #cell-tanggalPengajuan="{ item }">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.tanggalPengajuan ? new Date(item.tanggalPengajuan).toLocaleDateString('id-ID') : '—' }}</span>
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
          <span v-else class="text-xs text-gray-400 italic">—</span>
        </template>
        <template #cell-actions="{ item }">
          <div class="flex items-center gap-1.5">
            <button
              @click.stop="duplikatSurat(item)"
              class="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer"
              title="Duplikat & Ajukan Ulang"
            >
              <DocumentDuplicateIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSuratStore } from '../stores/suratStore'
import DataTable from '../components/DataTable.vue'
import { ClipboardIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'
import { notify } from '../utils/swal'

const router = useRouter()
const suratStore = useSuratStore()
const daftarBidang = ['APTIKA', 'PERSANDIAN', 'PDE', 'HUMAS']
const activeBidang = ref('APTIKA')

const tableColumns = [
  { key: 'nomorSurat', label: 'Nomor Surat' },
  { key: 'pengirim', label: 'Pengirim' },
  { key: 'perihal', label: 'Perihal / Berita Acara (BA)' },
  { key: 'klasifikasi', label: 'Klasifikasi' },
  { key: 'tanggalSurat', label: 'Tgl Surat' },
  { key: 'tanggalPengajuan', label: 'Tgl Pengajuan' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]

const filteredData = computed(() =>
  suratStore.suratList.filter(s => s.bidang === activeBidang.value)
)

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

onMounted(() => suratStore.fetchSurat())
</script>
