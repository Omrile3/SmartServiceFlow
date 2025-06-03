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

if (is_null($id)) {
    echo json_encode(["success" => false, "message" => "Error: 'id' is required."]);
    exit;
}

// Delete table
$stmt = $conn->prepare("DELETE FROM restaurant_tables WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Table deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
