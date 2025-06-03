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

// Get input data
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? $data['id'] : null;
$table_number = isset($data['table_number']) ? $data['table_number'] : null;
$x = isset($data['x']) ? $data['x'] : 0;
$y = isset($data['y']) ? $data['y'] : 0;
$width = isset($data['width']) ? $data['width'] : 100;
$height = isset($data['height']) ? $data['height'] : 100;
$seats = isset($data['seats']) ? $data['seats'] : 4;
$status = isset($data['status']) ? $data['status'] : 'active';

if (is_null($id) || is_null($table_number)) {
    echo json_encode(["success" => false, "message" => "Error: 'id' and 'table_number' are required."]);
    exit;
}

// Update table details
$stmt = $conn->prepare("UPDATE restaurant_tables SET table_number = ?, x = ?, y = ?, width = ?, height = ?, seats = ?, status = ? WHERE id = ?");
$stmt->bind_param("siiiiisi", $table_number, $x, $y, $width, $height, $seats, $status, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Table updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
