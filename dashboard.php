<?php
session_start();
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
