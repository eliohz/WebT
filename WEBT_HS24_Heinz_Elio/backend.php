<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Read and log the raw POST body for debugging
$rawInput = file_get_contents("php://input");
file_put_contents('php://stderr', "Raw Input: $rawInput\n", FILE_APPEND);

// Decode the JSON input
$data = json_decode($rawInput, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No data received or invalid JSON.']);
    exit;
}

// Get the symbolic or numeric value from the input
$symbolic = $data['symbolic'] ?? '';
$numeric = $data['numeric'] ?? '';

if ($symbolic) {
    // Convert symbolic to numeric
    $numeric = symbolicToNumeric($symbolic);
} elseif ($numeric) {
    // Convert numeric to symbolic
    $symbolic = numericToSymbolic($numeric);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input.']);
    exit;
}

// Return the result
echo json_encode([
    'success' => true,
    'symbolic' => $symbolic,
    'numeric' => $numeric,
]);

// Convert numeric permissions to symbolic (e.g., "755" to "rwxr-xr-x")
function numericToSymbolic($numeric) {
    $permissions = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    $symbolic = "";

    foreach (str_split($numeric) as $digit) {
        $symbolic .= $permissions[$digit];
    }

    return $symbolic;
}

// Convert symbolic permissions to numeric (e.g., "rwxr-xr-x" to "755")
function symbolicToNumeric($symbolic) {
    $mapping = ['r' => 4, 'w' => 2, 'x' => 1, '-' => 0];
    $numeric = "";

    for ($i = 0; $i < strlen($symbolic); $i += 3) {
        $numeric .= $mapping[$symbolic[$i]] + $mapping[$symbolic[$i + 1]] + $mapping[$symbolic[$i + 2]];
    }

    return $numeric;
}
