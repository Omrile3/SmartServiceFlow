<?php
// Include database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM menu";
    $result = $conn->query($sql);

    if ($result) {
        $menuItems = [];
        while ($row = $result->fetch_assoc()) {
            $row['price'] = (float)$row['price'];
            error_log("Fetched menu item with image URL: " . $row['image']);
            $row['image_url'] = $row['image'];
            unset($row['image']);
            $menuItems[] = $row;
        }
        echo json_encode($menuItems);
    } else {
        echo json_encode(["success" => false, "message" => "Error fetching menu items: " . $conn->error]);
    }

    $conn->close();
}
?>
