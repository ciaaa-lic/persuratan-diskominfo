import { defineStore } from 'pinia'

const STORAGE_KEY = 'diskominfo_notifications_v2'

const getDefaultNotifications = () => [
  {
    id: Date.now() - 3600000,
    message: 'SOP Penomoran Surat Harian (Kuota 1-40 & Suffix A-Z) Aktif',
    read: false,
    role: 'all',
    bidang: null,
    timestamp: new Date().toISOString()
  },
  {
    id: Date.now() - 7200000,
    message: 'Perhitungan Hari Kerja otomatis melewati Sabtu, Minggu & Libur Nasional',
    read: false,
    role: 'all',
    bidang: null,
    timestamp: new Date().toISOString()
  }
]

export const useNotifStore = defineStore('notif', {
  state: () => {
    let saved = []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) saved = JSON.parse(data)
    } catch (e) {
      console.error('Failed loading notifications from localStorage', e)
    }
    return {
      notifications: saved.length > 0 ? saved : getDefaultNotifications()
    }
  },
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length
  },
  actions: {
    addNotification(message, role = 'all', bidang = null) {
      this.notifications.unshift({
        id: Date.now() + Math.random(),
        message,
        read: false,
        role, // 'admin', 'user', or 'all'
        bidang, // specific bidang target if needed
        timestamp: new Date().toISOString()
      })
      this.saveToStorage()
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this.saveToStorage()
    },
    getForRole(role, bidang = null) {
      return this.notifications.filter(n => {
        if (n.role === 'all') return true
        if (role === 'admin' && n.role === 'admin') return true
        if (role !== 'admin' && (n.role === 'user' || (bidang && n.bidang === bidang))) return true
        return false
      })
    },
    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications.slice(0, 50)))
      } catch (e) {
        console.error('Failed saving notifications to localStorage', e)
      }
    }
  }
})
