<?php
// Include database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(["success" => false, "message" => "ID is required."]);
        exit;
    }

    $sql = "DELETE FROM service_types WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Service type deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error deleting service type: " . $conn->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
