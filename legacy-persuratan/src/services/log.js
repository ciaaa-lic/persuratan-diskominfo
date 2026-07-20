import { apiClient } from './api'

const getFallbackLogs = () => {
  const saved = localStorage.getItem('activity_logs_fallback')
  if (saved) return JSON.parse(saved)
  return [
    { id: 1, timestamp: new Date().toISOString(), message: 'Sistem diinisialisasi', user: 'System' }
  ]
}

const saveFallbackLogs = (logs) => {
  localStorage.setItem('activity_logs_fallback', JSON.stringify(logs))
}

export const logService = {
  async getLogs() {
    try {
      const response = await apiClient.get('/logs.php')
      saveFallbackLogs(response.data)
      return { data: response.data }
    } catch (error) {
      console.warn('Backend log tidak terhubung, menggunakan log lokal/fallback.')
      return { data: getFallbackLogs() }
    }
  },

  async addLog(message, user = 'System') {
    try {
      await apiClient.post('/logs.php', { message, user })
      return this.getLogs()
    } catch (error) {
      console.warn('Gagal mencatat log ke database, mencatat secara lokal.')
      const logs = getFallbackLogs()
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message,
        user
      }
      logs.unshift(newLog)
      saveFallbackLogs(logs)
      return { data: logs }
    }
  }
}
