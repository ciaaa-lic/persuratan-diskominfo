<?php

class SOPHelper {
    /**
     * Menghitung jumlah hari kerja sejak 1 Januari tahun targetDate s.d. targetDate.
     * Mengabaikan Sabtu (6), Minggu (7), dan tanggal di tabel hari_libur_nasional.
     */
    public static function getWorkingDaysCount(PDO $db, string $targetDate): int {
        $year = date('Y', strtotime($targetDate));
        
        $stmtLibur = $db->prepare("SELECT tanggal FROM hari_libur_nasional WHERE YEAR(tanggal) = ?");
        $stmtLibur->execute([$year]);
        $liburArray = $stmtLibur->fetchAll(PDO::FETCH_COLUMN) ?: [];

        $startTs = strtotime("$year-01-01");
        $endTs = strtotime($targetDate);
        $workingDays = 0;

        for ($ts = $startTs; $ts <= $endTs; $ts += 86400) {
            $dayOfWeek = (int)date('N', $ts); // 1 = Senin ... 6 = Sabtu, 7 = Minggu
            $currDate = date('Y-m-d', $ts);
            
            if ($dayOfWeek === 6 || $dayOfWeek === 7) {
                continue;
            }
            if (in_array($currDate, $liburArray)) {
                continue;
            }
            $workingDays++;
        }

        // Jika workingDays 0 (misal 1 Januari adalah libur dan belum ada hari kerja), kembalikan minimal 1 agar tidak 0
        return max(1, $workingDays);
    }

    /**
     * Mengembalikan rentang nomor dasar untuk hari kerja ke-W:
     * start: ((W - 1) * 40) + 1
     * end: W * 40
     */
    public static function getDailyNumberRange(int $workingDayIndex): array {
        $startNum = (($workingDayIndex - 1) * 40) + 1;
        $endNum = $workingDayIndex * 40;
        return ['start' => $startNum, 'end' => $endNum];
    }

    /**
     * Memastikan stok blok awal (tanpa suffix) untuk tanggal & rentang hari kerja tersebut tersedia.
     * Mengembalikan stokRow pertama yang 'tersedia'. Jika habis, otomatis membuat blok suffix berikutnya (A..Z).
     */
    public static function ensureAndGetAvailableStock(PDO $db, string $targetDate): array {
        $workingDayIndex = self::getWorkingDaysCount($db, $targetDate);
        $range = self::getDailyNumberRange($workingDayIndex);
        $startNum = $range['start'];
        $endNum = $range['end'];

        // Cek apakah stok dasar (suffix '') pada rentang hari tersebut sudah ada di nomor_stok
        $stmtCheck = $db->prepare("SELECT COUNT(*) FROM nomor_stok WHERE tanggal = ? AND urutan >= ? AND urutan <= ?");
        $stmtCheck->execute([$targetDate, $startNum, $endNum]);
        if ($stmtCheck->fetchColumn() == 0) {
            $insStok = $db->prepare("INSERT IGNORE INTO nomor_stok (tanggal, urutan, suffix, nomor_full_stok, status) VALUES (?, ?, '', ?, 'tersedia')");
            for ($u = $startNum; $u <= $endNum; $u++) {
                $insStok->execute([$targetDate, $u, (string)$u]);
            }
        }

        // Cari stok pertama yang tersedia pada rentang hari ini
        $stmtFind = $db->prepare("SELECT * FROM nomor_stok WHERE tanggal = ? AND urutan >= ? AND urutan <= ? AND status = 'tersedia' ORDER BY id ASC LIMIT 1");
        $stmtFind->execute([$targetDate, $startNum, $endNum]);
        $stokRow = $stmtFind->fetch(PDO::FETCH_ASSOC);

        if (!$stokRow) {
            // Jika semua stok di rentang ini terpakai, cari suffix terakhir yang pernah dibuat di rentang ini
            $stmtLastSuff = $db->prepare("SELECT suffix FROM nomor_stok WHERE tanggal = ? AND urutan >= ? AND urutan <= ? ORDER BY id DESC LIMIT 1");
            $stmtLastSuff->execute([$targetDate, $startNum, $endNum]);
            $lastSuff = $stmtLastSuff->fetchColumn() ?: '';

            $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $nextSuff = 'A';
            if ($lastSuff !== '') {
                $pos = strpos($alphabet, $lastSuff);
                if ($pos !== false && $pos < 25) {
                    $nextSuff = $alphabet[$pos + 1];
                } else {
                    $nextSuff = 'Z';
                }
            }

            $insStok = $db->prepare("INSERT IGNORE INTO nomor_stok (tanggal, urutan, suffix, nomor_full_stok, status) VALUES (?, ?, ?, ?, 'tersedia')");
            for ($u = $startNum; $u <= $endNum; $u++) {
                $fullStok = $u . '.' . $nextSuff;
                $insStok->execute([$targetDate, $u, $nextSuff, $fullStok]);
            }

            $stmtFind->execute([$targetDate, $startNum, $endNum]);
            $stokRow = $stmtFind->fetch(PDO::FETCH_ASSOC);
        }

        return [
            'stokRow' => $stokRow,
            'workingDayIndex' => $workingDayIndex,
            'startNum' => $startNum,
            'endNum' => $endNum
        ];
    }

    /**
     * Mengembalikan ringkasan stok nomor harian untuk Dasbor Admin
     */
    public static function getStokSummary(PDO $db, string $targetDate): array {
        $workingDayIndex = self::getWorkingDaysCount($db, $targetDate);
        $range = self::getDailyNumberRange($workingDayIndex);
        $startNum = $range['start'];
        $endNum = $range['end'];

        // Pastikan stok dasar tersedia
        self::ensureAndGetAvailableStock($db, $targetDate);

        $stmt = $db->prepare("SELECT suffix, COUNT(*) as total, 
                              SUM(CASE WHEN status = 'terpakai' THEN 1 ELSE 0 END) as used 
                              FROM nomor_stok 
                              WHERE tanggal = ? AND urutan >= ? AND urutan <= ? 
                              GROUP BY suffix ORDER BY MIN(id) ASC");
        $stmt->execute([$targetDate, $startNum, $endNum]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtTotal = $db->prepare("SELECT COUNT(*) FROM nomor_terpakai WHERE DATE(assigned_at) = ?");
        $stmtTotal->execute([$targetDate]);
        $totalTerpakai = $stmtTotal->fetchColumn();

        return [
            'tanggal' => $targetDate,
            'workingDayIndex' => $workingDayIndex,
            'numberRange' => $startNum . ' - ' . $endNum,
            'totalTerpakai' => (int)$totalTerpakai,
            'groups' => $groups
        ];
    }
}
?>
