import axios from 'axios'

// Sesuaikan baseURL dengan URL server PHP (XAMPP/Laragon) Anda
// Default asumsi: folder project berada di htdocs/surat-app
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 detik timeout
})
