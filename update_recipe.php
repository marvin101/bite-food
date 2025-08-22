<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

if (!$conn) {
    http_response_code(503);
    echo json_encode(['error' => 'Service unavailable']);
    exit;
}
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

// parse JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data || empty($data['id']) || !isset($data['title'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$recipe_id = (int)$data['id'];
$title = trim($data['title']);
$ingredients = trim($data['ingredients'] ?? '');
$instructions = trim($data['instructions'] ?? '');

if ($title === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Title required']);
    exit;
}

// ensure recipe belongs to current user
$uid = (int)$_SESSION['user_id'];
$check = $conn->prepare("SELECT id FROM recipes WHERE id = ? AND user_id = ? LIMIT 1");
if ($check === false) {
    error_log('update_recipe prepare failed: ' . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}
$check->bind_param("ii", $recipe_id, $uid);
$check->execute();
$res = $check->get_result();
if (!$res || $res->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Recipe not found or access denied']);
    $check->close();
    exit;
}
$check->close();

// perform update
$up = $conn->prepare("UPDATE recipes SET title = ?, ingredients = ?, instructions = ? WHERE id = ? AND user_id = ?");
if ($up === false) {
    error_log('update_recipe prepare failed: ' . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}
$up->bind_param("sssii", $title, $ingredients, $instructions, $recipe_id, $uid);
if ($up->execute()) {
    echo json_encode(['success' => true]);
} else {
    error_log('update_recipe execute failed: ' . $up->error);
    http_response_code(500);
    echo json_encode(['error' => 'Could not save changes']);
}
$up->close();
$conn->close();
?>
