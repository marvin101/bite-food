<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'db.php';
if (!$conn) {
    error_log('fetch_recipes.php: cannot obtain DB connection');
    echo "<p>Unable to load recipes right now.</p>";
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo "<p>Please log in to see your recipes.</p>";
    $conn->close();
    exit();
}

$stmt = $conn->prepare("SELECT id, title, image_url, ingredients, instructions FROM recipes WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "<p>No recipes posted yet.</p>";
} else {
    while ($row = $result->fetch_assoc()) {
        echo "<div class='recipe-card'>";
        echo "<h4>" . htmlspecialchars($row['title'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "</h4>";
        if (!empty($row['image_url'])) {
            echo "<img src='" . htmlspecialchars($row['image_url'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "' alt='Recipe Image' style='max-width:100%;border-radius:8px;margin-bottom:10px;'>";
        }
        echo "<p><strong>Ingredients:</strong> " . htmlspecialchars($row['ingredients'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "</p>";
        echo "<p><strong>Instructions:</strong> " . nl2br(htmlspecialchars($row['instructions'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8')) . "</p>";
        echo "</div>";
    }
}

$stmt->close();
$conn->close();
?>
    echo "<p>No recipes posted yet.</p>";
} else {
    while ($row = $result->fetch_assoc()) {
        echo "<div class='recipe-card'>";
        echo "<h4>" . htmlspecialchars($row['title'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "</h4>";
        if (!empty($row['image_url'])) {
            echo "<img src='" . htmlspecialchars($row['image_url'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "' alt='Recipe Image' style='max-width:100%;border-radius:8px;margin-bottom:10px;'>";
        }
        echo "<p><strong>Ingredients:</strong> " . htmlspecialchars($row['ingredients'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "</p>";
        echo "<p><strong>Instructions:</strong> " . nl2br(htmlspecialchars($row['instructions'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8')) . "</p>";
        echo "</div>";
    }
}

$stmt->close();
$conn->close();
?>
