import ExcelJS from 'exceljs'

// Mock data for letters
let mockSurat = [
  { 
    id: 1, 
    nomorSurat: '001/DISKOMINFO/2026', 
    pengirim: 'Budi Santoso (Kepala Seksi)', 
    tanggalPengajuan: new Date(Date.now() - 86400000 * 3).toISOString(),
    tanggalSurat: '2026-07-10', 
    klasifikasi: 'Penting', 
    perihal: 'Undangan Koordinasi Aplikasi e-Government', 
    bidang: 'APTIKA', 
    status: 'Selesai',
    statusHistory: [
      { status: 'Pengajuan dibuat', date: new Date(Date.now() - 86400000 * 3).toISOString() },
      { status: 'Diverifikasi admin', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'Nomor surat diterbitkan', date: new Date(Date.now() - 86400000 * 1).toISOString() }
    ]
  },
  { 
    id: 2, 
    nomorSurat: null, 
    pengirim: 'Siti Aminah (Staf Persandian)', 
    tanggalPengajuan: new Date().toISOString(),
    tanggalSurat: '2026-07-11', 
    klasifikasi: 'Rahasia', 
    perihal: 'Laporan Audit Keamanan Jaringan & Siber Dinas', 
    bidang: 'PERSANDIAN', 
    status: 'Menunggu',
    statusHistory: [
      { status: 'Pengajuan dibuat', date: new Date().toISOString() }
    ]
  },
  { 
    id: 3, 
    nomorSurat: '002/DISKOMINFO/2026', 
    pengirim: 'Ahmad Fauzi (Analis Data)', 
    tanggalPengajuan: new Date(Date.now() - 86400000 * 2).toISOString(),
    tanggalSurat: '2026-07-11', 
    klasifikasi: 'Biasa', 
    perihal: 'Permohonan Publikasi Data Statistik Sektoral 2026', 
    bidang: 'PDE', 
    status: 'Selesai',
    statusHistory: [
      { status: 'Pengajuan dibuat', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'Nomor surat diterbitkan', date: new Date(Date.now() - 86400000 * 1).toISOString() }
    ]
  },
  { 
    id: 4, 
    nomorSurat: null, 
    pengirim: 'Rina Lestari (Humas & IKP)', 
    tanggalPengajuan: new Date().toISOString(),
    tanggalSurat: '2026-07-12', 
    klasifikasi: 'Biasa', 
    perihal: 'Jadwal Siaran Pers dan Liputan Kegiatan Pimpinan', 
    bidang: 'HUMAS', 
    status: 'Menunggu',
    statusHistory: [
      { status: 'Pengajuan dibuat', date: new Date().toISOString() }
    ]
  }
]

import { apiClient } from './api'

