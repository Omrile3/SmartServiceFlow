<?php
include_once 'csp_header.php';
// Database connection
$servername = "localhost";
$username = "lirfa_smart_user";
$password = "BorisBoris12!";
$dbname = "lirfa_smart_service_db";

// Set Content-Security-Policy header
header("Content-Security-Policy: connect-src 'self' https://lirfa.mtacloud.co.il https://www.paypal.com https://www.sandbox.paypal.com https://api-m.sandbox.paypal.com;");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
