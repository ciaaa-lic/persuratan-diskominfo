<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden flex flex-col font-sans">
      
      <!-- Header Modal (Clean Government Style: Red Theme) -->
      <div class="px-6 py-4 bg-gradient-to-r from-red-900 to-red-950 text-white flex items-center justify-between flex-shrink-0 border-b border-red-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <CalendarDaysIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold tracking-tight text-white">Kalender Kerja & Penomoran Harian SOP</h3>
            <p class="text-[11px] text-red-200/80 font-medium mt-0.5">Sekretariat DISKOMINFO • Blok Nomor 1 - 40 / Hari Kerja</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg bg-red-800/60 hover:bg-red-800 flex items-center justify-center text-red-100 transition-colors cursor-pointer">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Navigasi Bulan & Tahun -->
      <div class="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
            {{ currentMonthName }} {{ currentYear }}
          </h4>
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
            SOP Kuota: 40 Nomor/Hari
          </span>
        </div>
        <div class="flex items-center gap-1.5">
          <button @click="prevMonth" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs cursor-pointer">
            <ChevronLeftIcon class="w-3.5 h-3.5" />
            Sebelumnya
          </button>
          <button @click="resetToToday" class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer">
            Hari Ini
          </button>
          <button @click="nextMonth" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs cursor-pointer">
            Berikutnya
            <ChevronRightIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Grid Hari dalam Seminggu -->
      <div class="p-6 pt-4 flex-1 overflow-y-auto">
        <div class="grid grid-cols-7 gap-2 mb-2 text-center">
          <div v-for="(day, idx) in daysOfWeek" :key="day" 
               :class="['text-[11px] font-bold py-1.5 rounded-lg border', idx >= 5 ? 'text-rose-600 bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700']">
            {{ day }}
          </div>
        </div>

        <!-- Grid Tanggal -->
        <div class="grid grid-cols-7 gap-2 text-center">
          <!-- Slot kosong sebelum tanggal 1 -->
          <div v-for="empty in firstDayOffset" :key="'empty-' + empty" class="h-16 rounded-xl bg-slate-50/40 dark:bg-slate-800/20 border border-transparent"></div>

          <!-- Hari dalam bulan -->
          <div v-for="dateObj in calendarDays" :key="dateObj.dateString"
               @click="selectedDate = dateObj"
               :class="[
                 'h-16 p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none relative group',
                 dateObj.isToday ? 'ring-2 ring-red-600 bg-red-50/80 dark:bg-red-900/30 border-red-500 font-bold shadow-sm' : '',
                 !dateObj.isToday && selectedDate?.dateString === dateObj.dateString ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-500 shadow-2xs' : '',
                 !dateObj.isToday && dateObj.isWeekend ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500' : '',
                 !dateObj.isToday && !dateObj.isWeekend && dateObj.isHoliday ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300' : '',
                 !dateObj.isToday && !dateObj.isWeekend && !dateObj.isHoliday ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-600 text-slate-800 dark:text-slate-200 shadow-2xs' : ''
               ]">
            <!-- Nomor Tanggal & Indikator Titik -->
            <div class="flex items-center justify-between w-full">
              <span :class="['text-sm w-6 h-6 rounded-md flex items-center justify-center font-bold', dateObj.isToday ? 'bg-red-600 text-white' : '']">
                {{ dateObj.dayNum }}
              </span>
              <span v-if="dateObj.isHoliday" class="w-2 h-2 rounded-full bg-amber-500" title="Hari Libur Nasional"></span>
              <span v-else-if="dateObj.isWeekend" class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" title="Akhir Pekan"></span>
              <span v-else class="w-2 h-2 rounded-full bg-emerald-500" title="Hari Kerja SOP (Aktif)"></span>
            </div>

            <!-- Mini Label (Clean) -->
            <div class="text-[10px] leading-tight truncate px-0.5 text-left font-medium">
              <span v-if="dateObj.isToday" class="text-red-700 dark:text-red-400 font-bold block">Hari Ini</span>
              <span v-else-if="dateObj.isHoliday" class="text-amber-700 dark:text-amber-400 truncate block">{{ dateObj.holidayName }}</span>
              <span v-else-if="dateObj.isWeekend" class="text-slate-400 dark:text-slate-500 block">Libur</span>
              <span v-else class="text-emerald-700 dark:text-emerald-400 font-semibold block">Hari Kerja</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Keterangan Warna / Legenda & Detail Hari -->
      <div class="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-2xs', selectedDate?.isHoliday ? 'bg-amber-600' : (selectedDate?.isWeekend ? 'bg-slate-400' : 'bg-red-600')]">
            {{ selectedDate?.dayNum || '13' }}
          </div>
          <div>
            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {{ selectedDateFormatted }}
            </h5>
            <p class="text-[11px] font-medium mt-0.5" :class="selectedDate?.isHoliday ? 'text-amber-700 dark:text-amber-300' : (selectedDate?.isWeekend ? 'text-slate-500' : 'text-emerald-700 dark:text-emerald-400')">
              <span v-if="selectedDate?.isHoliday">🌴 Libur Nasional: {{ selectedDate?.holidayName }}</span>
              <span v-else-if="selectedDate?.isWeekend">🏖️ Libur Akhir Pekan (Sabtu/Minggu)</span>
              <span v-else>Hari Kerja SOP • Kuota 40 Nomor Surat (1 - 40 • Suffix A-Z)</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>Hari Kerja</span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>Libur Nasional</span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>Akhir Pekan</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CalendarDaysIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['close'])

