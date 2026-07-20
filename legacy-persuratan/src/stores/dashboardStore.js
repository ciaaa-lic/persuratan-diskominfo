import { defineStore } from 'pinia'
import { dashboardService } from '../services/dashboard'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      totalSurat: 0,
      suratHariIni: 0,
      menunggu: 0,
      selesai: 0,
      nomorTerpakaiHariIni: 0
    },
    loading: false
  }),
  getters: {
    quotaStatus: (state) => {
      if (state.stats.stokSummary && state.stats.stokSummary.groups && state.stats.stokSummary.groups.length > 0) {
        const groups = state.stats.stokSummary.groups
        const getGroupData = (suff) => {
          const found = groups.find(g => g.suffix === suff)
          if (!found) return { used: 0, max: 40 }
          return { used: parseInt(found.used || 0), max: parseInt(found.total || 40) }
        }
        return {
          utama: getGroupData(''),
          A: getGroupData('A'),
          B: getGroupData('B')
        }
      }

      const terpakai = state.stats.nomorTerpakaiHariIni
      const maxPerGroup = 40
      
      const calculateGroup = (groupIndex) => {
        const start = groupIndex * maxPerGroup
        if (terpakai <= start) return { used: 0, max: maxPerGroup }
        if (terpakai >= start + maxPerGroup) return { used: maxPerGroup, max: maxPerGroup }
        return { used: terpakai - start, max: maxPerGroup }
      }
      
      return {
        utama: calculateGroup(0),
        A: calculateGroup(1),
        B: calculateGroup(2)
      }
    }
  },
  actions: {
    async fetchStats() {
      this.loading = true
      try {
        const response = await dashboardService.getStats()
        this.stats = response.data
      } finally {
        this.loading = false
      }
    }
  }
})
