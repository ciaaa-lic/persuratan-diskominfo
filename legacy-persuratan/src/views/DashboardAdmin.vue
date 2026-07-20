<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <p class="text-sm text-gray-400 dark:text-gray-500">{{ greeting }}, <span class="font-bold text-gray-700 dark:text-gray-200">{{ authStore.user?.name }}</span></p>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>
      </div>
      <button @click="calendarOpen = true" class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 transition-all shadow-sm cursor-pointer" title="Klik untuk lihat Kalender Bulanan DISKOMINFO">
        <CalendarDaysIcon class="w-4 h-4 text-red-500" />
        <span>{{ new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
      </button>
    </div>

    <!-- Blok Nomor Hari Ini (SOP Banner Box) -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg border border-red-100 dark:border-red-900/30">
            <HashtagIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Blok Nomor Hari Ini</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Sistem Penomoran Surat Otomatis SOP Sekretariat DISKOMINFO</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Aktif & Tersinkronisasi
          </span>
        </div>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-400 uppercase block">Tanggal</span>
          <span class="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">{{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-400 uppercase block">Hari Kerja Ke</span>
          <span class="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 block">Ke-{{ dashboardStore.stats.workingDayIndex || dashboardStore.stats.stokSummary?.workingDayIndex || '...' }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-400 uppercase block">Nomor Dasar</span>
          <span class="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{{ dashboardStore.stats.numberRange || dashboardStore.stats.stokSummary?.numberRange || '...' }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-400 uppercase block">Kapasitas Suffix</span>
          <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">A - Z (40 / Suffix)</span>
        </div>
      </div>
    </div>

    <!-- Stats Cards (5 Requested Information Cards) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <!-- 1. Hari Kerja Ke Tahun Ini -->
      <div class="stat-card border-l-4 border-l-red-600">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Hari Kerja Ke Tahun Ini</p>
            <p class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              <span v-if="dashboardStore.loading" class="inline-block w-8 h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></span>
              <span v-else>{{ dashboardStore.stats.workingDayIndex || dashboardStore.stats.stokSummary?.workingDayIndex || '0' }}</span>
            </p>
          </div>
          <div class="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
            HK
          </div>
        </div>
      </div>

      <!-- 2. Blok Nomor Aktif Hari Ini -->
      <div class="stat-card border-l-4 border-l-blue-600">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Blok Nomor Aktif Hari Ini</p>
            <p class="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1.5 truncate">
              <span v-if="dashboardStore.loading" class="inline-block w-14 h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></span>
              <span v-else>{{ dashboardStore.stats.numberRange || dashboardStore.stats.stokSummary?.numberRange || '-' }}</span>
            </p>
          </div>
          <div class="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
            NO
          </div>
        </div>
      </div>

      <!-- 3. Total Pengajuan Hari Ini -->
      <div class="stat-card border-l-4 border-l-purple-600">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Total Pengajuan Hari Ini</p>
            <p class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              <span v-if="dashboardStore.loading" class="inline-block w-8 h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></span>
              <span v-else>{{ dashboardStore.stats.suratHariIni || '0' }}</span>
            </p>
          </div>
          <div class="w-9 h-9 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
            <CalendarDaysIcon class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- 4. Total Pengajuan Belum Diproses -->
      <div class="stat-card border-l-4 border-l-yellow-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Belum Diproses</p>
            <p class="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">
              <span v-if="dashboardStore.loading" class="inline-block w-8 h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></span>
              <span v-else>{{ dashboardStore.stats.menunggu || '0' }}</span>
            </p>
          </div>
          <div class="w-9 h-9 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold text-xs">
            <ClockIcon class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- 5. Total Pengajuan Selesai -->
      <div class="stat-card border-l-4 border-l-emerald-600">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Total Selesai</p>
            <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              <span v-if="dashboardStore.loading" class="inline-block w-8 h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></span>
              <span v-else>{{ dashboardStore.stats.selesai || '0' }}</span>
            </p>
          </div>
          <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircleIcon class="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Layout: Top Data Pengajuan, Bottom Monitoring & Riwayat -->
    <div class="flex flex-col gap-6 items-stretch">
      <!-- Bagian Atas: DATA PENGAJUAN (Full Width) -->
      <div class="w-full stat-card p-0 overflow-hidden shadow-sm flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Data Pengajuan Penomoran Surat</h3>
            <p class="text-xs text-gray-400 mt-0.5">Daftar surat yang menunggu verifikasi admin atau telah selesai digenerate</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 shadow-2xs">
            {{ suratStore.suratList.length }} Surat Total
          </span>
        </div>
        <DataTable
          :columns="tableColumns"
          :data="suratStore.suratList"
          :hasActions="true"
          :loading="suratStore.loading"
          :itemsPerPage="8"
        >
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
          <template #cell-status="{ item }">
            <span class="badge cursor-pointer"
                  :class="item.status === 'Selesai' ? 'badge-done' : 'badge-waiting'"
                  @click="bukaTimeline(item)" title="Klik untuk lihat history">
              {{ item.status }}
            </span>
          </template>
          <template #actions="{ item }">
            <div class="flex items-center justify-end gap-2">
              <button v-if="item.status === 'Menunggu'"
                      @click="bukaModalNomor(item)"
                      class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                      title="Generate Nomor Surat">
                Generate Nomor
              </button>
              <button v-else
                      @click="bukaTimeline(item)"
                      class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                      title="Lihat Detail Surat">
                Detail
              </button>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Bagian Bawah: MONITORING STOK + RIWAYAT AKTIVITAS (2 Kolom Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- Box 1 Kiri Bawah: MONITORING STOK -->
        <div class="stat-card border-l-4 border-red-500 shadow-sm h-full flex flex-col justify-between">
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-gray-100 dark:border-gray-700/60 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HashtagIcon class="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white">Monitoring Stok</h3>
                  <p class="text-xs text-gray-400">Referensi kuota penomoran</p>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 self-start sm:self-auto">
                1–40 (A–Z)
              </span>
            </div>

            <div class="space-y-3.5">
              <div v-for="g in quotaGroups" :key="g.label" class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ g.label }}</span>
                  <span class="text-xs font-extrabold px-2 py-0.5 rounded bg-white dark:bg-gray-800 shadow-2xs" :class="g.color">{{ g.used }}/{{ g.max }}</span>
                </div>
                <div class="progress-bar-track h-2">
                  <div class="progress-bar-fill h-2 rounded-full transition-all duration-500" :style="{ width: `${Math.min((g.used / g.max) * 100, 100)}%`, background: g.bg }"></div>
                </div>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/40">
            💡 <span class="font-medium text-gray-600 dark:text-gray-400">Otomatis:</span> Stok berurutan ke Grup A & B jika utama habis.
          </p>
        </div>

        <!-- Box 2 Kanan Bawah: RIWAYAT AKTIVITAS -->
        <div class="stat-card p-0 overflow-hidden shadow-sm flex flex-col h-full">
          <div class="flex items-center justify-between p-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Riwayat Aktivitas</h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Catatan log pengguna & sistem</p>
            </div>
            <span class="text-xs text-gray-400">{{ logStore.logs.length }} aktivitas</span>
          </div>
          <div class="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50" style="max-height: 380px;">
            <div v-for="log in logStore.logs" :key="log.id"
                 class="px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-xs font-bold text-red-600 dark:text-red-400">{{ log.user?.charAt(0) || 'A' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <p class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{{ log.user }}</p>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ new Date(log.timestamp).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{{ log.message }}</p>
                </div>
              </div>
            </div>
            <div v-if="logStore.logs.length === 0" class="px-4 py-8 text-center">
              <p class="text-sm text-gray-400">Belum ada aktivitas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- === MODAL DETAIL & TIMELINE === -->
    <div v-if="timelineOpen" class="modal-backdrop" @click.self="timelineOpen = false">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Detail Surat</h3>
            <p class="text-xs text-gray-400 mt-0.5">Informasi lengkap dan riwayat proses</p>
          </div>
          <button @click="timelineOpen = false" class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="modal-body">
          <!-- Nomor Surat highlight -->
          <div v-if="selectedSurat?.nomorSurat" class="mb-5 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl">
            <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">Nomor Surat Resmi</p>
            <p class="text-sm font-bold text-gray-900 dark:text-white font-mono">{{ selectedSurat.nomorSurat }}</p>
          </div>
          <div v-else class="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-2xl">
            <p class="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase">Nomor Surat</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Belum diterbitkan</p>
          </div>

          <!-- Detail fields -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Pengirim</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedSurat?.pengirim }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Bidang</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedSurat?.bidang }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 col-span-2">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Perihal</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedSurat?.perihal }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Tanggal Surat</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedSurat?.tanggalSurat }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
              <span class="badge" :class="selectedSurat?.status === 'Selesai' ? 'badge-done' : 'badge-waiting'">{{ selectedSurat?.status }}</span>
            </div>
          </div>

          <!-- Timeline -->
          <div>
            <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Timeline Proses</h4>
            <Timeline :history="selectedSurat?.statusHistory || []" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="timelineOpen = false" class="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>

    <!-- === MODAL GENERATE NOMOR === -->
    <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false">
      <div class="modal-box" style="max-width: 480px;">
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Generate Nomor Surat</h3>
            <p class="text-xs text-gray-400 mt-0.5">Pilih kode klasifikasi untuk menerbitkan nomor</p>
          </div>
          <button @click="modalOpen = false" :disabled="isGenerating" class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="modal-body">
          <!-- Surat Info -->
          <div class="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl space-y-2">
            <div class="flex gap-2">
              <span class="text-xs font-semibold text-gray-400 w-24 flex-shrink-0">Pengirim</span>
              <span class="text-xs font-bold text-gray-900 dark:text-white">{{ selectedSurat?.pengirim }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-xs font-semibold text-gray-400 w-24 flex-shrink-0">Perihal</span>
              <span class="text-xs text-gray-700 dark:text-gray-300">{{ selectedSurat?.perihal }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-xs font-semibold text-gray-400 w-24 flex-shrink-0">Bidang</span>
              <span class="text-xs text-gray-700 dark:text-gray-300">{{ selectedSurat?.bidang }}</span>
            </div>
          </div>

          <!-- Klasifikasi Picker -->
          <div class="mb-2">
            <label class="form-label">Kode Klasifikasi <span class="text-red-500">*</span></label>
            <div v-if="klasifikasiStore.loading" class="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div v-else-if="klasifikasiStore.error" class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <span class="text-sm text-red-600 dark:text-red-400">{{ klasifikasiStore.error }}</span>
              <button @click="klasifikasiStore.fetchKlasifikasi()" class="text-xs font-bold text-red-700 dark:text-red-300 hover:underline">Coba Lagi</button>
            </div>
            <SearchableSelect
              v-else
              v-model="selectedKlasifikasi"
              :options="klasifikasiStore.list"
              labelKey="deskripsi"
              valueKey="kode"
              placeholder="Cari kode klasifikasi..."
              :displayFormat="opt => `${opt.kode} — ${opt.deskripsi || opt.uraian}`"
            />
          </div>
          <p class="text-xs text-red-500 dark:text-red-400 mt-1">
            <span class="font-semibold">⚡ Otomatis:</span> Sistem akan merangkai nomor berurutan (1–40, lalu 1.A–40.A, dst.).
          </p>
        </div>
        <div class="modal-footer">
          <button @click="modalOpen = false" :disabled="isGenerating" class="btn-secondary">Batal</button>
          <button @click="generateNomor" :disabled="!selectedKlasifikasi || isGenerating" class="btn-primary">
            <svg v-if="isGenerating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isGenerating ? 'Memproses...' : 'Generate Nomor' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Kalender Bulanan Modal -->
    <KalenderBulananModal v-if="calendarOpen" @close="calendarOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuratStore } from '../stores/suratStore'
import { useLogStore } from '../stores/logStore'
import { useAuthStore } from '../stores/authStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { useKlasifikasiStore } from '../stores/klasifikasiStore'
import DataTable from '../components/DataTable.vue'
import Timeline from '../components/Timeline.vue'
import SearchableSelect from '../components/SearchableSelect.vue'
import KalenderBulananModal from '../components/KalenderBulananModal.vue'
import { notify } from '../utils/swal'
import {
  DocumentDuplicateIcon, CalendarDaysIcon, ClockIcon,
  CheckCircleIcon, HashtagIcon, XMarkIcon, ClipboardIcon
} from '@heroicons/vue/24/outline'

const suratStore = useSuratStore()
const logStore = useLogStore()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const klasifikasiStore = useKlasifikasiStore()

const modalOpen = ref(false)
const timelineOpen = ref(false)
const calendarOpen = ref(false)
const selectedSurat = ref(null)
const selectedKlasifikasi = ref(null)
const isGenerating = ref(false)

const tableColumns = [
  { key: 'pengirim', label: 'Pengirim' },
  { key: 'perihal', label: 'Perihal / Berita Acara (BA)' },
  { key: 'bidang', label: 'Bidang' },
  { key: 'tanggalSurat', label: 'Tgl Surat' },
  { key: 'tanggalPengajuan', label: 'Tgl Pengajuan' },
  { key: 'nomorSurat', label: 'Nomor Surat' },
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

const quota = computed(() => dashboardStore.quotaStatus)
const quotaGroups = computed(() => [
  { label: 'Nomor Utama (1–40)', used: quota.value.utama.used, max: quota.value.utama.max, color: 'text-red-600 dark:text-red-400', bg: '#dc2626' },
  { label: 'Grup A (1.A–40.A)', used: quota.value.A.used, max: quota.value.A.max, color: 'text-green-600 dark:text-green-400', bg: '#059669' },
  { label: 'Grup B (1.B–40.B)', used: quota.value.B.used, max: quota.value.B.max, color: 'text-yellow-600 dark:text-yellow-400', bg: '#d97706' },
])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Selamat Pagi'
  if (h < 15) return 'Selamat Siang'
  if (h < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

onMounted(async () => {
  await Promise.all([
    suratStore.fetchSurat(),
    dashboardStore.fetchStats(),
    klasifikasiStore.fetchKlasifikasi(),
    logStore.fetchLogs()
  ])
})

const bukaModalNomor = (item) => {
  selectedSurat.value = item
  selectedKlasifikasi.value = null
  modalOpen.value = true
}

const bukaTimeline = (item) => {
  selectedSurat.value = item
  timelineOpen.value = true
}

const generateNomor = async () => {
  if (!selectedKlasifikasi.value) return
  isGenerating.value = true
  try {
    await suratStore.terbitkanNomor(selectedSurat.value.id, selectedKlasifikasi.value, authStore.user)
    await dashboardStore.fetchStats()
    modalOpen.value = false
    notify.success('Berhasil', 'Nomor surat berhasil digenerate')
  } catch (err) {
    notify.error('Gagal', err.message)
  } finally {
    isGenerating.value = false
  }
}
</script>
