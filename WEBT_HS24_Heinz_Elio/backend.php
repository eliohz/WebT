<?php
header('Content-Type: application/json');

// https://stackoverflow.com/questions/2731297/file-get-contentsphp-input-or-http-raw-post-data-which-one-is-better-to
ini_set('display_errors', 1);
error_reporting(E_ALL);

// https://stackoverflow.com/questions/2731297/file-get-contentsphp-input-or-http-raw-post-data-which-one-is-better-to
$rawInput = file_get_contents("php://input");
file_put_contents('php://stderr', "Raw Input: $rawInput\n", FILE_APPEND);

$data = json_decode($rawInput, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No data received or invalid JSON.']);
    exit;
}

$symbolic = $data['symbolic'] ?? '';
$numeric = $data['numeric'] ?? '';

$lastInput = $_COOKIE['lastInput'] ?? null;

if ($symbolic) {
    $numeric = symbolicToNumeric($symbolic);
    setcookie('lastInput', $symbolic, time() + 3600, "/");
} elseif ($numeric) {
    $symbolic = numericToSymbolic($numeric);
    setcookie('lastInput', $symbolic, time() + 3600, "/");
} elseif ($lastInput) {
    $symbolic = $lastInput;
    $numeric = symbolicToNumeric($lastInput);
} else {
    echo json_encode(['success' => false, 'error' => 'Wrong Input']);
    exit;
}

$response = [
    'success' => true,
    'symbolic' => $symbolic,
    'numeric' => $numeric,
    'lastInput' => $lastInput
];
echo json_encode($response);

function numericToSymbolic($numeric) {
    $permissions = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    $symbolic = "";

    foreach (str_split($numeric) as $digit) {
        $symbolic .= $permissions[$digit];
    }

    return $symbolic;
}

function symbolicToNumeric($symbolic) {
    $mapping = ['r' => 4, 'w' => 2, 'x' => 1, '-' => 0];
    $numeric = "";

    for ($i = 0; $i < strlen($symbolic); $i += 3) {
        $numeric .= $mapping[$symbolic[$i]] + $mapping[$symbolic[$i + 1]] + $mapping[$symbolic[$i + 2]];
    }

    return $numeric;
}
