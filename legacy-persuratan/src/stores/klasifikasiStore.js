import { defineStore } from 'pinia'
import { klasifikasiService } from '../services/klasifikasi'

export const useKlasifikasiStore = defineStore('klasifikasi', {
  state: () => ({
    list: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchKlasifikasi() {
      this.loading = true
      this.error = null
      try {
        const response = await klasifikasiService.getKlasifikasi()
        this.list = response.data
      } catch (err) {
        this.error = err.message || 'Gagal mengambil data klasifikasi'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    }
  }
})
