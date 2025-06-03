<?php
// Include database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';

    if (empty($id) || empty($name)) {
        echo json_encode(["success" => false, "message" => "ID and Name are required."]);
        exit;
    }

    $icon = $_POST['icon'] ?? 'help';

    $active = isset($_POST['active']) ? intval($_POST['active']) : 0;

    $sql = "UPDATE service_types SET name = ?, description = ?, icon = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssii", $name, $description, $icon, $active, $id);

    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "SQL prepare failed: " . $conn->error]);
        exit;
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Service type updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating service type: " . $conn->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
