<?php
// Ensure the mysqli extension is loaded
if (!extension_loaded('mysqli')) {
    die('The mysqli extension is not enabled in your PHP installation.');
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'user_auth');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
