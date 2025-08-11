<?php
// Connect to MySQL
require 'db.php';

$conn = new mysqli("localhost", "root", "", "user_auth");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Sanitize input
$username = $conn->real_escape_string($_POST['username']);
$email = $conn->real_escape_string($_POST['email']);
$password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Secure hash

// Insert into DB
$sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";

if ($conn->query($sql) === TRUE) {
    header("Location: login.html");
    exit();
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>