export const suratService = {
  async getSurat(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.bidang) params.append('bidang', filters.bidang)
      if (filters.tanggal) params.append('tanggal', filters.tanggal)
      if (filters.search) params.append('search', filters.search)
      
      const res = await apiClient.get(`/surat.php?${params.toString()}`)
      if (res.data) {
        localStorage.setItem('surat_cache', JSON.stringify(res.data))
        return { data: res.data }
      }
    } catch (error) {
      console.warn('Backend MySQL tidak terhubung untuk surat, menggunakan data cadangan (offline).')
    }

    const cached = localStorage.getItem('surat_cache')
    if (cached && JSON.parse(cached).length > 0) {
      mockSurat = JSON.parse(cached)
    }

    let filtered = [...mockSurat]
    if (filters.bidang) {
      filtered = filtered.filter(s => s.bidang === filters.bidang)
    }
    if (filters.tanggal) {
      filtered = filtered.filter(s => s.tanggalSurat === filters.tanggal)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(s => 
        (s.perihal && s.perihal.toLowerCase().includes(q)) || 
        (s.pengirim && s.pengirim.toLowerCase().includes(q)) ||
        (s.nomorSurat && s.nomorSurat.toLowerCase().includes(q))
      )
    }
    return { data: filtered }
  },
  
  async createSurat(data) {
    try {
      const res = await apiClient.post('/surat.php', data)
      if (res.data) {
        mockSurat.unshift(res.data)
        localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
        return { data: res.data }
      }
    } catch (error) {
      console.warn('Gagal menyimpan surat ke MySQL, menyimpan secara offline.')
    }

    const now = new Date().toISOString()
    const newSurat = {
      id: Date.now(),
      nomorSurat: null,
      pengirim: data.pengirim,
      tanggalSurat: data.tanggalSurat,
      tanggalPengajuan: now,
      klasifikasi: data.klasifikasi,
      perihal: data.perihal,
      bidang: data.bidang,
      status: 'Menunggu',
      statusHistory: [
        { status: 'Pengajuan dibuat', date: now }
      ]
    }
    mockSurat.unshift(newSurat)
    localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
    return { data: newSurat }
  },
  
  async updateSurat(id, data) {
    try {
      const res = await apiClient.put(`/surat.php?id=${id}`, data)
      if (res.data) {
        const index = mockSurat.findIndex(s => s.id == id)
        if (index !== -1) mockSurat[index] = res.data
        localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
        return { data: res.data }
      }
    } catch (error) {
      console.warn('Gagal memutakhirkan surat di MySQL, memutakhirkan offline.')
    }

    const index = mockSurat.findIndex(s => s.id == id)
    if (index !== -1) {
      if (data.status && data.status !== mockSurat[index].status) {
        mockSurat[index].statusHistory.push({
          status: data.status === 'Selesai' ? 'Nomor surat diterbitkan' : 'Status diperbarui',
          date: new Date().toISOString()
        })
      }
      mockSurat[index] = { ...mockSurat[index], ...data }
      localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
      return { data: mockSurat[index] }
    } else {
      throw new Error('Surat not found')
    }
  },
  
  async generateNomorSurat(id, kodeKlasifikasi) {
    try {
      const res = await apiClient.put(`/surat.php?id=${id}&action=generateNomor`, { kodeKlasifikasi })
      if (res.data) {
        const index = mockSurat.findIndex(s => s.id == id)
        if (index !== -1) mockSurat[index] = res.data
        localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
        return { data: res.data }
      }
    } catch (error) {
      console.warn('Gagal generate nomor di MySQL, melakukan generate offline.')
    }

    const index = mockSurat.findIndex(s => s.id == id)
    if (index === -1) throw new Error('Surat not found')
    
    const today = new Date().toISOString().split('T')[0]
    const todaySurat = mockSurat.filter(s => 
      s.tanggalPengajuan && 
      s.tanggalPengajuan.startsWith(today) && 
      s.status === 'Selesai'
    )
    const count = todaySurat.length
    
    // Hitung workingDayIndex (Tanpa Sabtu/Minggu sejak 1 Januari)
    const now = new Date()
    const startYear = new Date(now.getFullYear(), 0, 1)
    let workDays = 0
    for (let d = new Date(startYear); d <= now; d.setDate(d.getDate() + 1)) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) workDays++
    }
    const idx = Math.max(1, workDays)
    const baseStart = ((idx - 1) * 40)
    
    let seqStr = ''
    if (count < 40) {
      seqStr = (baseStart + count + 1).toString()
    } else {
      const letterIndex = Math.floor(count / 40) - 1
      const num = baseStart + (count % 40) + 1
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const letter = letterIndex < 26 ? alphabet[letterIndex] : 'Z'
      seqStr = `${num}.${letter}`
    }
    
    const dateObj = new Date()
    const monthRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][dateObj.getMonth()]
    const year = dateObj.getFullYear()
    
    const fullNomor = `${kodeKlasifikasi}/${seqStr}/DISKOMINFO/${monthRomawi}/${year}`
    
    return this.updateSurat(id, { nomorSurat: fullNomor, status: 'Selesai', kodeKlasifikasi })
  },
  
  async deleteSurat(id) {
    try {
      await apiClient.delete(`/surat.php?id=${id}`)
    } catch (error) {
      console.warn('Gagal menghapus surat di MySQL, menghapus dari lokal/offline.')
    }
    const idx = mockSurat.findIndex(s => s.id == id)
    if (idx !== -1) mockSurat.splice(idx, 1)
    localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
    return true
  },

  async updateSuratInfo(id, data) {
    try {
      const res = await apiClient.put(`/surat.php?id=${id}&action=updateInfo`, data)
      if (res.data) {
        const index = mockSurat.findIndex(s => s.id == id)
        if (index !== -1) mockSurat[index] = res.data
        localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
        return { data: res.data }
      }
    } catch (error) {
      console.warn('Gagal update info surat di MySQL, memutakhirkan offline.')
    }
    const index = mockSurat.findIndex(s => s.id == id)
    if (index !== -1) {
      mockSurat[index] = { ...mockSurat[index], ...data }
      localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
      return { data: mockSurat[index] }
    }
    throw new Error('Surat not found')
  },

  async addSuratBatch(batchList) {
    try {
      const res = await apiClient.post('/surat.php?action=batchCreate', { batchList })
      if (res.data && res.data.data) {
        res.data.data.forEach(item => mockSurat.unshift(item))
        localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
        return { data: res.data.data }
      }
    } catch (error) {
      console.warn('Gagal menyimpan batch ke MySQL, menyimpan offline.')
    }
    const now = new Date().toISOString()
    const addedList = []
    batchList.forEach((data, index) => {
      const newSurat = {
        id: Date.now() + index,
        nomorSurat: null,
        pengirim: data.pengirim,
        tanggalSurat: data.tanggalSurat,
        tanggalPengajuan: now,
        klasifikasi: data.klasifikasi,
        perihal: data.perihal,
        bidang: data.bidang,
        status: 'Menunggu',
        statusHistory: [
          { status: 'Pengajuan dibuat', date: now }
        ]
      }
      mockSurat.unshift(newSurat)
      addedList.push(newSurat)
    })
    localStorage.setItem('surat_cache', JSON.stringify(mockSurat))
    return { data: addedList }
  },

  async exportExcel(data) {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Rekap Surat')
    
    // Header
    sheet.mergeCells('A1:H1')
    sheet.getCell('A1').value = 'REKAP NOMOR SURAT DISKOMINFO'
    sheet.getCell('A1').font = { size: 16, bold: true }
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }
    
    sheet.mergeCells('A2:H2')
    sheet.getCell('A2').value = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`
    sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' }
    
    sheet.addRow([]) // empty row
    
    // Columns
    const columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nomor Surat', key: 'nomorSurat', width: 25 },
      { header: 'Pengirim', key: 'pengirim', width: 25 },
      { header: 'Tgl Surat', key: 'tanggalSurat', width: 15 },
      { header: 'Tgl Pengajuan', key: 'tanggalPengajuan', width: 15 },
      { header: 'Bidang', key: 'bidang', width: 20 },
      { header: 'Klasifikasi', key: 'klasifikasi', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ]
    sheet.columns = columns
    
    // Add data
    data.forEach((row, idx) => {
      sheet.addRow({
        no: idx + 1,
        nomorSurat: row.nomorSurat || '-',
        pengirim: row.pengirim,
        tanggalSurat: row.tanggalSurat,
        tanggalPengajuan: new Date(row.tanggalPengajuan).toLocaleDateString('id-ID'),
        bidang: row.bidang,
        klasifikasi: row.klasifikasi,
        status: row.status
      })
    })
    
    // Style header row
    const headerRow = sheet.getRow(4)
    headerRow.font = { bold: true }
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    
    // Style data rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 4) {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      }
    })
    
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rekap_Surat_Diskominfo_${Date.now()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
