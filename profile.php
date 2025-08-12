<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

// Check if $conn is valid and handle DB errors
if (!$conn) {
    die("Database connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("SELECT username, email, profile_pic FROM users WHERE id = ?");
if (!$stmt) {
    die("SQL error: " . $conn->error);
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email, $profile_pic);
$stmt->fetch();
$stmt->close();

// Use default-avatar.jpg if no profile_pic is set
$avatar = (!empty($profile_pic) && file_exists($profile_pic)) ? htmlspecialchars($profile_pic) : 'default-avatar.jpg';

// Load profile.html and replace placeholders
$html = file_get_contents('profile.html');
$html = str_replace(
    ['{{PROFILE_IMG}}', '{{USERNAME}}', '{{EMAIL}}'],
    [$avatar, htmlspecialchars($username), htmlspecialchars($email)],
    $html
);
echo $html;
?>
