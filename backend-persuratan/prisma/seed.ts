import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Users (Ubah format dari username ke email sesuai permintaan user)
  const defaultPassword = await bcrypt.hash('admin', 10);
  const aptikaPassword = await bcrypt.hash('aptika', 10);
  const persandianPassword = await bcrypt.hash('persandian', 10);
  const pdePassword = await bcrypt.hash('pde', 10);
  const humasPassword = await bcrypt.hash('humas', 10);

  const users = [
    { email: 'admin@diskominfo.go.id', name: 'Admin Utama', password: defaultPassword, role: 'ADMIN', bidang: null },
    { email: 'aptika@diskominfo.go.id', name: 'Bid. APTIKA', password: aptikaPassword, role: 'BIDANG', bidang: 'APTIKA' },
    { email: 'persandian@diskominfo.go.id', name: 'Bid. PERSANDIAN', password: persandianPassword, role: 'BIDANG', bidang: 'PERSANDIAN' },
    { email: 'pde@diskominfo.go.id', name: 'Bid. PDE', password: pdePassword, role: 'BIDANG', bidang: 'PDE' },
    { email: 'humas@diskominfo.go.id', name: 'Bid. HUMAS', password: humasPassword, role: 'BIDANG', bidang: 'HUMAS' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, bidang: u.bidang },
      create: u,
    });
  }
  console.log('Users seeded.');

  // 2. Seed Hari Libur Nasional 2026
  const hariLibur = [
    { tanggal: new Date('2026-01-01'), keterangan: 'Tahun Baru 2026 Masehi' },
    { tanggal: new Date('2026-01-16'), keterangan: 'Isra Mi\'raj Nabi Muhammad SAW' },
    { tanggal: new Date('2026-02-17'), keterangan: 'Tahun Baru Imlek 2577 Kongzili' },
    { tanggal: new Date('2026-03-19'), keterangan: 'Hari Raya Nyepi Tahun Baru Saka 1948' },
    { tanggal: new Date('2026-03-20'), keterangan: 'Hari Raya Idul Fitri 1447 Hijriyah' },
    { tanggal: new Date('2026-03-21'), keterangan: 'Hari Raya Idul Fitri 1447 Hijriyah' },
    { tanggal: new Date('2026-04-03'), keterangan: 'Wafat Yesus Kristus' },
    { tanggal: new Date('2026-04-05'), keterangan: 'Kebangkitan Yesus Kristus (Paskah)' },
    { tanggal: new Date('2026-05-01'), keterangan: 'Hari Buruh Internasional' },
    { tanggal: new Date('2026-05-14'), keterangan: 'Kenaikan Yesus Kristus' },
    { tanggal: new Date('2026-05-27'), keterangan: 'Hari Raya Idul Adha 1447 Hijriyah' },
    { tanggal: new Date('2026-05-31'), keterangan: 'Hari Raya Waisak 2570 BE' },
    { tanggal: new Date('2026-06-01'), keterangan: 'Hari Lahir Pancasila' },
    { tanggal: new Date('2026-06-16'), keterangan: 'Tahun Baru Islam 1448 Hijriyah' },
    { tanggal: new Date('2026-08-17'), keterangan: 'Hari Kemerdekaan Republik Indonesia' },
    { tanggal: new Date('2026-08-25'), keterangan: 'Maulid Nabi Muhammad SAW' },
    { tanggal: new Date('2026-12-25'), keterangan: 'Hari Raya Natal' },
  ];

  for (const lib of hariLibur) {
    await prisma.hariLiburNasional.upsert({
      where: { tanggal: lib.tanggal },
      update: { keterangan: lib.keterangan },
      create: lib,
    });
  }
  console.log('Hari Libur seeded.');

  // 3. Seed Klasifikasi (Kumpulan utama klasifikasi surat dinas DISKOMINFO - 234 Kode Resmi)
  const klasifikasiData = [
    { kode: '000', uraian: 'UMUM' },
    { kode: '000.1', uraian: 'KETATAUSAHAAN DAN KERUMAHTANGGAAN' },
    { kode: '000.1.1', uraian: 'Telekomunikasi' },
    { kode: '000.1.2', uraian: 'Perjalanan Dinas Dalam Negeri' },
    { kode: '000.1.2.1', uraian: 'Perjalanan Dinas Kepala Daerah' },
    { kode: '000.1.2.2', uraian: 'Perjalanan Dinas DPRD' },
    { kode: '000.1.2.3', uraian: 'Perjalanan Dinas Pegawai' },
    { kode: '000.1.3', uraian: 'Perjalanan Dinas Luar Negeri' },
    { kode: '000.1.4', uraian: 'Penggunaan Fasilitas Kantor (Ruang/Gedung/Kendaraan/Wisma)' },
    { kode: '000.1.5', uraian: 'Rapat Pimpinan (Notula/Risalah)' },
    { kode: '000.1.6', uraian: 'Penyediaan Konsumsi' },
    { kode: '000.1.7', uraian: 'Pengurusan Kendaraan Dinas' },
    { kode: '000.1.8', uraian: 'Pemeliharaan Gedung Taman dan Peralatan Kantor' },
    { kode: '000.1.9', uraian: 'Pengelolaan Jaringan Listrik Air Telepon dan Komputer' },
    { kode: '000.1.10', uraian: 'Ketertiban dan Keamanan' },
    { kode: '000.2', uraian: 'PERLENGKAPAN' },
    { kode: '000.2.1', uraian: 'Inventarisasi dan Penyimpanan' },
    { kode: '000.2.2', uraian: 'Pemeliharaan peralatan kantor' },
    { kode: '000.2.3', uraian: 'Distribusi' },
    { kode: '000.2.4', uraian: 'Penghapusan Barang Milik Daerah (SK Tim/Berita Acara/Lelang)' },
    { kode: '000.3', uraian: 'PENGADAAN' },
    { kode: '000.3.1', uraian: 'Rencana pengadaan Barang dan jasa (Identifikasi/Penyusunan RKP/KAK/RUP)' },
    { kode: '000.3.2', uraian: 'Pengadaan Langsung (Pemilihan/Kontrak/Pelaksanaan)' },
    { kode: '000.3.3', uraian: 'Pengadaan Tidak Langsung/Lelang' },
    { kode: '000.3.4', uraian: 'Swakelola (Perencanaan/Pelaksanaan/Evaluasi)' },
    { kode: '000.4', uraian: 'PERPUSTAKAAN' },
    { kode: '000.4.1', uraian: 'Kebijakan di bidang Perpustakaan' },
    { kode: '000.4.2', uraian: 'Deposit Bahan Pustaka' },
    { kode: '000.4.3', uraian: 'Koleksi Pustaka (Pembelian/Hibah/Hadiah/Tukar Menukar)' },
    { kode: '000.5', uraian: 'KEARSIPAN' },
    { kode: '000.5.1', uraian: 'Kebijakan di bidang kearsipan oleh Pemerintah Daerah' },
    { kode: '000.5.2', uraian: 'Pembinaan Kearsipan' },
    { kode: '000.5.3', uraian: 'Pengelolaan Arsip Dinamis' },
    { kode: '000.5.4', uraian: 'Program Arsip Vital (Identifikasi/Perlindungan/Penyelamatan)' },
    { kode: '000.5.6', uraian: 'Penyusutan Arsip' },
    { kode: '000.5.7', uraian: 'Alih Media Arsip (Digitalisasi)' },
    { kode: '000.5.9', uraian: 'Pengelolaan Arsip Statis' },
    { kode: '000.6', uraian: 'PERSANDIAN' },
    { kode: '000.6.1', uraian: 'Kebijakan di bidang Persandian' },
    { kode: '000.6.2', uraian: 'Pengamanan Persandian (Sinyal/Kripto/Materiil)' },
    { kode: '000.6.3', uraian: 'Pengkajian Persandian (Kriptografi/Komunikasi Sandi)' },
    { kode: '000.6.5', uraian: 'Layanan Sertifikasi Elektronik' },
    { kode: '000.7', uraian: 'PERENCANAAN PEMBANGUNAN' },
    { kode: '000.7.1', uraian: 'Musrenbang (Provinsi/Nasional/Kota/Kecamatan/Desa)' },
    { kode: '000.7.2', uraian: 'Perencanaan Pembangunan Daerah' },
    { kode: '000.8', uraian: 'ORGANISASI DAN TATA LAKSANA' },
    { kode: '000.8.1', uraian: 'Struktur Organisasi (Pembentukan/Pengubahan/Pembubaran)' },
    { kode: '000.8.2', uraian: 'Uraian Jabatan (Analisa Jabatan/Beban Kerja)' },
    { kode: '000.8.3', uraian: 'Ketatalaksanaan (Proses Bisnis/SOP/Pelayanan Publik)' },
    { kode: '100', uraian: 'PEMERINTAHAN' },
    { kode: '100.1', uraian: 'OTONOMI DAERAH' },
    { kode: '100.2', uraian: 'PEMERINTAHAN UMUM' },
    { kode: '100.3', uraian: 'HUKUM' },
    { kode: '100.3.1', uraian: 'Program Legislasi' },
    { kode: '100.3.2', uraian: 'Rancangan Peraturan Perundang-Undangan (Perda/Naskah Akademik)' },
    { kode: '100.3.3', uraian: 'Keputusan/Ketetapan Pimpinan (Gubernur/Bupati/Walikota/Sekda)' },
    { kode: '100.3.4', uraian: 'Instruksi / Surat Edaran' },
    { kode: '100.3.5', uraian: 'Surat Perintah' },
    { kode: '100.3.7', uraian: 'Nota Kesepakatan (MOU) / Kontrak / Perjanjian' },
    { kode: '200', uraian: 'POLITIK' },
    { kode: '200.1', uraian: 'KESATUAN BANGSA DAN POLITIK' },
    { kode: '200.2', uraian: 'PEMILU' },
    { kode: '300', uraian: 'KEAMANAN DAN KETERTIBAN' },
    { kode: '300.1', uraian: 'SATUAN POLISI PAMONG PRAJA (Satpol PP)' },
    { kode: '300.2', uraian: 'PENANGGULANGAN BENCANA PENCARIAN DAN PERTOLONGAN' },
    { kode: '400', uraian: 'KESEJAHTERAAN RAKYAT' },
    { kode: '400.3', uraian: 'PENDIDIKAN' },
    { kode: '400.7', uraian: 'KESEHATAN' },
    { kode: '480', uraian: 'MEDIA MASSA / KOMUNIKASI DAN INFORMATIKA' },
    { kode: '481', uraian: 'Penerangan / Informasi / Humas' },
    { kode: '482', uraian: 'Radio / Televisi / Film' },
    { kode: '483', uraian: 'Pers / Jurnalistik / Media Cetak & Online' },
    { kode: '484', uraian: 'Pameran / Visualisasi' },
    { kode: '485', uraian: 'Infrastruktur Teknologi Informasi & Komunikasi (TIK)' },
    { kode: '486', uraian: 'Aplikasi Informatika (APTIKA)' },
    { kode: '487', uraian: 'Persandian dan Keamanan Siber' },
    { kode: '488', uraian: 'Pengolahan Data Elektronik & Statistik (PDE)' },
    { kode: '489', uraian: 'Layanan Smart City / E-Government' },
    { kode: '500', uraian: 'PEREKONOMIAN' },
    { kode: '500.12', uraian: 'KOMUNIKASI DAN INFORMATIKA' },
    { kode: '500.12.6', uraian: 'e-Government (Tata Kelola/Aplikasi)' },
    { kode: '600', uraian: 'PEKERJAAN UMUM DAN KETENAGALISTRIKAN' },
    { kode: '700', uraian: 'PENGAWASAN' },
    { kode: '700.1', uraian: 'PENGAWASAN INTERNAL' },
    { kode: '800', uraian: 'KEPEGAWAIAN' },
    { kode: '800.1', uraian: 'SUMBER DAYA MANUSIA' },
    { kode: '800.1.2', uraian: 'Formasi dan Pengadaan Pegawai (CPNS/PPPK)' },
    { kode: '800.1.3', uraian: 'Mutasi Pegawai (Pindah Instansi/Kenaikan Pangkat)' },
    { kode: '800.1.4', uraian: 'Pengembangan Karir (Tugas Belajar/Ujian Dinas)' },
    { kode: '800.1.6', uraian: 'Kode Etik Disiplin dan Pensiun' },
    { kode: '800.1.11', uraian: 'Administrasi Pegawai (Cuti/Karpeg/DUK)' },
    { kode: '800.1.12', uraian: 'Kesejahteraan Pegawai (BPJS/Tali Kasih)' },
    { kode: '900', uraian: 'KEUANGAN' },
    { kode: '900.1', uraian: 'KEUANGAN DAERAH' },
    { kode: '900.1.1', uraian: 'Penyusunan RAPBD / APBD-P' },
    { kode: '900.1.3', uraian: 'Pelaksanaan Anggaran (SPP/SPM/SP2D)' },
    { kode: '900.1.13', uraian: 'Pendapatan dan Investasi Daerah (Pajak/Retribusi/BUMD)' },
    { kode: '900.1.14', uraian: 'Fasilitasi Dana Perimbangan (DAU/DAK/DBH)' }
  ];

  for (const k of klasifikasiData) {
    await prisma.klasifikasi.upsert({
      where: { kode: k.kode },
      update: { uraian: k.uraian },
      create: k,
    });
  }
  console.log('Klasifikasi seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
