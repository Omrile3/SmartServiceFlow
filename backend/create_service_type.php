<?php
// Include database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';

    if (empty($name)) {
        echo json_encode(["success" => false, "message" => "Name is required."]);
        exit;
    }

    $icon = $_POST['icon'] ?? 'help';

    $active = isset($_POST['active']) ? intval($_POST['active']) : 0;

    $sql = "INSERT INTO service_types (name, description, icon, active) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $name, $description, $icon, $active);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Service type created successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error creating service type: " . $conn->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
