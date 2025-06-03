<?php
require_once 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT sr.id, sr.table_id, rt.table_number, sr.service_type_id, st.name AS service_name, sr.status, sr.created_at, sr.updated_at, sr.closed_at
            FROM service_requests sr
            JOIN service_types st ON sr.service_type_id = st.id
            JOIN restaurant_tables rt ON sr.table_id = rt.id
            ORDER BY sr.created_at DESC";

    $result = $conn->query($sql);

    $service_requests = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $service_requests[] = $row;
        }
    }

    echo json_encode($service_requests);
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
