<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "linux_permissions";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

function numericToSymbolic($numeric) {
    $permissions = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    $symbolic = "";

    foreach (str_split($numeric) as $digit) {
        $symbolic .= $permissions[$digit];
    }

    return $symbolic;
}

function symbolicToNumeric($symbolic) {
    $mapping = [
        'r' => 4,
        'w' => 2,
        'x' => 1,
        '-' => 0
    ];

    $numeric = "";
    for ($i = 0; $i < strlen($symbolic); $i += 3) {
        $numeric .= $mapping[$symbolic[$i]] + $mapping[$symbolic[$i + 1]] + $mapping[$symbolic[$i + 2]];
    }

    return $numeric;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $symbolic = $_POST['symbolic'] ?? null;
    $numeric = $_POST['numeric'] ?? null;

    if ($symbolic) {
        $numeric = symbolicToNumeric($symbolic);
    }

    if ($numeric) {
        $symbolic = numericToSymbolic($numeric);
    }

    $stmt = $conn->prepare("INSERT INTO permissions (symbolic, numeric) VALUES (?, ?)");
    $stmt->bind_param("ss", $symbolic, $numeric);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'symbolic' => $symbolic,
            'numeric' => $numeric
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }

    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM permissions");

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}

$conn->close();
?>