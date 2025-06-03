<?php
header('Content-Type: application/json');
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Confirm script execution and log incoming data for debugging
    // Parse JSON payload if Content-Type is application/json
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $table_id = $data['table_id'] ?? null;
    $items = $data['items'] ?? null;
    if (!$table_id || !$items) {
        echo json_encode(["success" => false, "message" => "Missing required fields."]);
        exit;
    }

    $conn->begin_transaction();

    try {
        // Insert into orders table
    // Calculate total amount
    $total_amount = 0;
    foreach ($items as $item) {
        $menu_item_id = $item['menu_item_id'];
        $quantity = $item['quantity'];

        // Fetch price of the menu item
        $price_stmt = $conn->prepare("SELECT price FROM menu WHERE id = ?");
        $price_stmt->bind_param("i", $menu_item_id);
        $price_stmt->execute();
        $price_result = $price_stmt->get_result();
        $price_row = $price_result->fetch_assoc();
        $price = $price_row['price'];

        $total_amount += $price * $quantity;
        $price_stmt->close();
    }

    $stmt = $conn->prepare("INSERT INTO orders (table_id, total_amount, payment_status) VALUES (?, ?, 'unpaid')");
        $stmt->bind_param("id", $table_id, $total_amount);
        $stmt->execute();
        $order_id = $stmt->insert_id;

        // Insert into order_items table
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)");
        foreach ($items as $item) {
            $menu_item_id = $item['menu_item_id'];
            $quantity = $item['quantity'];
            $stmt->bind_param("iii", $order_id, $menu_item_id, $quantity);
            $stmt->execute();
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Order created successfully.", "order_id" => $order_id]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Error creating order: " . $e->getMessage()]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
