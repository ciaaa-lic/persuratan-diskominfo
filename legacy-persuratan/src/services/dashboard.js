import { apiClient } from './api'
import { suratService } from './surat'

export const dashboardService = {
  async getStats() {
    try {
      const [resDash, resStok] = await Promise.all([
        apiClient.get('/dashboard.php'),
        apiClient.get('/stok.php?action=summary')
      ])
      if (resDash.data) {
        return { 
          data: {
            ...resDash.data,
            stokSummary: resStok.data || null
          }
        }
      }
    } catch (error) {
      console.warn('Backend MySQL tidak terhubung untuk dashboard, menghitung dari data surat lokal/cadangan.')
    }

    const res = await suratService.getSurat()
    const allSurat = res.data || []
    const today = new Date().toISOString().split('T')[0]
    const suratHariIni = allSurat.filter(s => s.tanggalPengajuan && s.tanggalPengajuan.startsWith(today))
    const totalToday = suratHariIni.filter(s => s.status === 'Selesai').length
    
    // Hitung working day index secara lokal (Tanpa Sabtu/Minggu sejak 1 Januari)
    const now = new Date()
    const startYear = new Date(now.getFullYear(), 0, 1)
    let workDays = 0
    for (let d = new Date(startYear); d <= now; d.setDate(d.getDate() + 1)) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) workDays++
    }
    const idx = Math.max(1, workDays)
    const startNum = ((idx - 1) * 40) + 1
    const endNum = idx * 40

    return {
      data: {
        totalSurat: allSurat.length,
        suratHariIni: suratHariIni.length,
        menunggu: allSurat.filter(s => s.status === 'Menunggu' || s.status === 'Belum Diproses').length,
        selesai: allSurat.filter(s => s.status === 'Selesai' || s.status === 'Disetujui' || s.status === 'Ditolak').length,
        nomorTerpakaiHariIni: totalToday,
        workingDayIndex: idx,
        numberRange: `${startNum} - ${endNum}`
      }
    }
  }
}
