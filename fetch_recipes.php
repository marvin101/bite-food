<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo "<p>Please log in to see your recipes.</p>";
    exit();
}

$stmt = $conn->prepare("SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "<p>No recipes posted yet.</p>";
} else {
    while ($row = $result->fetch_assoc()) {
        echo "<div class='recipe-card'>";
        echo "<h3>" . htmlspecialchars($row['title']) . "</h3>";
        if ($row['image_url']) {
            echo "<img src='" . htmlspecialchars($row['image_url']) . "' width='200'>";
        }
        echo "<p><strong>Ingredients:</strong> " . htmlspecialchars($row['ingredients']) . "</p>";
        echo "<p><strong>Instructions:</strong><br>" . nl2br(htmlspecialchars($row['instructions'])) . "</p>";
        echo "<hr>";
        echo "</div>";
    }
}
?>
