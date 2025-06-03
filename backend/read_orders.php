<?php
header('Content-Type: application/json');
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $table_id = $_GET['table_id'] ?? null;

    if (!$table_id) {
        echo json_encode(["success" => false, "message" => "Missing table_id parameter."]);
        exit;
    }

    try {
        // Fetch orders for the specified table
        $stmt = $conn->prepare("
            SELECT o.id AS order_id, o.total_amount, o.payment_status, o.created_at, o.table_id AS table_id,
                   oi.menu_item_id, oi.quantity, m.name AS menu_item_name, m.price AS menu_item_price
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu m ON oi.menu_item_id = m.id
            WHERE o.table_id = ?
            ORDER BY o.created_at DESC
        ");
        $stmt->bind_param("i", $table_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $orders = [];
        while ($row = $result->fetch_assoc()) {
            error_log("Fetched row: " . json_encode($row));
            $order_id = $row['order_id'];
            if (!isset($orders[$order_id])) {
                $orders[$order_id] = [
                    "order_id" => $order_id,
                    "total_amount" => $row['total_amount'],
                    "payment_status" => $row['payment_status'],
                    "created_at" => $row['created_at'],
                    "table_id" => $row['table_id'],
                    "items" => []
                ];
            }
            $found = false;
            foreach ($orders[$order_id]["items"] as &$item) {
                if ($item['menu_item_id'] === $row['menu_item_id']) {
                    $item['quantity'] += $row['quantity'];
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $orders[$order_id]["items"][] = [
                    "menu_item_id" => $row['menu_item_id'],
                    "menu_item_name" => $row['menu_item_name'],
                    "menu_item_price" => $row['menu_item_price'],
                    "quantity" => $row['quantity']
                ];
            }
        }

        error_log("Final orders array: " . json_encode($orders));
        echo json_encode(["success" => true, "orders" => array_values($orders)]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error fetching orders: " . $e->getMessage()]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
