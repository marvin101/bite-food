<?php
session_start();
// Prevent caching so Back won't show a protected page after logout
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: signin.php");
    exit();
}
$user_id = $_SESSION['user_id'];

// Check if $conn is valid and handle DB errors
if (!$conn) {
    die("Database connection failed: " . $conn->connect_error);
}

// --- Handle profile update POST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // basic sanitization
    $new_username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $new_email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $new_region = isset($_POST['region']) ? trim($_POST['region']) : '';

    // Ensure region column exists
    $colCheck = $conn->query("SHOW COLUMNS FROM `users` LIKE 'region'");
    if ($colCheck->num_rows === 0) {
        $conn->query("ALTER TABLE `users` ADD COLUMN `region` VARCHAR(100) DEFAULT NULL");
    }

    // Handle profile picture upload
    $profile_pic_path = null;
    if (!empty($_FILES['profile_pic']['name']) && isset($_FILES['profile_pic']['tmp_name'])) {
        $target_dir = "uploads/";
        if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);
        $filename = time() . "_" . basename($_FILES["profile_pic"]["name"]);
        $target_file = $target_dir . $filename;
        if (move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $target_file)) {
            $profile_pic_path = $target_file;
        }
    }

    // Build update query (conditionally include profile_pic and username)
    if ($profile_pic_path) {
        $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, region = ?, profile_pic = ? WHERE id = ?");
        $stmt->bind_param("ssssi", $new_username, $new_email, $new_region, $profile_pic_path, $user_id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, region = ? WHERE id = ?");
        $stmt->bind_param("sssi", $new_username, $new_email, $new_region, $user_id);
    }
    $stmt->execute();
    $stmt->close();

    // update session if needed
    if ($new_username) $_SESSION['username'] = $new_username;
    if ($new_email) $_SESSION['email'] = $new_email;

    // After update, continue to fetch fresh data below
}

// --- Fetch latest user data ---
$stmt = $conn->prepare("SELECT username, email, profile_pic, IFNULL(region, '') AS region FROM users WHERE id = ?");
if (!$stmt) {
    die("SQL error: " . $conn->error);
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

$username = $user['username'] ?? '';
$email = $user['email'] ?? '';
$profile_pic = $user['profile_pic'] ?? '';
$region = $user['region'] ?? '';

// Use default-avatar.jpg if no profile_pic or file missing
$avatar = (!empty($profile_pic) && file_exists($profile_pic)) ? htmlspecialchars($profile_pic) : 'default-avatar.jpg';

// --- Fetch liked recipes for this user ---
$liked_html = '<div class="text-muted">No liked recipes yet.</div>';
$lstmt = $conn->prepare("SELECT meal_id, title, thumbnail, ingredients, instructions, created_at FROM user_likes WHERE user_id = ? ORDER BY created_at DESC");
if ($lstmt) {
    $lstmt->bind_param("i", $user_id);
    $lstmt->execute();
    $lres = $lstmt->get_result();
    if ($lres && $lres->num_rows > 0) {
        $liked_html = '<div class="row g-3">';
        while ($lr = $lres->fetch_assoc()) {
            $liked_html .= '<div class="col-12 col-sm-6 col-md-4">';
            $liked_html .= '<div class="recipe-card">';
            if (!empty($lr['thumbnail'])) {
                $liked_html .= '<img src="'.htmlspecialchars($lr['thumbnail']).'" alt="'.htmlspecialchars($lr['title']).'" style="width:100%;height:140px;object-fit:cover;border-radius:8px;margin-bottom:8px;">';
            }
            $liked_html .= '<div class="recipe-card-title">'.htmlspecialchars($lr['title']).'</div>';
            if (!empty($lr['ingredients'])) $liked_html .= '<div class="recipe-card-ingredients"><b>Ingredients:</b> '.htmlspecialchars($lr['ingredients']).'</div>';
            if (!empty($lr['instructions'])) $liked_html .= '<div class="recipe-card-instructions"><b>Instructions:</b> '.htmlspecialchars(mb_substr($lr['instructions'],0,250)).(mb_strlen($lr['instructions'])>250?'...':'').'</div>';
            $liked_html .= '</div></div>';
        }
        $liked_html .= '</div>';
    }
    $lstmt->close();
}

// --- Load profile.html and replace placeholders ---
$html = file_get_contents('profile.html');
$html = str_replace(
    ['{{PROFILE_IMG}}', '{{USERNAME}}', '{{EMAIL}}', '{{REGION}}', '{{LIKED_RECIPES}}'],
    [htmlspecialchars($avatar ?? 'default-avatar.jpg'), htmlspecialchars($username ?? ''), htmlspecialchars($email ?? ''), htmlspecialchars($region ?? ''), $liked_html],
    $html
);
echo $html;
exit;
?>
