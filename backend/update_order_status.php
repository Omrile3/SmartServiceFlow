<?php
header('Content-Type: application/json');
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = $_POST['order_id'] ?? null;
    $payment_status = $_POST['payment_status'] ?? null;

    if (!$order_id || !$payment_status) {
        echo json_encode(["success" => false, "message" => "Missing required fields."]);
        exit;
    }

    try {
        // Update the payment status of the order
        $stmt = $conn->prepare("UPDATE orders SET payment_status = ? WHERE id = ?");
        $stmt->bind_param("si", $payment_status, $order_id);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Order payment status updated successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "No order found with the given ID or no changes made."]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error updating order status: " . $e->getMessage()]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
