<?php
// Set header agar dapat diakses dari frontend (Vue.js) yang berbeda port (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    try {
        // Cek jumlah data klasifikasi, jika kurang dari 234 (sesuai tabel SQLyog DISKOMINFO), picu re-seeding otomatis
        $cekCount = $db->query("SELECT COUNT(*) FROM klasifikasi");
        if ($cekCount->fetchColumn() < 234) {
            $database->getConnection(); // Ini memicu initTables() dan seed 234 kode klasifikasi lengkap
        }

        $query = "SELECT id, kode, uraian FROM klasifikasi ORDER BY kode ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $result = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $item = array(
                "id" => $row['id'],
                "kode" => $row['kode'],
                "uraian" => $row['uraian'],
                "deskripsi" => $row['uraian']
            );
            array_push($result, $item);
        }

        http_response_code(200);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Terjadi kesalahan saat mengambil data klasifikasi."));
    }
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Metode tidak diizinkan."));
}
?>
