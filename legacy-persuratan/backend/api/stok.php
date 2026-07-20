<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../helpers/sop_helper.php';

$database = new Database();
$db = $database->getConnection();

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? 'summary';
$today = $_GET['tanggal'] ?? date('Y-m-d');

if ($action === 'terpakai') {
    $stmt = $db->prepare("SELECT nt.*, p.pengirim, p.perihal, p.bidang, p.tanggalSurat 
                          FROM nomor_terpakai nt 
                          LEFT JOIN pengajuan_surat p ON nt.pengajuan_id = p.id 
                          ORDER BY nt.id DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($action === 'list_stok') {
    $workingDayIndex = SOPHelper::getWorkingDaysCount($db, $today);
    $range = SOPHelper::getDailyNumberRange($workingDayIndex);
    SOPHelper::ensureAndGetAvailableStock($db, $today);
    
    $stmt = $db->prepare("SELECT * FROM nomor_stok WHERE tanggal = ? AND urutan >= ? AND urutan <= ? ORDER BY id ASC");
    $stmt->execute([$today, $range['start'], $range['end']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    // Summary of stock usage for today using SOP helper
    echo json_encode(SOPHelper::getStokSummary($db, $today));
}
?>
