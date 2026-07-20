<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Rekap Surat</h1>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Lihat, filter, dan ekspor seluruh data surat</p>
      </div>
      <button @click="handleExport" class="btn-primary self-start gap-2">
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export Excel
      </button>
    </div>

    <!-- Charts Section: Surat per Bulan & Per Klasifikasi (Di atas filter) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <!-- Bar Chart -->
      <div class="stat-card shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">Surat per Bulan</h3>
          <span class="text-xs text-gray-400">Statistik Tahunan</span>
        </div>
        <div class="h-44">
          <BarChart :chartData="barData" />
        </div>
      </div>

      <!-- Pie Chart -->
      <div class="stat-card shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">Per Klasifikasi</h3>
          <span class="text-xs text-gray-400">Proporsi Surat</span>
        </div>
        <div class="h-44 flex justify-center">
          <PieChart :chartData="pieData" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="stat-card mb-5">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-36">
          <label for="filterTanggal" class="form-label">Filter Tanggal</label>
          <input type="date" id="filterTanggal" v-model="filterTanggal" class="input-modern" />
        </div>
        <div class="flex-1 min-w-36">
          <label for="filterBidang" class="form-label">Filter Bidang</label>
          <select id="filterBidang" v-model="filterBidang" class="input-modern">
            <option value="">Semua Bidang</option>
            <option value="APTIKA">APTIKA</option>
            <option value="PERSANDIAN">PERSANDIAN</option>
            <option value="PDE">PDE</option>
            <option value="HUMAS">HUMAS</option>
          </select>
        </div>
        <div class="flex-1 min-w-36">
          <label for="filterStatus" class="form-label">Filter Status</label>
          <select id="filterStatus" v-model="filterStatus" class="input-modern">
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button @click="applyFilters" class="btn-primary px-4">Filter</button>
          <button @click="resetFilters" class="btn-secondary px-4">Reset</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="stat-card p-0 overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">Data Surat</h3>
        <span class="text-xs text-gray-400">{{ suratStore.suratList.length }} total</span>
      </div>
      <DataTable
        :columns="tableColumns"
        :data="suratStore.suratList"
        :loading="suratStore.loading"
        :itemsPerPage="10"
      >
        <template #cell-tanggalSurat="{ item }">
          <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ item.tanggalSurat ? new Date(item.tanggalSurat).toLocaleDateString('id-ID') : '—' }}</span>
        </template>
        <template #cell-tanggalPengajuan="{ item }">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.tanggalPengajuan ? new Date(item.tanggalPengajuan).toLocaleDateString('id-ID') : '—' }}</span>
        </template>
        <template #cell-status="{ item }">
          <span class="badge" :class="item.status === 'Selesai' ? 'badge-done' : 'badge-waiting'">
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
          <span v-else class="text-xs text-gray-400 italic">—</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuratStore } from '../stores/suratStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { suratService } from '../services/surat'
import DataTable from '../components/DataTable.vue'
import BarChart from '../components/charts/BarChart.vue'
import PieChart from '../components/charts/PieChart.vue'
import { ArrowDownTrayIcon, ClipboardIcon } from '@heroicons/vue/24/outline'
import { notify } from '../utils/swal'

const suratStore = useSuratStore()
const dashboardStore = useDashboardStore()

const filterTanggal = ref('')
const filterBidang = ref('')
const filterStatus = ref('')

const tableColumns = [
  { key: 'nomorSurat', label: 'Nomor Surat' },
  { key: 'tanggalSurat', label: 'Tgl Surat' },
  { key: 'tanggalPengajuan', label: 'Tgl Pengajuan' },
  { key: 'pengirim', label: 'Pengirim' },
  { key: 'perihal', label: 'Perihal / Berita Acara (BA)' },
  { key: 'bidang', label: 'Bidang' },
  { key: 'klasifikasi', label: 'Klasifikasi' },
  { key: 'status', label: 'Status' }
]

const copyNomor = async (nomor) => {
  if (!nomor) return
  try {
    await navigator.clipboard.writeText(nomor)
    notify.success('Berhasil Disalin!', '📋 Nomor resmi berhasil disalin ke clipboard.')
  } catch (e) {
    notify.error('Gagal Salin', 'Tidak dapat menyalin nomor ke clipboard.')
  }
}

onMounted(async () => {
  await Promise.all([
    loadData(),
    dashboardStore.fetchStats()
  ])
})

const loadData = (filters = {}) => suratStore.fetchSurat(filters)

const applyFilters = () => {
  const filters = {}
  if (filterTanggal.value) filters.tanggal = filterTanggal.value
  if (filterBidang.value) filters.bidang = filterBidang.value
  loadData(filters)
}

const resetFilters = () => {
  filterTanggal.value = ''
  filterBidang.value = ''
  filterStatus.value = ''
  loadData()
}

const handleExport = () => suratService.exportExcel(suratStore.suratList)

// Chart data
const barData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
  datasets: [{
    label: 'Total Surat',
    backgroundColor: 'rgba(220,38,38,0.8)',
    borderRadius: 6,
    data: [12, 19, 15, 25, 22, 30, dashboardStore.stats.totalSurat || suratStore.suratList.length || 2]
  }]
}))

const pieData = computed(() => {
  const map = { 'Biasa': 0, 'Penting': 0, 'Rahasia': 0 }
  suratStore.suratList.forEach(s => { if (map[s.klasifikasi] !== undefined) map[s.klasifikasi]++ })
  return {
    labels: ['Biasa', 'Penting', 'Rahasia'],
    datasets: [{ backgroundColor: ['#dc2626', '#eab308', '#1d4ed8'], data: [map['Biasa'] || 1, map['Penting'] || 1, map['Rahasia'] || 1] }]
  }
})
</script>
