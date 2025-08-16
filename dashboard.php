<?php
session_start();
// Prevent caching so Back won't show a protected page after logout
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}

// Pass username to HTML if needed
$username = $_SESSION['username'];

include 'header.php';
include 'dashboard.html';
include 'footer.php';
?>
