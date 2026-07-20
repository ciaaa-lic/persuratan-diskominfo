<template>
  <div class="flow-root">
    <div v-if="history.length === 0" class="text-center py-6 text-sm text-gray-400">Belum ada riwayat</div>
    <ul role="list" class="space-y-3">
      <li v-for="(event, idx) in history" :key="idx" class="flex items-start gap-3">
        <!-- Icon dot -->
        <div class="flex-shrink-0 flex flex-col items-center">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center" :class="getDotColor(event.status)">
            <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
            </svg>
          </div>
          <div v-if="idx < history.length - 1" class="w-0.5 h-4 bg-gray-200 dark:bg-gray-600 mt-1"></div>
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0 pb-1">
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ event.status }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {{ new Date(event.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  history: {
    type: Array,
    required: true
  }
})

const getDotColor = (status) => {
  const s = status.toLowerCase()
  if (s.includes('selesai') || s.includes('diterbitkan')) return 'bg-green-500'
  if (s.includes('pengajuan')) return 'bg-red-500'
  if (s.includes('verifikasi') || s.includes('diperbarui')) return 'bg-yellow-500'
  return 'bg-gray-400'
}
</script>
