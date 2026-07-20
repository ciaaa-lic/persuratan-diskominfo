<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../helpers/sop_helper.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? ($input['action'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $bidang = $_GET['bidang'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $query = "SELECT p.*, nt.nomor_surat AS nomorSuratTerpakai 
              FROM pengajuan_surat p 
              LEFT JOIN nomor_terpakai nt ON nt.pengajuan_id = p.id ";
    $params = [];
    $conditions = [];
    
    if (!empty($bidang)) {
        $conditions[] = "p.bidang = ?";
        $params[] = $bidang;
    }
    if (!empty($search)) {
        $conditions[] = "(p.perihal LIKE ? OR p.pengirim LIKE ? OR nt.nomor_surat LIKE ? OR p.kodeKlasifikasi LIKE ?)";
        $q = "%$search%";
        $params[] = $q; $params[] = $q; $params[] = $q; $params[] = $q;
    }
    
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }
    $query .= " ORDER BY CASE WHEN p.status IN ('Selesai', 'Disetujui', 'Ditolak') THEN 3 WHEN p.status IN ('Diproses', 'Proses', 'Sedang Diproses') THEN 2 ELSE 1 END ASC, p.tanggalPengajuan ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $suratList = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['nomorSurat'] = $row['nomorSuratTerpakai'] ?? null;
        
        // Fetch status history
        $stmtH = $db->prepare("SELECT status, keterangan AS note, created_at AS date FROM status_history WHERE pengajuan_id = ? ORDER BY id ASC");
        $stmtH->execute([$row['id']]);
        $row['statusHistory'] = $stmtH->fetchAll(PDO::FETCH_ASSOC);
        if (empty($row['statusHistory'])) {
            $row['statusHistory'] = [['status' => $row['status'], 'date' => $row['tanggalPengajuan']]];
        }
        
        $suratList[] = $row;
    }
    echo json_encode($suratList);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pengirim = $input['pengirim'] ?? '';
    $perihal = $input['perihal'] ?? '';
    $bidang = $input['bidang'] ?? '';
    $tanggalSurat = $input['tanggalSurat'] ?? date('Y-m-d');
    $klasifikasi = $input['klasifikasi'] ?? '';
    $kodeKlasifikasi = $input['kodeKlasifikasi'] ?? null;

    $now = date('Y-m-d H:i:s');

    // Cek jika ini pengajuan batch/kolektif
    if ($action === 'batchCreate' && !empty($input['batchList']) && is_array($input['batchList'])) {
        $results = [];
        $stmt = $db->prepare("INSERT INTO pengajuan_surat (pengirim, perihal, bidang, tanggalSurat, tanggalPengajuan, klasifikasi, kodeKlasifikasi, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu')");
        $stmtH = $db->prepare("INSERT INTO status_history (pengajuan_id, status, keterangan, created_at) VALUES (?, 'Pengajuan dibuat', 'Pengajuan surat baru diterima (Batch)', ?)");
        $historyJson = json_encode([['status' => 'Pengajuan dibuat', 'date' => $now]]);
        $stmtSurat = $db->prepare("INSERT INTO surat (id, pengirim, perihal, bidang, tanggalSurat, tanggalPengajuan, klasifikasi, kodeKlasifikasi, status, statusHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?)");
        $stmtGet = $db->prepare("SELECT p.*, nt.nomor_surat AS nomorSuratTerpakai FROM pengajuan_surat p LEFT JOIN nomor_terpakai nt ON nt.pengajuan_id = p.id WHERE p.id = ?");

        foreach ($input['batchList'] as $item) {
            $p_pengirim = $item['pengirim'] ?? $pengirim;
            $p_perihal = $item['perihal'] ?? $perihal;
            $p_bidang = $item['bidang'] ?? $bidang;
            $p_tanggal = $item['tanggalSurat'] ?? $tanggalSurat;
            $p_klas = $item['klasifikasi'] ?? $klasifikasi;
            $p_kode = $item['kodeKlasifikasi'] ?? $kodeKlasifikasi;

            if (empty($p_pengirim) || empty($p_perihal) || empty($p_bidang)) continue;

            $stmt->execute([$p_pengirim, $p_perihal, $p_bidang, $p_tanggal, $now, $p_klas, $p_kode]);
            $id = $db->lastInsertId();
            $stmtH->execute([$id, $now]);
            $stmtSurat->execute([$id, $p_pengirim, $p_perihal, $p_bidang, $p_tanggal, $now, $p_klas, $p_kode, $historyJson]);

            $stmtGet->execute([$id]);
            $newSurat = $stmtGet->fetch(PDO::FETCH_ASSOC);
            $newSurat['nomorSurat'] = $newSurat['nomorSuratTerpakai'] ?? null;
            $newSurat['statusHistory'] = [['status' => 'Pengajuan dibuat', 'date' => $now]];
            $results[] = $newSurat;
        }

        http_response_code(201);
        echo json_encode(["message" => "Batch berhasil dibuat", "data" => $results]);
        exit;
    }

    if (empty($pengirim) || empty($perihal) || empty($bidang)) {
        http_response_code(400);
        echo json_encode(["message" => "Pengirim, perihal, dan bidang wajib diisi."]);
        exit;
    }
    
    // Insert to pengajuan_surat
    $stmt = $db->prepare("INSERT INTO pengajuan_surat (pengirim, perihal, bidang, tanggalSurat, tanggalPengajuan, klasifikasi, kodeKlasifikasi, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu')");
    $stmt->execute([$pengirim, $perihal, $bidang, $tanggalSurat, $now, $klasifikasi, $kodeKlasifikasi]);
    $id = $db->lastInsertId();

    // Insert status_history
    $stmtH = $db->prepare("INSERT INTO status_history (pengajuan_id, status, keterangan, created_at) VALUES (?, 'Pengajuan dibuat', 'Pengajuan surat baru diterima', ?)");
    $stmtH->execute([$id, $now]);
    
    // Also insert to legacy surat for backward compatibility
    $historyJson = json_encode([['status' => 'Pengajuan dibuat', 'date' => $now]]);
    $stmtSurat = $db->prepare("INSERT INTO surat (id, pengirim, perihal, bidang, tanggalSurat, tanggalPengajuan, klasifikasi, kodeKlasifikasi, status, statusHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?)");
    $stmtSurat->execute([$id, $pengirim, $perihal, $bidang, $tanggalSurat, $now, $klasifikasi, $kodeKlasifikasi, $historyJson]);
    
    $stmtGet = $db->prepare("SELECT p.*, nt.nomor_surat AS nomorSuratTerpakai FROM pengajuan_surat p LEFT JOIN nomor_terpakai nt ON nt.pengajuan_id = p.id WHERE p.id = ?");
    $stmtGet->execute([$id]);
    $newSurat = $stmtGet->fetch(PDO::FETCH_ASSOC);
    $newSurat['nomorSurat'] = $newSurat['nomorSuratTerpakai'] ?? null;
    $newSurat['statusHistory'] = [['status' => 'Pengajuan dibuat', 'date' => $now]];
    
    http_response_code(201);
    echo json_encode($newSurat);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = $_GET['id'] ?? ($input['id'] ?? '');
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["message" => "ID surat wajib disertakan."]);
        exit;
    }

    // Check if updateInfo action
    if ($action === 'updateInfo') {
        $stmtGet = $db->prepare("SELECT * FROM pengajuan_surat WHERE id = ?");
        $stmtGet->execute([$id]);
        $curr = $stmtGet->fetch(PDO::FETCH_ASSOC);
        if (!$curr) {
            http_response_code(404);
            echo json_encode(["message" => "Surat tidak ditemukan."]);
            exit;
        }
        if (!in_array($curr['status'], ['Menunggu', 'Belum Selesai', 'Belum Diproses'])) {
            http_response_code(403);
            echo json_encode(["message" => "Surat yang sudah diproses atau selesai tidak dapat diedit."]);
            exit;
        }
        $pengirim = $input['pengirim'] ?? $curr['pengirim'];
        $perihal = $input['perihal'] ?? $curr['perihal'];
        $tanggalSurat = $input['tanggalSurat'] ?? $curr['tanggalSurat'];
        $klasifikasi = $input['klasifikasi'] ?? $curr['klasifikasi'];
        $bidang = $input['bidang'] ?? $curr['bidang'];
        
        $db->prepare("UPDATE pengajuan_surat SET pengirim = ?, perihal = ?, tanggalSurat = ?, klasifikasi = ?, bidang = ? WHERE id = ?")
           ->execute([$pengirim, $perihal, $tanggalSurat, $klasifikasi, $bidang, $id]);
        $db->prepare("UPDATE surat SET pengirim = ?, perihal = ?, tanggalSurat = ?, klasifikasi = ?, bidang = ? WHERE id = ?")
           ->execute([$pengirim, $perihal, $tanggalSurat, $klasifikasi, $bidang, $id]);
           
        $stmtGet = $db->prepare("SELECT p.*, nt.nomor_surat AS nomorSuratTerpakai FROM pengajuan_surat p LEFT JOIN nomor_terpakai nt ON nt.pengajuan_id = p.id WHERE p.id = ?");
        $stmtGet->execute([$id]);
        $updated = $stmtGet->fetch(PDO::FETCH_ASSOC);
        $updated['nomorSurat'] = $updated['nomorSuratTerpakai'] ?? null;
        
        $stmtH = $db->prepare("SELECT status, keterangan AS note, created_at AS date FROM status_history WHERE pengajuan_id = ? ORDER BY id ASC");
        $stmtH->execute([$id]);
        $updated['statusHistory'] = $stmtH->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($updated);
        exit;
    }

    // Check if generate action
    if ($action === 'generateNomor' || !empty($input['kodeKlasifikasi'])) {
        $kodeKlasifikasi = $input['kodeKlasifikasi'] ?? '000';
        
        $stmtGet = $db->prepare("SELECT * FROM pengajuan_surat WHERE id = ?");
        $stmtGet->execute([$id]);
        $curr = $stmtGet->fetch(PDO::FETCH_ASSOC);
        
        if (!$curr) {
            http_response_code(404);
            echo json_encode(["message" => "Surat tidak ditemukan."]);
            exit;
        }

        $today = date('Y-m-d');
        $stokData = SOPHelper::ensureAndGetAvailableStock($db, $today);
        $stokRow = $stokData['stokRow'];

        // Mark stock as used
        if ($stokRow) {
            $db->prepare("UPDATE nomor_stok SET status = 'terpakai' WHERE id = ?")->execute([$stokRow['id']]);
            $nomorStokStr = $stokRow['nomor_full_stok'];
            $stokId = $stokRow['id'];
        } else {
            $nomorStokStr = (string)$stokData['startNum'];
            $stokId = null;
        }

        // Roman month and year
        $monthsRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        $monthRomawi = $monthsRomawi[(int)date('n') - 1];
        $year = date('Y');

        // SOP Format: [kode_klasifikasi]/[nomor]/DISKOMINFO/[bulan_romawi]/[tahun]
        $fullNomor = $kodeKlasifikasi . '/' . $nomorStokStr . '/DISKOMINFO/' . $monthRomawi . '/' . $year;
        $now = date('Y-m-d H:i:s');
        
        // Update pengajuan_surat and legacy surat
        $db->prepare("UPDATE pengajuan_surat SET status = 'Selesai', kodeKlasifikasi = ? WHERE id = ?")->execute([$kodeKlasifikasi, $id]);
        $db->prepare("UPDATE surat SET status = 'Selesai', nomorSurat = ?, kodeKlasifikasi = ? WHERE id = ?")->execute([$fullNomor, $kodeKlasifikasi, $id]);
        
        // Insert into nomor_terpakai
        $db->prepare("INSERT INTO nomor_terpakai (pengajuan_id, nomor_stok_id, nomor_surat, kode_klasifikasi, assigned_at) VALUES (?, ?, ?, ?, ?)")
           ->execute([$id, $stokId, $fullNomor, $kodeKlasifikasi, $now]);
           
        // Insert into status_history
        $db->prepare("INSERT INTO status_history (pengajuan_id, status, keterangan, created_at) VALUES (?, 'Nomor surat diterbitkan', ?, ?)")
           ->execute([$id, $fullNomor, $now]);
           
        // Return updated object
        $stmtGet = $db->prepare("SELECT p.*, nt.nomor_surat AS nomorSuratTerpakai FROM pengajuan_surat p LEFT JOIN nomor_terpakai nt ON nt.pengajuan_id = p.id WHERE p.id = ?");
        $stmtGet->execute([$id]);
        $updated = $stmtGet->fetch(PDO::FETCH_ASSOC);
        $updated['nomorSurat'] = $updated['nomorSuratTerpakai'] ?? $fullNomor;
        
        $stmtH = $db->prepare("SELECT status, keterangan AS note, created_at AS date FROM status_history WHERE pengajuan_id = ? ORDER BY id ASC");
        $stmtH->execute([$id]);
        $updated['statusHistory'] = $stmtH->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($updated);
    } else {
        // Normal update
        $stmtGet = $db->prepare("SELECT * FROM pengajuan_surat WHERE id = ?");
        $stmtGet->execute([$id]);
        $curr = $stmtGet->fetch(PDO::FETCH_ASSOC);
        if (!$curr) {
            http_response_code(404);
            echo json_encode(["message" => "Surat tidak ditemukan."]);
            exit;
        }

        $status = $input['status'] ?? $curr['status'];
        $nomorSurat = $input['nomorSurat'] ?? null;
        $now = date('Y-m-d H:i:s');
        
        if ($status !== $curr['status']) {
            $db->prepare("INSERT INTO status_history (pengajuan_id, status, keterangan, created_at) VALUES (?, ?, ?, ?)")
               ->execute([$id, $status === 'Selesai' ? 'Nomor surat diterbitkan' : 'Status Diperbarui ke ' . $status, 'Diperbarui oleh sistem/admin', $now]);
        }

        $stmtUp = $db->prepare("UPDATE pengajuan_surat SET status = ? WHERE id = ?");
        $stmtUp->execute([$status, $id]);
        
        if (!empty($nomorSurat)) {
            $db->prepare("UPDATE surat SET status = ?, nomorSurat = ? WHERE id = ?")->execute([$status, $nomorSurat, $id]);
        } else {
            $db->prepare("UPDATE surat SET status = ? WHERE id = ?")->execute([$status, $id]);
        }
        
        $stmtGet = $db->prepare("SELECT p.*, nt.nomor_surat AS nomorSuratTerpakai FROM pengajuan_surat p LEFT JOIN nomor_terpakai nt ON nt.pengajuan_id = p.id WHERE p.id = ?");
        $stmtGet->execute([$id]);
        $updated = $stmtGet->fetch(PDO::FETCH_ASSOC);
        $updated['nomorSurat'] = $updated['nomorSuratTerpakai'] ?? $nomorSurat;
        
        $stmtH = $db->prepare("SELECT status, keterangan AS note, created_at AS date FROM status_history WHERE pengajuan_id = ? ORDER BY id ASC");
        $stmtH->execute([$id]);
        $updated['statusHistory'] = $stmtH->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($updated);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? ($input['id'] ?? '');
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["message" => "ID surat wajib disertakan."]);
        exit;
    }
    
    $stmtGet = $db->prepare("SELECT status FROM pengajuan_surat WHERE id = ?");
    $stmtGet->execute([$id]);
    $curr = $stmtGet->fetch(PDO::FETCH_ASSOC);
    
    if (!$curr) {
        http_response_code(404);
        echo json_encode(["message" => "Surat tidak ditemukan."]);
        exit;
    }
    
    if (in_array($curr['status'], ['Menunggu', 'Belum Selesai', 'Belum Diproses'])) {
        $db->prepare("DELETE FROM status_history WHERE pengajuan_id = ?")->execute([$id]);
        $db->prepare("DELETE FROM pengajuan_surat WHERE id = ?")->execute([$id]);
        $db->prepare("DELETE FROM surat WHERE id = ?")->execute([$id]);
        echo json_encode(["message" => "Pengajuan surat berhasil dibatalkan."]);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Surat yang sudah diproses atau selesai tidak dapat dibatalkan."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Metode tidak diizinkan."]);
}
?>
