<?php
session_start();
require 'db.php';

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
	$_SESSION['user_id'] = $user['id'];
	$_SESSION['username'] = $user['username'];
	header("Location: dashboard.php");
	exit;
}

// Optionally show a simple login form if GET
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Login</title></head>
<body>
<form method="post" action="login.php">
	<label for="login">Username or Email</label>
	<input id="login" name="login" type="text" placeholder="Username or email" autocomplete="username" required>
	<label for="password">Password</label>
	<input id="password" name="password" type="password" autocomplete="current-password" required>
	<button type="submit">Sign In</button>
</form>
</body>
</html>