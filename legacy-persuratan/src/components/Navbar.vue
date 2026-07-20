<template>
  <div class="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-20">
    <div class="flex items-center">
      <!-- Mobile menu button -->
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white mr-4">
        <Bars3Icon class="h-6 w-6" v-if="!mobileMenuOpen" />
        <XMarkIcon class="h-6 w-6" v-else />
      </button>
      <h1 class="md:hidden text-lg font-bold text-blue-600 dark:text-blue-400">e-Surat</h1>

      <!-- Global Search Bar -->
      <div class="hidden md:flex relative ml-4">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Cari surat, pengirim..." 
          class="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
        />
      </div>
    </div>
    
    <div class="flex items-center space-x-4">
      <!-- Search Mobile Toggle -->
      <button class="md:hidden text-gray-500 dark:text-gray-300">
        <MagnifyingGlassIcon class="h-6 w-6" />
      </button>

      <!-- Dark Mode Toggle -->
      <button @click="toggleDark" title="Ganti Tema" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
        <SunIcon class="h-6 w-6" v-if="isDark" />
        <MoonIcon class="h-6 w-6" v-else />
      </button>

      <!-- Notification Bell -->
      <div class="relative">
        <button @click="notifOpen = !notifOpen" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white relative">
          <BellIcon class="h-6 w-6" />
          <span v-if="unreadCount > 0" class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-gray-800"></span>
        </button>

        <div v-if="notifOpen" class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Notifikasi</h3>
            <button @click="markAsRead" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">Tandai dibaca</button>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div v-for="notif in notifications" :key="notif.id" class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700" :class="{'bg-blue-50 dark:bg-blue-900/20': !notif.read}">
              <p class="text-sm text-gray-800 dark:text-gray-200">{{ notif.message }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ new Date(notif.timestamp).toLocaleTimeString() }}</p>
            </div>
            <div v-if="notifications.length === 0" class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Tidak ada notifikasi
            </div>
          </div>
        </div>
      </div>
      
      <!-- Logout Button (Desktop 1-click) -->
      <button @click="handleLogout" title="Keluar" class="hidden md:flex text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
        <ArrowRightOnRectangleIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
  
  <!-- Mobile menu -->
  <div v-if="mobileMenuOpen" class="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <nav class="px-2 pt-2 pb-3 space-y-1">
      <!-- Search Input Mobile -->
      <div class="px-3 py-2">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Cari surat..." 
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" 
        />
      </div>
      <router-link 
        v-for="item in navigation" 
        :key="item.name" 
        :to="item.href"
        class="block px-3 py-2 rounded-md text-base font-medium"
        :class="[$route.path === item.href ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700']"
        @click="mobileMenuOpen = false"
      >
        {{ item.name }}
      </router-link>
      <button @click="handleLogout" class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700">
        Logout
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, BellIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useSuratStore } from '../stores/suratStore'
import { useNotifStore } from '../stores/notifStore'
import { useAuthStore } from '../stores/authStore'

defineProps({
  navigation: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['logout'])

// State & Stores
const mobileMenuOpen = ref(false)
const notifOpen = ref(false)
const searchQuery = ref('')
const suratStore = useSuratStore()
const notifStore = useNotifStore()
const authStore = useAuthStore()

// Dark Mode
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Search
const handleSearch = () => {
  suratStore.setSearchQuery(searchQuery.value)
}

// Notifications
const notifications = computed(() => notifStore.getForRole(authStore.user?.role))
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const markAsRead = () => {
  notifStore.markAllAsRead()
}

const handleLogout = () => {
  mobileMenuOpen.value = false
  emit('logout')
}
</script>
