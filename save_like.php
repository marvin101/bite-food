<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

if (!isset($_SESSION['user_id'])) {
	http_response_code(401);
	echo json_encode(['error' => 'Not authenticated']);
	exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data || empty($data['meal_id']) || empty($data['title'])) {
	http_response_code(400);
	echo json_encode(['error' => 'Invalid payload']);
	exit;
}

$user_id = intval($_SESSION['user_id']);
$meal_id = $conn->real_escape_string($data['meal_id']);
$title = $conn->real_escape_string($data['title']);
$thumbnail = $conn->real_escape_string($data['thumbnail'] ?? '');
$ingredients = $conn->real_escape_string($data['ingredients'] ?? '');
$instructions = $conn->real_escape_string($data['instructions'] ?? '');

// ensure table exists
$create = "CREATE TABLE IF NOT EXISTS user_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    ingredients TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY user_meal (user_id, meal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
$conn->query($create);

// toggle: check existing
$stmt = $conn->prepare("SELECT id FROM user_likes WHERE user_id = ? AND meal_id = ? LIMIT 1");
$stmt->bind_param("is", $user_id, $meal_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res && $res->num_rows > 0) {
	// remove
	$row = $res->fetch_assoc();
	$del = $conn->prepare("DELETE FROM user_likes WHERE id = ?");
	$del->bind_param("i", $row['id']);
	$del->execute();
	echo json_encode(['status' => 'removed']);
	exit;
} else {
	// insert
	$ins = $conn->prepare("INSERT INTO user_likes (user_id, meal_id, title, thumbnail, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?)");
	$ins->bind_param("isssss", $user_id, $meal_id, $title, $thumbnail, $ingredients, $instructions);
	if ($ins->execute()) {
		echo json_encode(['status' => 'added']);
		exit;
	} else {
		http_response_code(500);
		echo json_encode(['error' => 'DB error']);
		exit;
	}
}
?>
