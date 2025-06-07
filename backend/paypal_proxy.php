<?php
// paypal_proxy.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");


$clientId = 'AWhm77VyYhIadVoBhWe2zlt6lAJw0Rrxz4xTbSLdwOpvp4pYwLvEvWtiwwjtWDWYaTBql0ZVtjL-Of-s';
$secret = 'ELTMzw5c_2lW7EWpbqqe1HyRZti8fpuCCGvnVY7pvJOegmhj4ywJ1FyczfY4zb1XGREy31w833lIkpQT';

$paypal_api_base = 'https://api-m.sandbox.paypal.com';


function getAccessToken($clientId, $secret, $paypal_api_base) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$paypal_api_base/v1/oauth2/token");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERPWD, "$clientId:$secret");
    curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Accept: application/json",
        "Accept-Language: en_US",
        "Content-Type: application/x-www-form-urlencoded"
    ]);
    $res = curl_exec($ch);
    if (curl_errno($ch)) {
        http_response_code(500);
        echo json_encode(["error" => curl_error($ch)]);
        exit;
    }
    curl_close($ch);

    $data = json_decode($res, true);
    return $data['access_token'] ?? null;
}


$method = $_SERVER['REQUEST_METHOD'];
$path = str_replace('/backend/paypal_proxy.php', '', $_SERVER['REQUEST_URI']);
$url = $paypal_api_base . $path;
$accessToken = getAccessToken($clientId, $secret, $paypal_api_base);

if (!$accessToken) {
    http_response_code(500);
    echo json_encode(["error" => "Unable to obtain access token"]);
    exit;
}

$headers = [
    "Content-Type: application/json",
    "Authorization: Bearer $accessToken"
];

$body = file_get_contents("php://input");

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
if ($method === "POST" || $method === "PUT" || $method === "PATCH") {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}
$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => curl_error($ch)]);
    exit;
}

$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($status);
echo $response;
