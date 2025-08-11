<?php
session_start();
require 'db.php';

if (!isset($_POST['email']) || !isset($_POST['password'])) {
    die("Email and password are required");
}

$email = $_POST['email'];
$password = $_POST['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Invalid email format");
}

$conn = new mysqli("localhost", "root", "", "user_auth");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Use prepared statements instead
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        header("Location: dashboard.php");
        exit;
    } else {
        echo "Invalid password.";
    }
} else {
    echo "No user found with that email.";
}

$stmt->close();
$conn->close();
?>