<?php
session_start();

// Replace local connection helper with shared db.php
require_once 'db.php';
if (!$conn) {
	error_log('signup.php: cannot obtain DB connection');
	echo "Service temporarily unavailable. Try again later.";
	exit;
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

	try {
		// $conn provided by db.php

		// Ensure users table exists (keep as safe, idempotent DDL)
		$createSql = "CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(50) NOT NULL UNIQUE,
			email VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			profile_pic VARCHAR(255) DEFAULT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
		$conn->query($createSql);

		// Check uniqueness (prepared)
		$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
		$stmt->bind_param("ss", $username, $email);
		$stmt->execute();
		$stmt->store_result();
		if ($stmt->num_rows > 0) {
			$stmt->close();
			$conn->close();
			echo "Username or email already in use.";
			exit;
		}
		$stmt->close();

		// Hash password and insert (prepared)
		$hash = password_hash($password, PASSWORD_DEFAULT);
		$ins = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
		$ins->bind_param("sss", $username, $email, $hash);
		if ($ins->execute()) {
			$user_id = $ins->insert_id;
			// Regenerate session id to prevent fixation and store minimal session info
			session_regenerate_id(true);
			$_SESSION['user_id'] = (int)$user_id;
			$_SESSION['username'] = $username;
			$ins->close();
			$conn->close();
			// After signing in, go to the public homepage (index.html)
			header("Location: index.html");
			exit;
		} else {
			// log internal error, do not expose to user
			error_log('Signup insert error: ' . $conn->error);
			$ins->close();
			$conn->close();
			echo "Error creating account.";
			exit;
		}
	} catch (Throwable $e) {
		error_log('Signup error: ' . $e->getMessage());
		echo "An internal error occurred. Try again later.";
		exit;
	}
}

$conn->close();
?>