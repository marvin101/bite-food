<?php
// Central DB helper — use environment variables so this app runs on different systems.
// Exposes function get_db_conn() and a pre-created $conn variable.

if (!function_exists('get_db_conn')) {
	function get_db_conn() {
		$host = getenv('DB_HOST') ?: '127.0.0.1';
		$user = getenv('DB_USER') ?: 'root';
		$pass = getenv('DB_PASS') ?: '';
		$name = getenv('DB_NAME') ?: 'user_auth';
		$port = getenv('DB_PORT') ?: 3306;

		// Attempt connection to the named database
		$mysqli = @new mysqli($host, $user, $pass, $name, (int)$port);
		if ($mysqli->connect_error) {
			// Unknown database (1049) -> try to create it (if user has privilege)
			if (isset($mysqli->connect_errno) && (int)$mysqli->connect_errno === 1049) {
				error_log("DB helper: database '{$name}' not found, attempting to create it.");
				$tmp = @new mysqli($host, $user, $pass, '', (int)$port);
				if ($tmp && !$tmp->connect_error) {
					// Create database with utf8mb4 if possible
					$create = "CREATE DATABASE IF NOT EXISTS `". $tmp->real_escape_string($name) ."` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
					if ($tmp->query($create)) {
						$tmp->close();
						// try reconnect to the newly created DB
						$mysqli = @new mysqli($host, $user, $pass, $name, (int)$port);
						if ($mysqli->connect_error) {
							error_log('DB helper: reconnect failed after creating DB: ' . $mysqli->connect_error);
							return null;
						}
					} else {
						error_log('DB helper: failed to create database: ' . $tmp->error);
						$tmp->close();
						return null;
					}
				} else {
					error_log('DB helper: cannot connect to server to create DB: ' . ($tmp ? $tmp->connect_error : 'unknown'));
					return null;
				}
			} else {
				// Other connection errors
				error_log('DB connect error: ' . $mysqli->connect_error);
				return null;
			}
		}

		$mysqli->set_charset('utf8mb4');
		return $mysqli;
	}
}

// Create a default connection instance for convenience (files can also call get_db_conn())
if (!isset($conn) || !$conn) {
	$conn = get_db_conn();
}
?>
