<?php
// Include database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $category = $_POST['category'];
    $image = $_POST['image'];
    $availability = $_POST['availability'];

    error_log("Received image field: " . (isset($_POST['image']) ? $_POST['image'] : "Not set"));
    error_log("Saving menu item with image URL: " . $image);
    $sql = "INSERT INTO menu (name, description, price, category, image, availability) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssdssi", $name, $description, $price, $category, $image, $availability);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Menu item created successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error creating menu item: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
