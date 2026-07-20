import { apiClient } from './api'

// Mock Users Database (Cadangan offline)
let mockUsers = [
  { id: 1, username: 'admin', password: 'admin', name: 'Administrator', role: 'admin', bidang: null },
  { id: 2, username: 'aptika', password: 'aptika', name: 'Bidang Aplikasi Informatika (APTIKA)', role: 'user', bidang: 'APTIKA' },
  { id: 3, username: 'persandian', password: 'persandian', name: 'Bidang Persandian & Keamanan Informasi (PERSANDIAN)', role: 'user', bidang: 'PERSANDIAN' },
  { id: 4, username: 'pde', password: 'pde', name: 'Bidang Pengolahan Data & Statistik (PDE)', role: 'user', bidang: 'PDE' },
  { id: 5, username: 'humas', password: 'humas', name: 'Bidang Humas & Komunikasi Publik (HUMAS)', role: 'user', bidang: 'HUMAS' }
]

export const authService = {
  async login(username, password) {
    try {
      const res = await apiClient.post('/auth.php?action=login', { username, password })
      if (res.data && res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user))
        localStorage.setItem('token', res.data.token)
        return { data: res.data }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Username atau password salah!')
      }
      console.warn('Backend MySQL tidak terdeteksi, menggunakan autentikasi cadangan (offline).')
    }

    const found = mockUsers.find(u => u.username === username && u.password === password)
    if (found) {
      const { password: _, ...userWithoutPass } = found
      const token = `token-${found.username}-${Date.now()}`
      localStorage.setItem('user', JSON.stringify(userWithoutPass))
      localStorage.setItem('token', token)
      return {
        data: {
          token,
          user: userWithoutPass
        }
      }
    } else {
      throw new Error('Username atau password salah!')
    }
  },
  
  async logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return { success: true }
  },
  
  async getProfile() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  async updateProfile(userId, { name, password }) {
    try {
      const res = await apiClient.post('/auth.php?action=update_profile', { id: userId, name, password })
      if (res.data && res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return { data: res.data }
      }
    } catch (error) {
      console.warn('Gagal memutakhirkan profil ke MySQL, menyimpan ke penyimpanan lokal.')
    }

    const idx = mockUsers.findIndex(u => u.id === userId || u.username === userId)
    if (idx !== -1) {
      if (name) mockUsers[idx].name = name
      if (password) mockUsers[idx].password = password
      const { password: _, ...userWithoutPass } = mockUsers[idx]
      localStorage.setItem('user', JSON.stringify(userWithoutPass))
      return { data: { user: userWithoutPass } }
    } else {
      const current = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { id: userId, username: userId }
      if (name) current.name = name
      localStorage.setItem('user', JSON.stringify(current))
      return { data: { user: current } }
    }
  }
}
