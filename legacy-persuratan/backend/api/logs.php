<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50");
    $logs = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $logs[] = [
            "id" => (int)$row['id'],
            "timestamp" => date('c', strtotime($row['timestamp'])),
            "message" => $row['message'],
            "user" => $row['user']
        ];
    }
    echo json_encode($logs);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $message = $input['message'] ?? '';
    $user = $input['user'] ?? 'System';

    if (empty($message)) {
        http_response_code(400);
        echo json_encode(["message" => "Pesan log wajib diisi."]);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO activity_logs (timestamp, message, user) VALUES (NOW(), ?, ?)");
    $stmt->execute([$message, $user]);

    http_response_code(201);
    echo json_encode(["message" => "Log dicatat."]);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Metode tidak diizinkan."]);
}
?>
