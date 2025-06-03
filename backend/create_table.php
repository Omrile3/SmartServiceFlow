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
$table_number = isset($data['table_number']) ? $data['table_number'] : null;
$x = isset($data['x']) ? $data['x'] : 0;
$y = isset($data['y']) ? $data['y'] : 0;
$width = isset($data['width']) ? $data['width'] : 100;
$height = isset($data['height']) ? $data['height'] : 100;
$seats = isset($data['seats']) ? $data['seats'] : 4;
$status = isset($data['status']) ? $data['status'] : 'active';

if (is_null($table_number)) {
    echo json_encode(["success" => false, "message" => "Error: 'table_number' is required."]);
    exit;
}

if (is_null($table_number)) {
    echo json_encode(["success" => false, "message" => "Error: 'table_number' is required."]);
    exit;
}

// Generate QR code URL
$baseUrl = "https://lirfa.mtacloud.co.il";
$fullUrl = "$baseUrl/Customer?table=" . urlencode($table_number);
$qr_code = "https://api.qrserver.com/v1/create-qr-code/?data=" . urlencode($fullUrl) . "&size=250x250";

// Insert into database
$stmt = $conn->prepare("INSERT INTO restaurant_tables (table_number, qr_code, x, y, width, height, seats, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiiiis", $table_number, $qr_code, $x, $y, $width, $height, $seats, $status);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Table created successfully", "qr_code" => $qr_code]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
