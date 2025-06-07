<?php
// database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];

    $sql = "DELETE FROM menu WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Menu item deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error deleting menu item: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
