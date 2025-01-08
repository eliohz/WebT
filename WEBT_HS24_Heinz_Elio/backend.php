<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

$rawInput = file_get_contents("php://input");
file_put_contents('php://stderr', "Raw Input: $rawInput\n", FILE_APPEND);

// JSON Decoding
$data = json_decode($rawInput, true);

// JSON Debugging 
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No data received or invalid JSON.']);
    exit;
}

// User Imput auslesen
$symbolic = $data['symbolic'] ?? '';
$numeric = $data['numeric'] ?? '';

// Cookie Handling
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

// Resultat zurückgeben
$response = [
    'success' => true,
    'symbolic' => $symbolic,
    'numeric' => $numeric,
    'lastInput' => $lastInput
];
echo json_encode($response);

// Numerisch umrechnen zu Symbolisch
function numericToSymbolic($numeric) {
    $permissions = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    $symbolic = "";

    foreach (str_split($numeric) as $digit) {
        $symbolic .= $permissions[$digit];
    }

    return $symbolic;
}

// Symbolisch umrechnen in Nummerisch
function symbolicToNumeric($symbolic) {
    $mapping = ['r' => 4, 'w' => 2, 'x' => 1, '-' => 0];
    $numeric = "";

    for ($i = 0; $i < strlen($symbolic); $i += 3) {
        $numeric .= $mapping[$symbolic[$i]] + $mapping[$symbolic[$i + 1]] + $mapping[$symbolic[$i + 2]];
    }

    return $numeric;
}
