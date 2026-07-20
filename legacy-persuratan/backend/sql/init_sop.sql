CREATE TABLE IF NOT EXISTS `nomor_stok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tanggal` date NOT NULL,
  `urutan` int NOT NULL,
  `suffix` varchar(5) NOT NULL DEFAULT '',
  `nomor_full_stok` varchar(20) NOT NULL,
  `status` enum('tersedia','terpakai') NOT NULL DEFAULT 'tersedia',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stok` (`tanggal`,`urutan`,`suffix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pengajuan_surat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL,
  `pengirim` varchar(150) NOT NULL,
  `tanggalPengajuan` datetime NOT NULL,
  `tanggalSurat` date NOT NULL,
  `klasifikasi_id` int NULL,
  `kodeKlasifikasi` varchar(50) NULL,
  `klasifikasi` varchar(150) NULL,
  `perihal` text NOT NULL,
  `bidang` varchar(50) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Menunggu',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pengajuan_user` (`user_id`),
  KEY `fk_pengajuan_klasifikasi` (`klasifikasi_id`),
  CONSTRAINT `fk_pengajuan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pengajuan_klasifikasi` FOREIGN KEY (`klasifikasi_id`) REFERENCES `klasifikasi` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nomor_terpakai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pengajuan_id` int NOT NULL,
  `nomor_stok_id` int NULL,
  `nomor_surat` varchar(150) NOT NULL,
  `kode_klasifikasi` varchar(50) NOT NULL,
  `assigned_by` int NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_terpakai_pengajuan` (`pengajuan_id`),
  KEY `fk_terpakai_stok` (`nomor_stok_id`),
  KEY `fk_terpakai_user` (`assigned_by`),
  CONSTRAINT `fk_terpakai_pengajuan` FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan_surat` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_terpakai_stok` FOREIGN KEY (`nomor_stok_id`) REFERENCES `nomor_stok` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_terpakai_user` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pengajuan_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `keterangan` text NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_history_pengajuan` (`pengajuan_id`),
  CONSTRAINT `fk_history_pengajuan` FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan_surat` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pengajuan_surat` (`id`, `pengirim`, `tanggalPengajuan`, `tanggalSurat`, `kodeKlasifikasi`, `klasifikasi`, `perihal`, `bidang`, `status`, `created_at`)
SELECT `id`, `pengirim`, `tanggalPengajuan`, `tanggalSurat`, `kodeKlasifikasi`, `klasifikasi`, `perihal`, `bidang`, `status`, `created_at`
FROM `surat`
WHERE NOT EXISTS (SELECT 1 FROM `pengajuan_surat` WHERE `pengajuan_surat`.`id` = `surat`.`id`);

INSERT INTO `nomor_terpakai` (`pengajuan_id`, `nomor_surat`, `kode_klasifikasi`, `assigned_at`)
SELECT `id`, `nomorSurat`, COALESCE(`kodeKlasifikasi`, '000'), `tanggalPengajuan`
FROM `surat`
WHERE `nomorSurat` IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM `nomor_terpakai` WHERE `nomor_terpakai`.`pengajuan_id` = `surat`.`id`);

INSERT INTO `status_history` (`pengajuan_id`, `status`, `keterangan`, `created_at`)
SELECT `id`, 'Pengajuan dibuat', 'Migrasi sistem awal', `tanggalPengajuan`
FROM `surat`
WHERE NOT EXISTS (SELECT 1 FROM `status_history` WHERE `status_history`.`pengajuan_id` = `surat`.`id`);

INSERT INTO `status_history` (`pengajuan_id`, `status`, `keterangan`, `created_at`)
SELECT `id`, 'Nomor surat diterbitkan', `nomorSurat`, `tanggalPengajuan`
FROM `surat`
WHERE `nomorSurat` IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM `status_history` WHERE `status_history`.`pengajuan_id` = `surat`.`id` AND `status` = 'Nomor surat diterbitkan');
