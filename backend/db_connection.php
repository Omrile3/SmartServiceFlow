<?php
include_once 'csp_header.php';
// Database connection
$servername = "localhost";
$username = "lirfa_smart_user";
$password = "BorisBoris12!";
$dbname = "lirfa_smart_service_db";

header("Content-Security-Policy: connect-src 'self' https://lirfa.mtacloud.co.il https://www.paypal.com https://www.sandbox.paypal.com https://api-m.sandbox.paypal.com;");

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
