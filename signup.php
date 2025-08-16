<?php
session_start();
require 'db.php';

$conn = new mysqli("localhost", "root", "", "user_auth");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$username = trim($_POST['username'] ?? '');
	$email    = trim($_POST['email'] ?? '');
	$password = $_POST['password'] ?? '';

	// Basic validation
	if ($username === '' || $email === '' || $password === '') {
		http_response_code(400);
		echo "All fields are required.";
		exit;
	}
	if (strlen($username) > 50) {
		echo "Username too long.";
		exit;
	}

	// Ensure users table exists
	$createSql = "CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(50) NOT NULL UNIQUE,
		email VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		profile_pic VARCHAR(255) DEFAULT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
	$conn->query($createSql);

	// Check uniqueness
	$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
	$stmt->bind_param("ss", $username, $email);
	$stmt->execute();
	$stmt->store_result();
	if ($stmt->num_rows > 0) {
		$stmt->close();
		echo "Username or email already in use.";
		exit;
	}
	$stmt->close();

	// Hash password and insert
	$hash = password_hash($password, PASSWORD_DEFAULT);
	$ins = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
	$ins->bind_param("sss", $username, $email, $hash);
	if ($ins->execute()) {
		$user_id = $ins->insert_id;
		// Log the user in
		$_SESSION['user_id'] = $user_id;
		$_SESSION['username'] = $username;
		header("Location: dashboard.php");
		exit;
	} else {
		echo "Error creating account: " . $conn->error;
		exit;
	}
}

$conn->close();
?>