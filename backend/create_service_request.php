<?php
require_once 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    $table_id = $input['table_id'] ?? null;
    $service_type_id = $input['service_type_id'] ?? null;

    // Validate input
    if (!$table_id || !$service_type_id) {
        echo json_encode(["success" => false, "message" => "Invalid input: Missing table_id or service_type_id."]);
        exit;
    }

    // Prepare and execute SQL statement
    $stmt = $conn->prepare("INSERT INTO service_requests (table_id, service_type_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $table_id, $service_type_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Service request created successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create service request. Error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
