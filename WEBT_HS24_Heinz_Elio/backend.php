<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "linux_permissions";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// Funktion: Numerische Darstellung -> Symbolisch
function numericToSymbolic($numeric) {
    $permissions = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    $symbolic = "";

    foreach (str_split($numeric) as $digit) {
        $symbolic .= $permissions[$digit];
    }

    return $symbolic;
}

// Funktion: Symbolisch -> Numerische Darstellung
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

// Funktion: Checkboxen -> Symbolisch
function checkboxesToSymbolic($checkboxes) {
    $mapping = [
        'read' => 'r',
        'write' => 'w',
        'execute' => 'x'
    ];

    $sections = ['owner', 'group', 'others'];
    $symbolic = '';

    foreach ($sections as $section) {
        $sectionPermissions = '';

        foreach (['read', 'write', 'execute'] as $permission) {
            $key = $section . '-' . $permission;
            $sectionPermissions .= isset($checkboxes[$key]) ? $mapping[$permission] : '-';
        }

        $symbolic .= $sectionPermissions;
    }

    return $symbolic;
}

// POST-Logik
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $symbolic = $_POST['symbolic'] ?? null;
    $numeric = $_POST['numeric'] ?? null;
    $checkboxes = $_POST['checkboxes'] ?? []; // Checkbox-Daten aus POST holen

    if ($checkboxes) {
        $symbolic = checkboxesToSymbolic($checkboxes);
        $numeric = symbolicToNumeric($symbolic);
    }

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

// GET-Logik
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
