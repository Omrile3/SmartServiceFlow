<?php
// Include database connection
include 'db_connection.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Always send JSON header

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = $rawInput ? json_decode($rawInput, true) : [];

    $id = $input['id'] ?? '';
    $status = $input['status'] ?? '';

    if (empty($id) || empty($status)) {
        echo json_encode(["success" => false, "message" => "ID and status are required."]);
        exit;
    }

    $closed_at = ($status === 'completed') ? date('Y-m-d H:i:s') : null;

    $sql = "UPDATE service_requests SET status = ?, closed_at = IFNULL(?, NULL) WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        error_log("SQL prepare error: " . $conn->error);
        echo json_encode(["success" => false, "message" => "SQL prepare error."]);
        exit;
    }

    if ($closed_at === null) {
        $stmt->bind_param("ssi", $status, $closed_at, $id);
        $stmt->send_long_data(1, null); // Optional, often not needed
    } else {
        $stmt->bind_param("ssi", $status, $closed_at, $id);
    }

    error_log("Executing SQL: $sql with parameters: status=$status, closed_at=$closed_at, id=$id");
    if (!$stmt->execute()) {
        error_log("SQL execute error: " . $stmt->error);
        echo json_encode(["success" => false, "message" => "SQL execute error."]);
        exit;
    }

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Service request status updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "No rows were updated."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// If request method is not POST
echo json_encode(["success" => false, "message" => "Invalid request method."]);
exit;
?>
