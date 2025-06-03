<?php
// Include database connection
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM service_types";
    $result = $conn->query($sql);

    if ($result) {
        $serviceTypes = [];
        while ($row = $result->fetch_assoc()) {
            $serviceTypes[] = [
                "id" => $row["id"],
                "name" => $row["name"],
                "description" => $row["description"],
                "icon" => $row["icon"],
                "active" => intval($row["active"]),
                "created_at" => $row["created_at"],
                "updated_at" => $row["updated_at"]
            ];
        }
        echo json_encode($serviceTypes);
    } else {
        echo json_encode(["success" => false, "message" => "Error fetching service types: " . $conn->error]);
    }

    $conn->close();
}
?>
