<?php
session_start();
require 'db.php';
header('Content-Type: text/html; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
	http_response_code(401);
	echo '<div class="text-muted">Please log in to see liked recipes.</div>';
	exit;
}
$user_id = intval($_SESSION['user_id']);

$conn->query("CREATE TABLE IF NOT EXISTS user_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    ingredients TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY user_meal (user_id, meal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$stmt = $conn->prepare("SELECT meal_id, title, thumbnail, ingredients, instructions, created_at FROM user_likes WHERE user_id = ? ORDER BY created_at DESC");
if (!$stmt) {
	echo '<div class="text-muted">No liked recipes yet.</div>';
	exit;
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

if (!$res || $res->num_rows === 0) {
	echo '<div class="text-muted">No liked recipes yet.</div>';
	$stmt->close();
	exit;
}

$out = '<div class="row g-3 liked-compact-grid">';
while ($row = $res->fetch_assoc()) {
    $title = htmlspecialchars($row['title']);
    $thumb = !empty($row['thumbnail']) ? htmlspecialchars($row['thumbnail']) : '';
    $ingredients = !empty($row['ingredients']) ? htmlspecialchars($row['ingredients']) : '';
    $instr = !empty($row['instructions']) ? htmlspecialchars($row['instructions']) : '';

    $out .= '<div class="col-6 col-md-4 col-lg-3">';
    $out .= '<div class="liked-item" data-mealid="'.htmlspecialchars($row['meal_id']).'">';
    if ($thumb) {
        $out .= '<div class="liked-thumb-wrap"><img src="'.$thumb.'" alt="'.$title.'" class="liked-thumb"></div>';
    } else {
        $out .= '<div class="liked-thumb-wrap placeholder-thumb"></div>';
    }
    $out .= '<div class="liked-title">'. $title .'</div>';
    // hidden details (revealed on click)
    $out .= '<div class="liked-details" aria-hidden="true" style="display:none;">';
    if ($ingredients) $out .= '<div class="recipe-card-ingredients"><b>Ingredients:</b> '. $ingredients .'</div>';
    if ($instr) $out .= '<div class="recipe-card-instructions"><b>Instructions:</b> '. nl2br($instr) .'</div>';
    $out .= '</div>'; // liked-details
    $out .= '</div>'; // liked-item
    $out .= '</div>'; // col
}
$out .= '</div>';

$stmt->close();
echo $out;
?>
