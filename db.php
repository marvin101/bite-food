<?php
$servername = "192.168.0.100";  // Check this in cPanel → MySQL → DB hostname
$username = "bitefood_users_db";       // The MySQL username you created
$password = "Nn4ABqdBv5SxSdqD6EX8";       // The MySQL password
$dbname = "bitefood_users_db";             // The name of your database

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
