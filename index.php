<?php
// ---------------------------------------------------------
// PHP BACKEND LOGIC
// ---------------------------------------------------------
$uploadDir = "roms/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$romStatus = "Idle";
$romFile = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['rom'])) {
    $file = $_FILES['rom'];
    // Accept .bin, .32x, or .iso for Sega 32X
    $allowedExtensions = ['bin', '32x', 'iso'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (in_array($ext, $allowedExtensions)) {
        $newName = uniqid() . "_" . basename($file['name']);
        $targetPath = $uploadDir . $newName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $romStatus = "Loaded: " . basename($file['name']);
            $romFile = $targetPath;
        } else {
            $romStatus = "Error: Upload failed";
        }
    } else {
        $romStatus = "Error: Invalid type";
    }
}
?>