const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())

const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Daftar Libur Nasional Indonesia & Cuti Bersama 2026
const holidays2026 = {
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Mikraj Nabi Muhammad SAW',
  '2026-02-16': 'Cuti Bersama Tahun Baru Imlek',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-18': 'Cuti Bersama Hari Suci Nyepi',
  '2026-03-19': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
  '2026-03-20': 'Cuti Bersama Idul Fitri 1447 H',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 Hijriah',
  '2026-03-22': 'Hari Raya Idul Fitri 1447 Hijriah',
  '2026-03-23': 'Cuti Bersama Idul Fitri 1447 H',
  '2026-03-24': 'Cuti Bersama Idul Fitri 1447 H',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-04-05': 'Kebangkitan Yesus Kristus (Paskah)',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-15': 'Cuti Bersama Kenaikan Yesus Kristus',
  '2026-05-27': 'Idul Adha 1447 Hijriah',
  '2026-05-28': 'Cuti Bersama Idul Adha 1447 H',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': '1 Muharram Tahun Baru Islam 1448 Hijriah',
  '2026-08-17': 'Proklamasi Kemerdekaan Republik Indonesia ke-81',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-24': 'Cuti Bersama Hari Raya Natal',
  '2026-12-25': 'Hari Raya Natal'
}

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const currentMonthName = computed(() => monthsList[currentMonth.value])

const firstDayOffset = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
})

const calendarDays = computed(() => {
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  const todayStr = now.toISOString().split('T')[0]

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear.value, currentMonth.value, d)
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dayPad = String(d).padStart(2, '0')
    const dateString = `${y}-${m}-${dayPad}`

    const dayOfWeek = dateObj.getDay()
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6)
    const isHoliday = !!holidays2026[dateString]
    const isToday = (dateString === todayStr)

    days.push({
      dayNum: d,
      dateString,
      dayOfWeek,
      isWeekend,
      isHoliday,
      holidayName: holidays2026[dateString] || '',
      isToday
    })
  }
  return days
})

const selectedDate = ref(calendarDays.value.find(d => d.isToday) || calendarDays.value[0])

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return ''
  const [y, m, d] = selectedDate.value.dateString.split('-')
  const dateObj = new Date(y, parseInt(m) - 1, d)
  return dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const resetToToday = () => {
  currentMonth.value = now.getMonth()
  currentYear.value = now.getFullYear()
  selectedDate.value = calendarDays.value.find(d => d.isToday) || calendarDays.value[0]
}
</script>
