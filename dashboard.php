require 'db.php';
<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
        }

        .navbar {
            background-color: #007bff;
            padding: 1rem;
            color: white;
            text-align: center;
            font-size: 1.5rem;
        }

        .container {
            max-width: 600px;
            margin: 60px auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            text-align: center;
        }

        h2 {
            color: #333;
        }

        p {
            font-size: 1.1rem;
            margin: 20px 0;
        }

        form {
            margin-top: 30px;
        }

        button {
            padding: 10px 20px;
            background-color: #dc3545;
            border: none;
            color: white;
            font-size: 1rem;
            font-weight: bold;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #b52a38;
        }
    </style>
</head>
<body>

    <div class="navbar">
        Dashboard
    </div>

    <div class="container">
        <h2>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h2>
        <p>You have successfully logged in to your dashboard.</p>

        <form action="index.html" method="post">
            <!-- <button type="submit">Log in</button> -->
        </form>
    </div>

</body>
</html>