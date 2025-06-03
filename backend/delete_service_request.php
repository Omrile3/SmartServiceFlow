<?php
// Include database connection
include 'db_connection.php';

ini_set('display_errors', 1); // Enable error display for debugging
ini_set('log_errors', 1); // Enable error logging
ini_set('error_log', 'error_log.txt'); // Log errors to a file
header('Content-Type: application/json; charset=utf-8'); // Explicitly set JSON content type

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input'); // Get raw input
    error_log("Raw Input: " . $rawInput); // Log the raw input for debugging
    $data = json_decode($rawInput, true); // Decode JSON input
    error_log("Decoded Data: " . print_r($data, true)); // Log the decoded data

    $id = isset($data['id']) ? (int)$data['id'] : null;

    if ($id === null) {
        echo json_encode(["success" => false, "message" => "No ID provided."]);
        exit;
    }

    error_log("Casted ID: " . $id); // Log the casted ID for debugging

    $sql = "DELETE FROM service_requests WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Service request deleted successfully."]);
    } else {
        $response = ["success" => false, "message" => "Error deleting service request: " . $stmt->error];
        error_log("Response: " . json_encode($response)); // Log the response
        echo json_encode($response);
    }

    $stmt->close();
    $conn->close();
    echo json_encode(["success" => false, "message" => "Unexpected error occurred."]); // Default response
}
?>
