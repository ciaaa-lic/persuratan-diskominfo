<template>
  <div class="min-h-screen p-4 md:p-6 flex items-center justify-center">
    <div class="app-window w-full max-w-[1600px] h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex overflow-hidden">
      
      <!-- Slim Sidebar -->
      <nav class="sidebar-nav flex flex-col items-center py-5 gap-1">
        <div class="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <router-link v-for="item in navigation" :key="item.name" :to="item.href" custom v-slot="{ isActive, navigate }">
          <button @click="navigate" :class="['nav-item', isActive ? 'active' : '']" :title="item.name">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="tooltip">{{ item.name }}</span>
          </button>
        </router-link>

        <div class="flex-1"></div>

        <button @click="toggleDark()" class="nav-item mb-1" title="Ganti Tema">
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
          <span class="tooltip">{{ isDark ? 'Mode Terang' : 'Mode Gelap' }}</span>
        </button>

        <button @click="handleLogout" class="nav-item" style="color: #ef4444;">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          <span class="tooltip">Keluar</span>
        </button>
      </nav>

      <!-- Main content wrapper -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Topbar -->
        <div class="topbar flex-shrink-0">
          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white leading-none">{{ currentPageTitle }}</h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sistem e-Surat DISKOMINFO</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative hidden md:block">
              <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Cari surat..." class="w-56 pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all" />
            </div>

            <div class="relative">
              <button @click="notifOpen = !notifOpen" class="relative w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all">
                <BellIcon class="w-5 h-5" />
                <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white dark:ring-gray-700"></span>
              </button>
              <div v-if="notifOpen" class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-sm font-bold text-gray-900 dark:text-white">Notifikasi</span>
                  <button @click="notifStore.markAllAsRead()" class="text-xs text-red-600 hover:underline">Tandai dibaca</button>
                </div>
                <div class="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  <div v-for="notif in notifications" :key="notif.id" class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30" :class="{'bg-red-50 dark:bg-red-900/10': !notif.read}">
                    <p class="text-sm text-gray-800 dark:text-gray-200">{{ notif.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ new Date(notif.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) }}</p>
                  </div>
                  <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-gray-400">Tidak ada notifikasi</div>
                </div>
              </div>
            </div>

            <button @click="profileOpen = true" class="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer" title="Pengaturan Profil">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                {{ authStore.user?.name?.charAt(0) || 'B' }}
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-semibold text-gray-900 dark:text-white leading-none">{{ authStore.user?.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5 capitalize">{{ authStore.user?.role }} <span v-if="authStore.user?.bidang" class="text-red-500 font-bold">• {{ authStore.user.bidang }}</span></p>
              </div>
            </button>
          </div>
        </div>

        <div class="content-area">
          <router-view />
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <ProfileModal v-if="profileOpen" @close="profileOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useSuratStore } from '../stores/suratStore'
import { useNotifStore } from '../stores/notifStore'
import { useDark, useToggle } from '@vueuse/core'
import ProfileModal from '../components/ProfileModal.vue'
import {
  HomeIcon, PencilSquareIcon, BellIcon, MagnifyingGlassIcon,
  SunIcon, MoonIcon, ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const suratStore = useSuratStore()
const notifStore = useNotifStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const notifOpen = ref(false)
const profileOpen = ref(false)
const searchQuery = ref('')

const navigation = [
  { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
  { name: 'Ajukan Surat', href: '/user/pengajuan', icon: PencilSquareIcon },
]

const currentPageTitle = computed(() => {
  const found = navigation.find(n => route.path.startsWith(n.href))
  return found?.name || 'Dashboard'
})

const notifications = computed(() => notifStore.getForRole(authStore.user?.role, authStore.user?.bidang))
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const handleSearch = () => suratStore.setSearchQuery(searchQuery.value)

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
