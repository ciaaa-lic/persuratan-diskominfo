<template>
  <div class="flex flex-col h-full w-full">
    <div class="overflow-x-auto flex-1">
      <table class="table-modern">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="hasActions" class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton loading -->
          <template v-if="loading">
            <tr v-for="i in itemsPerPage" :key="'sk-' + i">
              <td v-for="col in columns" :key="'sk-col-' + col.key">
                <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
              </td>
              <td v-if="hasActions" class="text-right">
                <div class="h-7 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse w-20 ml-auto"></div>
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else>
            <tr v-for="item in paginatedData" :key="item.id">
              <td v-for="col in columns" :key="col.key">
                <slot :name="`cell-${col.key}`" :item="item">
                  {{ item[col.key] ?? '—' }}
                </slot>
              </td>
              <td v-if="hasActions" class="text-right">
                <slot name="actions" :item="item" />
              </td>
            </tr>
            <tr v-if="data.length === 0">
              <td :colspan="columns.length + (hasActions ? 1 : 0)" class="py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Tidak ada data</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      <p class="text-xs text-gray-400 dark:text-gray-500">
        Menampilkan <span class="font-semibold text-gray-700 dark:text-gray-300">{{ startIndex + 1 }}–{{ endIndex }}</span> dari <span class="font-semibold text-gray-700 dark:text-gray-300">{{ data.length }}</span>
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >‹</button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
            currentPage === page
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >{{ page }}</button>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  hasActions: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 5 },
  loading: { type: Boolean, default: false }
})

const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(props.data.length / props.itemsPerPage)))
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, props.data.length))
const paginatedData = computed(() => props.data.slice(startIndex.value, endIndex.value))

// Show at most 5 page numbers
const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const start = Math.max(1, Math.min(cur - 2, total - 4))
  return Array.from({ length: Math.min(5, total) }, (_, i) => start + i)
})

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>
