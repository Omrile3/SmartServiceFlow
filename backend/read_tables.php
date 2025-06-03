<?php
// Database connection
$servername = "localhost";
$username = "lirfa_smart_user";
$password = "BorisBoris12!";
$dbname = "lirfa_smart_service_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch all tables
$sql = "SELECT * FROM restaurant_tables";
$result = $conn->query($sql);

$tables = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tables[] = $row;
    }
    echo json_encode(["success" => true, "tables" => $tables]);
} else {
    echo json_encode(["success" => true, "tables" => []]);
}

$conn->close();
?>
