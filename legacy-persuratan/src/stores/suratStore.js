import { defineStore } from 'pinia'
import { suratService } from '../services/surat'
import { useLogStore } from './logStore'
import { useNotifStore } from './notifStore'

const sortSuratList = (list) => {
  if (!Array.isArray(list)) return []
  return [...list].sort((a, b) => {
    const getGroup = (st) => {
      if (st === 'Selesai' || st === 'Disetujui' || st === 'Ditolak') return 3
      if (st === 'Diproses' || st === 'Proses' || st === 'Sedang Diproses') return 2
      return 1 // BELUM SELESAI / Menunggu
    }
    const gA = getGroup(a?.status)
    const gB = getGroup(b?.status)
    if (gA !== gB) return gA - gB
    
    const tA = new Date(a?.tanggalPengajuan || a?.tanggalSurat || 0).getTime()
    const tB = new Date(b?.tanggalPengajuan || b?.tanggalSurat || 0).getTime()
    return tA - tB // ASC (yang paling dahulu mengajukan tampil lebih atas)
  })
}

export const useSuratStore = defineStore('surat', {
  state: () => ({
    suratList: [],
    loading: false,
    error: null,
    searchQuery: ''
  }),
  getters: {
    totalSurat: (state) => state.suratList.length,
    suratMenunggu: (state) => state.suratList.filter(s => s.status === 'Menunggu' || s.status === 'Belum Diproses').length,
    suratSelesai: (state) => state.suratList.filter(s => s.status === 'Selesai' || s.status === 'Disetujui' || s.status === 'Ditolak').length,
    suratHariIni: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.suratList.filter(s => s.tanggalPengajuan && s.tanggalPengajuan.startsWith(today)).length
    }
  },
  actions: {
    async fetchSurat(filters = {}) {
      this.loading = true
      try {
        if (this.searchQuery) {
          filters.search = this.searchQuery
        }
        const response = await suratService.getSurat(filters)
        this.suratList = sortSuratList(response.data || [])
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    setSearchQuery(query) {
      this.searchQuery = query
      this.fetchSurat()
    },
    async addSurat(data) {
      this.loading = true
      const logStore = useLogStore()
      const notifStore = useNotifStore()
      try {
        const response = await suratService.createSurat(data)
        this.suratList.push(response.data)
        this.suratList = sortSuratList(this.suratList)
        
        logStore.addLog(`Bidang ${data.bidang} membuat pengajuan surat`, `Bidang ${data.bidang}`)
        notifStore.addNotification(`Pengajuan surat baru dari Bidang ${data.bidang} (${data.perihal})`, 'all', data.bidang)
        
        return response.data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateStatus(id, data) {
      const notifStore = useNotifStore()
      try {
        await suratService.updateSurat(id, data)
        const index = this.suratList.findIndex(s => s.id === id)
        if (index !== -1) {
          this.suratList[index] = { ...this.suratList[index], ...data }
          this.suratList = sortSuratList(this.suratList)
          notifStore.addNotification(`Status pengajuan surat Bidang ${this.suratList[index].bidang} diperbarui menjadi: ${data.status}`, 'all', this.suratList[index].bidang)
        }
      } catch (err) {
        this.error = err.message
        throw err
      }
    },
    async deleteSurat(id) {
      this.loading = true
      try {
        await suratService.deleteSurat(id)
        const idx = this.suratList.findIndex(s => s.id === id)
        if (idx !== -1) {
          this.suratList.splice(idx, 1)
        }
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateSuratInfo(id, data) {
      this.loading = true
      const notifStore = useNotifStore()
      try {
        const response = await suratService.updateSuratInfo(id, data)
        const index = this.suratList.findIndex(s => s.id === id)
        if (index !== -1) {
          this.suratList[index] = { ...this.suratList[index], ...response.data }
          this.suratList = sortSuratList(this.suratList)
          notifStore.addNotification(`Informasi pengajuan surat Bidang ${this.suratList[index].bidang} berhasil diperbarui`, 'all', this.suratList[index].bidang)
        }
        return response.data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async addSuratBatch(batchList) {
      this.loading = true
      const logStore = useLogStore()
      const notifStore = useNotifStore()
      try {
        const response = await suratService.addSuratBatch(batchList)
        const newItems = response.data || []
        newItems.forEach(item => this.suratList.push(item))
        this.suratList = sortSuratList(this.suratList)
        
        if (newItems.length > 0) {
          const b = newItems[0].bidang
          logStore.addLog(`Bidang ${b} membuat ${newItems.length} pengajuan surat sekaligus (Batch)`, `Bidang ${b}`)
          notifStore.addNotification(`Pengajuan batch baru (${newItems.length} surat) dari Bidang ${b}`, 'all', b)
        }
        return newItems
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async terbitkanNomor(id, kodeKlasifikasi, user) {
      const logStore = useLogStore()
      const notifStore = useNotifStore()
      try {
        await suratService.generateNomorSurat(id, kodeKlasifikasi)
        await this.fetchSurat()
          
        const suratItem = this.suratList.find(s => s.id === id)
        logStore.addLog(`${user?.name || 'Admin'} menerbitkan nomor surat`, user?.name || 'Admin')
        notifStore.addNotification(`Nomor surat telah resmi diterbitkan untuk Bidang ${suratItem?.bidang || 'Anda'} (${suratItem?.nomorSurat || ''})`, 'all', suratItem?.bidang)
      } catch (err) {
        this.error = err.message
        throw err
      }
    }
  }
})
