<template>
  <div class="relative" ref="dropdownRef">
    <div
      class="flex items-center justify-between border rounded-xl bg-white dark:bg-gray-700 overflow-hidden cursor-pointer transition-all"
      :class="isOpen ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'"
      @click="toggleDropdown"
    >
      <input
        type="text"
        v-model="search"
        :placeholder="selectedItem ? '' : placeholder"
        class="flex-1 py-2.5 px-3 bg-transparent text-sm text-gray-900 dark:text-white border-none focus:ring-0 focus:outline-none placeholder-gray-400"
        @click.stop="isOpen = true"
        @focus="isOpen = true"
        @keydown.down.prevent="navigate('down')"
        @keydown.up.prevent="navigate('up')"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc="isOpen = false"
      />
      <!-- Selected display overlay -->
      <div v-if="selectedItem && !search" class="absolute left-3 right-10 pointer-events-none text-sm text-gray-900 dark:text-white truncate">
        {{ getDisplayValue(selectedItem) }}
      </div>

      <div class="flex items-center px-3 gap-1">
        <button v-if="selectedItem || search" @click.stop="clearSelection" type="button" class="text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <svg class="w-4 h-4 text-gray-400 transition-transform" :class="isOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1.5 w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      style="max-height: 220px; overflow-y: auto;"
    >
      <ul role="listbox" class="py-1">
        <li
          v-for="(item, index) in filteredOptions"
          :key="index"
          @click.stop="selectItem(item)"
          @mouseenter="highlightedIndex = index"
          class="px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center justify-between"
          :class="[
            highlightedIndex === index ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
            selectedItem && item[valueKey] === selectedItem[valueKey] ? 'font-semibold' : 'font-normal'
          ]"
        >
          <span class="truncate">{{ getDisplayValue(item) }}</span>
          <svg v-if="selectedItem && item[valueKey] === selectedItem[valueKey]" class="w-4 h-4 text-red-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </li>
        <li v-if="filteredOptions.length === 0" class="px-4 py-5 text-sm text-gray-400 text-center">
          Tidak ada hasil untuk "{{ search }}"
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: null },
  options: { type: Array, required: true },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  placeholder: { type: String, default: 'Pilih opsi...' },
  displayFormat: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'change'])

const search = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const dropdownRef = ref(null)

const selectedItem = computed(() => props.options.find(opt => opt[props.valueKey] === props.modelValue) || null)

const getDisplayValue = (item) => {
  if (!item) return ''
  if (props.displayFormat) return props.displayFormat(item)
  return item[props.labelKey] || item.deskripsi || item.uraian || ''
}

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const q = search.value.toLowerCase()
  return props.options.filter(opt => {
    const code = opt[props.valueKey] ? String(opt[props.valueKey]).toLowerCase() : ''
    const descVal = opt[props.labelKey] || opt.deskripsi || opt.uraian || ''
    const desc = String(descVal).toLowerCase()
    
    // Pencarian berdasarkan potongan kode ATAU kata kunci dalam uraian
    return code.includes(q) || desc.includes(q)
  })
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) { search.value = ''; highlightedIndex.value = -1 }
}

const selectItem = (item) => {
  emit('update:modelValue', item[props.valueKey])
  emit('change', item)
  search.value = ''
  isOpen.value = false
}

const clearSelection = () => {
  emit('update:modelValue', null)
  emit('change', null)
  search.value = ''
  isOpen.value = false
}

const selectHighlighted = () => {
  if (isOpen.value && highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectItem(filteredOptions.value[highlightedIndex.value])
  } else {
    isOpen.value = true
  }
}

const navigate = (direction) => {
  if (!isOpen.value) { isOpen.value = true; return }
  const max = filteredOptions.value.length - 1
  if (direction === 'down') highlightedIndex.value = highlightedIndex.value < max ? highlightedIndex.value + 1 : 0
  else highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : max
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
    search.value = ''
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
