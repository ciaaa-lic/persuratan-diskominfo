import { defineStore } from 'pinia'
import { logService } from '../services/log'

export const useLogStore = defineStore('log', {
  state: () => ({
    logs: []
  }),
  actions: {
    async fetchLogs() {
      try {
        const res = await logService.getLogs()
        this.logs = res.data
      } catch (err) {
        console.error('Gagal memuat log:', err)
      }
    },
    async addLog(message, user = 'System') {
      try {
        const res = await logService.addLog(message, user)
        if (res && res.data) {
          this.logs = res.data
        }
      } catch (err) {
        console.error('Gagal menambah log:', err)
      }
    }
  }
})
