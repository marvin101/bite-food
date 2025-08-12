<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
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
        echo "<h4>" . htmlspecialchars($row['title']) . "</h4>";
        if (!empty($row['image_url'])) {
            echo "<img src='" . htmlspecialchars($row['image_url']) . "' alt='Recipe Image' style='max-width:100%;border-radius:8px;margin-bottom:10px;'>";
        }
        echo "<p><strong>Ingredients:</strong> " . htmlspecialchars($row['ingredients']) . "</p>";
        echo "<p><strong>Instructions:</strong> " . nl2br(htmlspecialchars($row['instructions'])) . "</p>";
        echo "</div>";
    }
}
?>
