<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? ($input['action'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "Username dan password wajib diisi."]);
        exit;
    }

    $stmt = $db->prepare("SELECT id, username, password, name, role, bidang FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && $user['password'] === $password) {
        unset($user['password']);
        echo json_encode([
            "token" => "token-" . $user['username'] . "-" . time(),
            "user" => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Username atau password salah!"]);
    }
} elseif (($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') && $action === 'update_profile') {
    $id = $input['id'] ?? '';
    $name = $input['name'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["message" => "ID pengguna wajib disertakan."]);
        exit;
    }

    if (!empty($name) && !empty($password)) {
        $stmt = $db->prepare("UPDATE users SET name = ?, password = ? WHERE id = ? OR username = ?");
        $stmt->execute([$name, $password, $id, $id]);
    } elseif (!empty($name)) {
        $stmt = $db->prepare("UPDATE users SET name = ? WHERE id = ? OR username = ?");
        $stmt->execute([$name, $id, $id]);
    } elseif (!empty($password)) {
        $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ? OR username = ?");
        $stmt->execute([$password, $id, $id]);
    }

    $stmtGet = $db->prepare("SELECT id, username, name, role, bidang FROM users WHERE id = ? OR username = ?");
    $stmtGet->execute([$id, $id]);
    $updatedUser = $stmtGet->fetch(PDO::FETCH_ASSOC);

    if ($updatedUser) {
        echo json_encode(["user" => $updatedUser]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Pengguna tidak ditemukan."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT id, username, name, role, bidang FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Metode atau aksi tidak diizinkan."]);
}
?>
