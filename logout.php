<?php
require 'db.php';

// Start session, destroy it and prevent caching on the response
if (session_status() === PHP_SESSION_NONE) session_start();

// Prevent caching of this response
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

session_unset();
session_destroy();

// Redirect to login (replace with signin.php or signin.html as you prefer)
header("Location: signin.php");
exit;
?>