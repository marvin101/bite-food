<?php
session_start();
require 'db.php';

// If DB helper couldn't provide a connection, stop and show friendly message
if (empty($conn)) {
    // Log to server log for admin/ops
    error_log('signin.php: no DB connection available (db.php returned null).');
    // Friendly message to the user (avoid exposing internals)
    http_response_code(503);
    echo '<h3>Service unavailable</h3><p>The authentication service is temporarily unavailable. Please try again later or contact support.</p>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$login = trim($_POST['login'] ?? ''); // username or email
	$password = $_POST['password'] ?? '';

	if ($login === '' || $password === '') {
		http_response_code(400);
		echo "Please provide username/email and password.";
		exit;
	}

	// Find user by username or email
	$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ? OR email = ? LIMIT 1");
	if ($stmt === false) {
		// prepare failed — log and show friendly message
		error_log('signin.php prepare failed: ' . $conn->error);
		http_response_code(503);
		echo '<h3>Service temporarily unavailable</h3><p>Please try again later.</p>';
		exit;
	}

	$stmt->bind_param("ss", $login, $login);
	$stmt->execute();
	$res = $stmt->get_result();
	$user = $res->fetch_assoc();
	$stmt->close();

	if (!$user) {
		echo "Invalid credentials.";
		exit;
	}

	if (!password_verify($password, $user['password'])) {
		echo "Invalid credentials.";
		exit;
	}

	// Success: set session and redirect
	session_regenerate_id(true);
	$_SESSION['user_id'] = (int)$user['id'];
	$_SESSION['username'] = $user['username'];

	// Per requirement, after signing in redirect to the public homepage (index.html)
	header("Location: index.html");
	exit;
}

// Non-POST (GET) should show the styled login page
header('Location: signin.html');
exit;
?>