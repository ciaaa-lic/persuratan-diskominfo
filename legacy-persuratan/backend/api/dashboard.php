<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../helpers/sop_helper.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $today = date('Y-m-d');

    // Hitung workingDayIndex dan numberRange SOP
    $workingDayIndex = SOPHelper::getWorkingDaysCount($db, $today);
    $range = SOPHelper::getDailyNumberRange($workingDayIndex);
    $numberRangeStr = $range['start'] . ' - ' . $range['end'];

    // totalSurat
    $stmt1 = $db->query("SELECT COUNT(*) FROM pengajuan_surat");
    $totalSurat = (int)$stmt1->fetchColumn();

    // suratHariIni
    $stmt2 = $db->prepare("SELECT COUNT(*) FROM pengajuan_surat WHERE DATE(tanggalPengajuan) = ?");
    $stmt2->execute([$today]);
    $suratHariIni = (int)$stmt2->fetchColumn();

    // menunggu (Semua yang belum selesai/diproses)
    $stmt3 = $db->query("SELECT COUNT(*) FROM pengajuan_surat WHERE status IN ('Menunggu', 'Belum Diproses', 'Belum Selesai')");
    $menunggu = (int)$stmt3->fetchColumn();

    // selesai
    $stmt4 = $db->query("SELECT COUNT(*) FROM pengajuan_surat WHERE status IN ('Selesai', 'Disetujui', 'Ditolak')");
    $selesai = (int)$stmt4->fetchColumn();

    // nomorTerpakaiHariIni (From nomor_terpakai on today)
    $stmt5 = $db->prepare("SELECT COUNT(*) FROM nomor_terpakai WHERE DATE(assigned_at) = ?");
    $stmt5->execute([$today]);
    $nomorTerpakaiHariIni = (int)$stmt5->fetchColumn();

    echo json_encode([
        "totalSurat" => $totalSurat,
        "suratHariIni" => $suratHariIni,
        "menunggu" => $menunggu,
        "selesai" => $selesai,
        "nomorTerpakaiHariIni" => $nomorTerpakaiHariIni,
        "workingDayIndex" => $workingDayIndex,
        "numberRange" => $numberRangeStr
    ]);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Metode tidak diizinkan."]);
}
?>
