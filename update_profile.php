<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

if (!empty($_FILES['profile_pic']['name'])) {
    $target_dir = "uploads/";
    if (!is_dir($target_dir)) {
        mkdir($target_dir);
    }

    $image_name = time() . "_" . basename($_FILES["profile_pic"]["name"]);
    $target_file = $target_dir . $image_name;

    if (move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $target_file)) {
        $stmt = $conn->prepare("UPDATE users SET profile_pic = ? WHERE id = ?");
        $stmt->bind_param("si", $target_file, $user_id);
        $stmt->execute();
    }
}

header("Location: profile.php");
exit();
?>
