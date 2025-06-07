<?php
// database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $category = $_POST['category'];
    $image = $_POST['image'];
    $availability = $_POST['availability'];

    $sqlParts = [];
    $params = [];
    $types = "";

    $sqlParts[] = "name = ?";
    $params[] = $name;
    $types .= "s";

    $sqlParts[] = "description = ?";
    $params[] = $description;
    $types .= "s";

    $sqlParts[] = "price = ?";
    $params[] = $price;
    $types .= "d";

    $sqlParts[] = "category = ?";
    $params[] = $category;
    $types .= "s";

    // Only update image if a new one is provided and it's not an empty string
    if (isset($_POST['image']) && $_POST['image'] !== '') {
        $sqlParts[] = "image = ?";
        $params[] = $_POST['image']; // Use the directly posted image value
        $types .= "s";
        error_log("Updating image to: " . $_POST['image']);
    } else {
        error_log("Not updating image, as no new image was provided or it was an empty string.");
    }

    $sqlParts[] = "availability = ?";
    $params[] = $availability;
    $types .= "i";

    $params[] = $id;
    $types .= "i";

    $sql = "UPDATE menu SET " . implode(", ", $sqlParts) . " WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Menu item updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating menu item: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
