<?php
class Database {
    private $host = "localhost";
    private $db_name = "surat_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            // 1. Connect without dbname first to ensure database exists
            $pdo = new PDO("mysql:host=" . $this->host, $this->username, $this->password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . $this->db_name . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // 2. Connect directly to db_name
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8mb4");

            // 3. Initialize tables and initial data automatically
            $this->initTables();
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(["message" => "Connection error: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }

    private function initTables() {
        try {
            // Table: users
            $queryUsers = "CREATE TABLE IF NOT EXISTS `users` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `username` VARCHAR(50) UNIQUE NOT NULL,
                `password` VARCHAR(255) NOT NULL,
                `name` VARCHAR(150) NOT NULL,
                `role` VARCHAR(20) NOT NULL,
                `bidang` VARCHAR(50) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryUsers);

            // Seed users if empty
            $stmt = $this->conn->query("SELECT COUNT(*) FROM `users`");
            if ($stmt->fetchColumn() == 0) {
                $seedUsers = "INSERT INTO `users` (`username`, `password`, `name`, `role`, `bidang`) VALUES
                ('admin', 'admin', 'Administrator', 'admin', NULL),
                ('aptika', 'aptika', 'Bidang Aplikasi Informatika (APTIKA)', 'user', 'APTIKA'),
                ('persandian', 'persandian', 'Bidang Persandian & Keamanan Informasi (PERSANDIAN)', 'user', 'PERSANDIAN'),
                ('pde', 'pde', 'Bidang Pengolahan Data & Statistik (PDE)', 'user', 'PDE'),
                ('humas', 'humas', 'Bidang Humas & Komunikasi Publik (HUMAS)', 'user', 'HUMAS');";
                $this->conn->exec($seedUsers);
            }

            // Table: klasifikasi
            $queryKlas = "CREATE TABLE IF NOT EXISTS `klasifikasi` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `kode` VARCHAR(20) UNIQUE NOT NULL,
                `uraian` VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryKlas);

            // Seed klasifikasi if count < 234 (ensures exact match with user's SQLyog classification table)
            $stmtK = $this->conn->query("SELECT COUNT(*) FROM `klasifikasi`");
            if ($stmtK->fetchColumn() < 234) {
                $this->conn->exec("TRUNCATE TABLE `klasifikasi`");
                $seedKlas = "INSERT INTO `klasifikasi` (`kode`, `uraian`) VALUES
                ('000','UMUM'),
                ('000.1','KETATAUSAHAAN DAN KERUMAHTANGGAAN'),
                ('000.1.1','Telekomunikasi'),
                ('000.1.2','Perjalanan Dinas Dalam Negeri'),
                ('000.1.2.1','Perjalanan Dinas Kepala Daerah'),
                ('000.1.2.2','Perjalanan Dinas DPRD'),
                ('000.1.2.3','Perjalanan Dinas Pegawai'),
                ('000.1.3','Perjalanan Dinas Luar Negeri'),
                ('000.1.3.1','Perjalanan Dinas Kepala Daerah'),
                ('000.1.3.2','Perjalanan Dinas DPRD'),
                ('000.1.3.3','Perjalanan Dinas Pegawai'),
                ('000.1.4','Penggunaan Fasilitas Kantor (Ruang/Gedung/Kendaraan/Wisma)'),
                ('000.1.5','Rapat Pimpinan (Notula/Risalah)'),
                ('000.1.6','Penyediaan Konsumsi'),
                ('000.1.7','Pengurusan Kendaraan Dinas'),
                ('000.1.7.1','Pengurusan surat-surat kendaraan dinas'),
                ('000.1.7.2','Pemeliharaan dan perbaikan'),
                ('000.1.7.3','Pengurusan kehilangan dan masalah kendaraan'),
                ('000.1.8','Pemeliharaan Gedung Taman dan Peralatan Kantor'),
                ('000.1.8.1','Pertamanan/ Landscape'),
                ('000.1.8.2','Penghijauan'),
                ('000.1.8.3','Perbaikan Gedung'),
                ('000.1.8.4','Perbaikan Peralatan Kantor'),
                ('000.1.8.5','Perbaikan Rumah Dinas/ Wisma'),
                ('000.1.8.6','Kebersihan Gedung dan Taman'),
                ('000.1.9','Pengelolaan Jaringan Listrik Air Telepon dan Komputer'),
                ('000.1.9.1','Perbaikan / Pemeliharaan'),
                ('000.1.9.2','Pemasangan'),
                ('000.1.10','Ketertiban dan Keamanan'),
                ('000.1.10.1','Pengamanan Penjagaan dan Pengawalan Pejabat/Kantor/Rumah Dinas'),
                ('000.1.10.2','Laporan Ketertiban dan Keamanan'),
                ('000.1.11','Administrasi Pengelolaan Parkir'),
                ('000.1.12','Administrasi Pakaian Dinas (Pegawai/Satpam/Kebersihan)'),
                ('000.2','PERLENGKAPAN'),
                ('000.2.1','Inventarisasi dan Penyimpanan'),
                ('000.2.1.1','Data hasil inventarisasi dan penyimpanan'),
                ('000.2.2.2','Laporan dan evaluasi inventarisasi dan penyimpanan'),
                ('000.2.2','Pemeliharaan peralatan kantor'),
                ('000.2.2.1','Data hasil pemeliharaan kantor'),
                ('000.2.2.2','Laporan dan evaluasi pemeliharaan kantor'),
                ('000.2.3','Distribusi'),
                ('000.2.3.1','Barang habis pakai'),
                ('000.2.3.2','Barang milik daerah'),
                ('000.2.4','Penghapusan Barang Milik Daerah (SK Tim/Berita Acara/Lelang)'),
                ('000.2.5','Pengelolaan Database Barang Milik Daerah'),
                ('000.3','PENGADAAN'),
                ('000.3.1','Rencana pengadaan Barang dan jasa (Identifikasi/Penyusunan RKP/KAK/RUP)'),
                ('000.3.2','Pengadaan Langsung (Pemilihan/Kontrak/Pelaksanaan)'),
                ('000.3.3','Pengadaan Tidak Langsung/Lelang'),
                ('000.3.4','Swakelola (Perencanaan/Pelaksanaan/Evaluasi)'),
                ('000.3.5','Pengolahan Sistem Informasi Pengadaan (Database/Kontrak)'),
                ('000.3.6','Monitoring dan evaluasi pelaksanaan pengadaan'),
                ('000.4','PERPUSTAKAAN'),
                ('000.4.1','Kebijakan di bidang Perpustakaan'),
                ('000.4.2','Deposit Bahan Pustaka'),
                ('000.4.2.1','Serah Simpan Karya Cetak dan Karya Rekam'),
                ('000.4.2.2','Pangkalan Data Penerbit dan Pengusaha Rekaman'),
                ('000.4.2.3','Terbitan Internasional dan Regional'),
                ('000.4.2.4','Pemantauan Wajib Serah Simpan'),
                ('000.4.2.5','Bibliografi dan Katalog'),
                ('000.4.3','Koleksi Pustaka (Pembelian/Hibah/Hadiah/Tukar Menukar)'),
                ('000.4.4','Pengolahan Bahan Pustaka'),
                ('000.4.5','Pangkalan Data Katalog Koleksi'),
                ('000.4.6','Layanan Perpustakaan (Keanggotaan/Peminjaman/Gemar Baca)'),
                ('000.4.7','Kerjasama Perpustakaan (MoU/Perjanjian)'),
                ('000.4.8','Pengembangan Implementasi Teknologi Informasi Perpustakaan'),
                ('000.4.10','Konservasi (Perawatan/Perbaikan/Penjilidan)'),
                ('000.5','KEARSIPAN'),
                ('000.5.1','Kebijakan di bidang kearsipan oleh Pemerintah Daerah'),
                ('000.5.2','Pembinaan Kearsipan'),
                ('000.5.2.1','Pengembangan Profesi Arsiparis (Formasi/Analisis Kebutuhan)'),
                ('000.5.2.2','Bimbingan Konsultasi Arsiparis'),
                ('000.5.2.3','Penilaian Arsiparis'),
                ('000.5.2.4','Pemilihan Arsiparis Teladan'),
                ('000.5.2.5','Data Base Arsiparis'),
                ('000.5.2.7','Supervisi dan Evaluasi Kearsipan'),
                ('000.5.3','Pengelolaan Arsip Dinamis'),
                ('000.5.3.1','Penciptaan (Registrasi/Buku Agenda/Kartu Kendali)'),
                ('000.5.3.2','Pemberkasan Arsip Aktif'),
                ('000.5.3.3','Penataan Arsip Inaktif'),
                ('000.5.3.4','Penggunaan dan Bukti Peminjaman Arsip'),
                ('000.5.3.5','Autentikasi Arsip Dinamis'),
                ('000.5.4','Program Arsip Vital (Identifikasi/Perlindungan/Penyelamatan)'),
                ('000.5.5','Pengelolaan Arsip Terjaga'),
                ('000.5.6','Penyusutan Arsip'),
                ('000.5.6.1','Pemindahan Arsip'),
                ('000.5.6.2','Pemusnahan Arsip (SK Panitia/Persetujuan ANRI/Berita Acara)'),
                ('000.5.6.3','Penyerahan Arsip Statis'),
                ('000.5.7','Alih Media Arsip (Digitalisasi)'),
                ('000.5.9','Pengelolaan Arsip Statis'),
                ('000.5.9.1','Akuisisi Arsip Statis'),
                ('000.5.9.3','Sejarah Lisan (Wawancara/Hasil Rekaman)'),
                ('000.5.9.5','Penyusunan Sarana Bantu Temu Balik (Inventory/Guide)'),
                ('000.5.9.6','Preservasi Preventif (Penyimpanan/Hama)'),
                ('000.5.15','Pengawasan Kearsipan (Internal/Eksternal)'),
                ('000.6','PERSANDIAN'),
                ('000.6.1','Kebijakan di bidang Persandian'),
                ('000.6.2','Pengamanan Persandian (Sinyal/Kripto/Materiil)'),
                ('000.6.3','Pengkajian Persandian (Kriptografi/Komunikasi Sandi)'),
                ('000.6.5','Layanan Sertifikasi Elektronik'),
                ('000.7','PERENCANAAN PEMBANGUNAN'),
                ('000.7.1','Musrenbang (Provinsi/Nasional/Kota/Kecamatan/Desa)'),
                ('000.7.2','Perencanaan Pembangunan Daerah'),
                ('000.7.2.1','Rencana Pembangunan Jangka Panjang (RPJP)'),
                ('000.7.2.2','Rencana Pembangunan Jangka Menengah (RPJM)'),
                ('000.7.2.4','Rencana Pembangunan Tahunan (RKP)'),
                ('000.7.2.7','Penetapan / Kontrak Kinerja'),
                ('000.8','ORGANISASI DAN TATA LAKSANA'),
                ('000.8.1','Struktur Organisasi (Pembentukan/Pengubahan/Pembubaran)'),
                ('000.8.2','Uraian Jabatan (Analisa Jabatan/Beban Kerja)'),
                ('000.8.3','Ketatalaksanaan (Proses Bisnis/SOP/Pelayanan Publik)'),
                ('000.8.6','Koordinasi Penguatan Reformasi dan Birokrasi'),
                ('000.9','PENELITIAN PENGKAJIAN DAN PENGEMBANGAN'),
                ('100','PEMERINTAHAN'),
                ('100.1','OTONOMI DAERAH'),
                ('100.1.2','Penyelenggaraan Pemerintah Daerah (Fasilitasi/Monitoring)'),
                ('100.1.3','Penataan Daerah (Pemekaran/Otsus)'),
                ('100.1.4','Pemilihan Kepala Daerah dan DPRD'),
                ('100.2','PEMERINTAHAN UMUM'),
                ('100.2.1','Kebijakan bidang Pemerintahan Umum'),
                ('100.2.2','Dekonsentrasi dan Kerjasama'),
                ('100.2.3','Wilayah Administrasi dan Perbatasan (Toponimi/Batas Daerah)'),
                ('100.3','HUKUM'),
                ('100.3.1','Program Legislasi'),
                ('100.3.2','Rancangan Peraturan Perundang-Undangan (Perda/Naskah Akademik)'),
                ('100.3.3','Keputusan/Ketetapan Pimpinan (Gubernur/Bupati/Walikota/Sekda)'),
                ('100.3.4','Instruksi / Surat Edaran'),
                ('100.3.5','Surat Perintah'),
                ('100.3.7','Nota Kesepakatan (MOU) / Kontrak / Perjanjian'),
                ('100.3.11','Kasus/ Sengketa Hukum (Pidana/Perdata/Arbitrase)'),
                ('100.3.13','Hak atas Kekayaan Intelektual (HAKI)'),
                ('200','POLITIK'),
                ('200.1','KESATUAN BANGSA DAN POLITIK'),
                ('200.1.2','Bina Ideologi dan Wawasan Kebangsaan (Bela Negara)'),
                ('200.1.3','Kewaspadaan Nasional (Intelijen/Konflik Sosial)'),
                ('200.1.4','Ketahanan Seni Budaya Adat Agama dan Kemasyarakatan (Ormas)'),
                ('200.1.5','Politik Dalam Negeri (Parpol/Pemilu)'),
                ('200.2','PEMILU'),
                ('200.2.2','Pemutakhiran Daftar Pemilih (DP4/DPS/DPT)'),
                ('200.2.3','Pendaftaran dan Verifikasi Peserta Pemilu'),
                ('200.2.8','Pemungutan dan Penghitungan Suara'),
                ('300','KEAMANAN DAN KETERTIBAN'),
                ('300.1','SATUAN POLISI PAMONG PRAJA (Satpol PP)'),
                ('300.1.2','Tata Operasional dan Sarana Prasarana Satpol PP'),
                ('300.2','PENANGGULANGAN BENCANA PENCARIAN DAN PERTOLONGAN'),
                ('300.2.2','Perencanaan Penanggulangan Bencana (SAR/Logistik)'),
                ('300.2.8','Operasi Komunikasi (Berita SAR/Beacon)'),
                ('400','KESEJAHTERAAN RAKYAT'),
                ('400.1','PEMBANGUNAN DAERAH TERTINGGAL'),
                ('400.2','PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK'),
                ('400.2.3','Perlindungan Perempuan (Kekerasan/Trafficking)'),
                ('400.2.4','Perlindungan Anak (Hak Sipil/Anak Berhadapan Hukum)'),
                ('400.2.5','Tumbuh Kembang Anak (Kota Layak Anak)'),
                ('400.3','PENDIDIKAN'),
                ('400.3.2','PAUD (Bahan Ajar/Alat Permainan Edukatif)'),
                ('400.3.5','Pendidikan Dasar dan Menengah Pertama (Kurikulum/BOS/Bantuan Siswa)'),
                ('400.3.7','Pembinaan Pendidik dan Tenaga Pendidik (Sertifikasi Guru/UKG)'),
                ('400.3.8','Sekolah Menengah Atas'),
                ('400.3.10','Pendidik dan Tenaga Pendidik (SKP/Penilaian Prestasi)'),
                ('400.3.12','Data dan Statistik Pendidikan'),
                ('400.4','KEOLAHRAGAAN'),
                ('400.4.2','Olahraga Pendidikan'),
                ('400.4.3','Olahraga Rekreasi (Massal/Tradisional)'),
                ('400.5','KEPEMUDAAN'),
                ('400.5.2','Peningkatan Tenaga dan Sumber Daya Pemuda (Duta Pemuda)'),
                ('400.5.6','Kepemimpinan dan Kepeloporan Pemuda'),
                ('400.6','KEBUDAYAAN'),
                ('400.6.2','Pelestarian Cagar Budaya dan Permuseuman'),
                ('400.6.3','Pembinaan Kesenian dan Perfilman'),
                ('400.7','KESEHATAN'),
                ('400.7.2','Upaya Kesehatan Dasar (Puskesmas/Kedokteran Keluarga)'),
                ('400.7.3','Upaya Kesehatan Rujukan (Rumah Sakit/KUK)'),
                ('400.7.8','Pengendalian Penyakit Menular (TB/AIDS/ISPA)'),
                ('400.7.10','Pengendalian Penyakit Tidak Menular (Jantung/Diabetes/Kanker)'),
                ('400.7.13','Gizi (Kewaspadaan Gizi/Stunting)'),
                ('400.7.20','Kefarmasian (Apotek/Obat Rasional)'),
                ('400.9','SOSIAL'),
                ('400.9.2','Kesejahteraan Sosial Anak'),
                ('400.9.4','Rehabilitasi Sosial (Disabilitas/Tuna Sosial)'),
                ('400.12','KEPENDUDUKAN DAN CATATAN SIPIL'),
                ('400.12.3','Pencatatan Sipil (Kelahiran/Kematian/Nikah/Cerai)'),
                ('400.12.4','Sistem Informasi Administrasi Kependudukan (SIAK)'),
                ('400.13','KELUARGA BERENCANA'),
                ('400.13.16','Kualitas Pelayanan KB Pemerintah'),
                ('400.13.26','Bina Keluarga Balita dan Anak'),
                ('500','PEREKONOMIAN'),
                ('500.1','KETAHANAN PANGAN'),
                ('500.1.2','Ketersediaan dan Kerawanan Pangan'),
                ('500.2','PERDAGANGAN'),
                ('500.2.2','Perdagangan Dalam Negeri (Pasar/UMKM)'),
                ('500.3','KOPERASI DAN USAHA KECIL MENENGAH'),
                ('500.3.4','Pembiayaan (Simpan Pinjam/Kredit)'),
                ('500.4','KEHUTANAN'),
                ('500.4.3','Planologi Kehutanan (Tata Ruang Hutan)'),
                ('500.4.6','Perlindungan Hutan dan Konservasi Alam'),
                ('500.5','KELAUTAN DAN PERIKANAN'),
                ('500.5.2','Perikanan Tangkap (Kapal/Alat Tangkap)'),
                ('500.5.3','Perikanan Budidaya (Benih/Hama Penyakit)'),
                ('500.6','PERTANIAN'),
                ('500.6.2','Perlindungan Hortikultura'),
                ('500.6.10','Budidaya Serealia (Padi/Jagung)'),
                ('500.9','PERINDUSTRIAN'),
                ('500.10','ENERGI DAN SUMBER DAYA MINERAL'),
                ('500.10.7','Hulu Minyak dan Gas Bumi (Eksplorasi/Eksploitasi)'),
                ('500.10.12','Panas Bumi'),
                ('500.11','PERHUBUNGAN'),
                ('500.11.2','Jaringan Prasarana (Terminal Tipe A/B/C)'),
                ('500.11.8','Angkutan Penumpang (Tarif/Izin Trayek)'),
                ('500.12','KOMUNIKASI DAN INFORMATIKA'),
                ('500.12.6','e-Government (Tata Kelola/Aplikasi)'),
                ('600','PEKERJAAN UMUM DAN KETENAGAAN'),
                ('600.1','PEKERJAAN UMUM'),
                ('600.1.2','Penatagunaan Sumber Daya Air'),
                ('600.1.7','Pengembangan Jaringan Jalan'),
                ('600.1.16','Sistem Penyediaan Air Minum (SPAM)'),
                ('600.2','PERUMAHAN RAKYAT DAN KAWASAN PEMUKIMAN'),
                ('600.2.10','Penyelenggaraan Jasa Konstruksi'),
                ('700','PENGAWASAN'),
                ('700.1','PENGAWASAN INTERNAL'),
                ('700.1.2','Pelaksanaan Pengawasan (Audit LHA/LHP/LHAI/Korupsi)'),
                ('800','KEPEGAWAIAN'),
                ('800.1','SUMBER DAYA MANUSIA'),
                ('800.1.2','Formasi dan Pengadaan Pegawai (CPNS/PPPK)'),
                ('800.1.3','Mutasi Pegawai (Pindah Instansi/Kenaikan Pangkat)'),
                ('800.1.4','Pengembangan Karir (Tugas Belajar/Ujian Dinas)'),
                ('800.1.6','Kode Etik Disiplin dan Pensiun'),
                ('800.1.11','Administrasi Pegawai (Cuti/Karpeg/DUK)'),
                ('800.1.12','Kesejahteraan Pegawai (BPJS/Tali Kasih)'),
                ('900','KEUANGAN'),
                ('900.1','KEUANGAN DAERAH'),
                ('900.1.1','Penyusunan RAPBD / APBD-P'),
                ('900.1.3','Pelaksanaan Anggaran (SPP/SPM/SP2D)'),
                ('900.1.13','Pendapatan dan Investasi Daerah (Pajak/Retribusi/BUMD)'),
                ('900.1.14','Fasilitasi Dana Perimbangan (DAU/DAK/DBH)');";
                $this->conn->exec($seedKlas);
            }

            // Table: surat (Legacy / Compatibility)
            $querySurat = "CREATE TABLE IF NOT EXISTS `surat` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `nomorSurat` VARCHAR(150) NULL,
                `pengirim` VARCHAR(150) NOT NULL,
                `tanggalPengajuan` DATETIME NOT NULL,
                `tanggalSurat` DATE NOT NULL,
                `klasifikasi` VARCHAR(100) NULL,
                `kodeKlasifikasi` VARCHAR(50) NULL,
                `perihal` TEXT NOT NULL,
                `bidang` VARCHAR(50) NOT NULL,
                `status` VARCHAR(30) NOT NULL DEFAULT 'Menunggu',
                `statusHistory` TEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($querySurat);

            // Table: nomor_stok (SOP Penomoran Harian)
            $queryStok = "CREATE TABLE IF NOT EXISTS `nomor_stok` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `tanggal` DATE NOT NULL,
                `urutan` INT NOT NULL,
                `suffix` VARCHAR(5) NOT NULL DEFAULT '',
                `nomor_full_stok` VARCHAR(20) NOT NULL,
                `status` ENUM('tersedia','terpakai') NOT NULL DEFAULT 'tersedia',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY `unique_stok` (`tanggal`,`urutan`,`suffix`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryStok);

            // Table: hari_libur_nasional
            $queryLibur = "CREATE TABLE IF NOT EXISTS `hari_libur_nasional` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `tanggal` DATE UNIQUE NOT NULL,
                `keterangan` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryLibur);

            // Ensure 24 hari_libur_nasional 2026 are seeded/available
            $seedLibur = "INSERT IGNORE INTO `hari_libur_nasional` (`tanggal`, `keterangan`) VALUES
            ('2026-01-01', 'Tahun Baru 2026 Masehi'),
            ('2026-01-16', 'Isra Mikraj Nabi Muhammad SAW'),
            ('2026-02-16', 'Cuti Bersama Tahun Baru Imlek'),
            ('2026-02-17', 'Tahun Baru Imlek 2577 Kongzili'),
            ('2026-03-18', 'Cuti Bersama Hari Suci Nyepi'),
            ('2026-03-19', 'Hari Suci Nyepi (Tahun Baru Saka 1948)'),
            ('2026-03-20', 'Cuti Bersama Idul Fitri 1447 H'),
            ('2026-03-21', 'Hari Raya Idul Fitri 1447 Hijriah'),
            ('2026-03-22', 'Hari Raya Idul Fitri 1447 Hijriah'),
            ('2026-03-23', 'Cuti Bersama Idul Fitri 1447 H'),
            ('2026-03-24', 'Cuti Bersama Idul Fitri 1447 H'),
            ('2026-04-03', 'Wafat Yesus Kristus'),
            ('2026-04-05', 'Kebangkitan Yesus Kristus (Paskah)'),
            ('2026-05-01', 'Hari Buruh Internasional'),
            ('2026-05-14', 'Kenaikan Yesus Kristus'),
            ('2026-05-15', 'Cuti Bersama Kenaikan Yesus Kristus'),
            ('2026-05-27', 'Idul Adha 1447 Hijriah'),
            ('2026-05-28', 'Cuti Bersama Idul Adha 1447 H'),
            ('2026-05-31', 'Hari Raya Waisak 2570 BE'),
            ('2026-06-01', 'Hari Lahir Pancasila'),
            ('2026-06-16', '1 Muharram Tahun Baru Islam 1448 Hijriah'),
            ('2026-08-17', 'Proklamasi Kemerdekaan Republik Indonesia ke-81'),
            ('2026-08-25', 'Maulid Nabi Muhammad SAW'),
            ('2026-12-24', 'Cuti Bersama Hari Raya Natal'),
            ('2026-12-25', 'Hari Raya Natal');";
            $this->conn->exec($seedLibur);

            // Table: pengajuan_surat (SOP Sekretariat DISKOMINFO)
            $queryPengajuan = "CREATE TABLE IF NOT EXISTS `pengajuan_surat` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NULL,
                `pengirim` VARCHAR(150) NOT NULL,
                `tanggalPengajuan` DATETIME NOT NULL,
                `tanggalSurat` DATE NOT NULL,
                `klasifikasi_id` INT NULL,
                `kodeKlasifikasi` VARCHAR(50) NULL,
                `klasifikasi` VARCHAR(150) NULL,
                `perihal` TEXT NOT NULL,
                `bidang` VARCHAR(50) NOT NULL,
                `status` VARCHAR(30) NOT NULL DEFAULT 'Menunggu',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY `fk_pengajuan_user` (`user_id`),
                KEY `fk_pengajuan_klasifikasi` (`klasifikasi_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryPengajuan);

            // Table: nomor_terpakai
            $queryTerpakai = "CREATE TABLE IF NOT EXISTS `nomor_terpakai` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `pengajuan_id` INT NOT NULL,
                `nomor_stok_id` INT NULL,
                `nomor_surat` VARCHAR(150) NOT NULL,
                `kode_klasifikasi` VARCHAR(50) NOT NULL,
                `assigned_by` INT NULL,
                `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY `fk_terpakai_pengajuan` (`pengajuan_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryTerpakai);

            // Table: status_history
            $queryHistory = "CREATE TABLE IF NOT EXISTS `status_history` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `pengajuan_id` INT NOT NULL,
                `status` VARCHAR(50) NOT NULL,
                `keterangan` TEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY `fk_history_pengajuan` (`pengajuan_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryHistory);

            // Seed pengajuan_surat if empty
            $stmtP = $this->conn->query("SELECT COUNT(*) FROM `pengajuan_surat`");
            if ($stmtP->fetchColumn() == 0) {
                $now = date('Y-m-d H:i:s');
                $seedP = $this->conn->prepare("INSERT INTO `pengajuan_surat` (`pengirim`, `tanggalPengajuan`, `tanggalSurat`, `klasifikasi`, `kodeKlasifikasi`, `perihal`, `bidang`, `status`) VALUES
                ('Budi Santoso (Kepala Seksi)', ?, '2026-07-10', 'Aplikasi Informatika', '481', 'Undangan Koordinasi Aplikasi e-Government', 'APTIKA', 'Selesai'),
                ('Siti Aminah (Staf Persandian)', ?, '2026-07-11', 'Persandian dan Keamanan Informasi', '482', 'Laporan Audit Keamanan Jaringan & Siber Dinas', 'PERSANDIAN', 'Menunggu'),
                ('Ahmad Fauzi (Analis Data)', ?, '2026-07-11', 'Pengolahan Data dan Statistik', '483', 'Permohonan Publikasi Data Statistik Sektoral 2026', 'PDE', 'Selesai'),
                ('Rina Lestari (Humas & IKP)', ?, '2026-07-12', 'Hubungan Masyarakat dan Komunikasi Publik', '484', 'Jadwal Siaran Pers dan Liputan Kegiatan Pimpinan', 'HUMAS', 'Menunggu')");
                $seedP->execute([$now, $now, $now, $now]);

                $this->conn->exec("INSERT INTO `nomor_terpakai` (`pengajuan_id`, `nomor_surat`, `kode_klasifikasi`, `assigned_at`) VALUES
                (1, '481/1/DISKOMINFO/VII/2026', '481', '$now'),
                (3, '483/2/DISKOMINFO/VII/2026', '483', '$now')");

                $this->conn->exec("INSERT INTO `status_history` (`pengajuan_id`, `status`, `keterangan`, `created_at`) VALUES
                (1, 'Pengajuan dibuat', 'Migrasi sistem awal', '$now'),
                (1, 'Nomor surat diterbitkan', '481/1/DISKOMINFO/VII/2026', '$now'),
                (2, 'Pengajuan dibuat', 'Migrasi sistem awal', '$now'),
                (3, 'Pengajuan dibuat', 'Migrasi sistem awal', '$now'),
                (3, 'Nomor surat diterbitkan', '483/2/DISKOMINFO/VII/2026', '$now'),
                (4, 'Pengajuan dibuat', 'Migrasi sistem awal', '$now')");
            }

            // Table: activity_logs
            $queryLogs = "CREATE TABLE IF NOT EXISTS `activity_logs` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `timestamp` DATETIME NOT NULL,
                `message` TEXT NOT NULL,
                `user` VARCHAR(100) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->conn->exec($queryLogs);

            // Seed logs if empty
            $stmtL = $this->conn->query("SELECT COUNT(*) FROM `activity_logs`");
            if ($stmtL->fetchColumn() == 0) {
                $seedLogs = $this->conn->prepare("INSERT INTO `activity_logs` (`timestamp`, `message`, `user`) VALUES (?, 'Sistem e-Surat DISKOMINFO terhubung ke database MySQL', 'System')");
                $seedLogs->execute([date('Y-m-d H:i:s')]);
            }
        } catch(Exception $e) {
            // Silent error on init tables if permissions are restricted
            error_log("Table initialization note: " . $e->getMessage());
        }
    }
}
?>
