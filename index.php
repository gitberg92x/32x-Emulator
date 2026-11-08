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
    $allowedExtensions = ['bin', '32x'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (in_array($ext, $allowedExtensions)) {
        $newName = uniqid() . "." . $ext;
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>32X Web Player</title>
    <!-- Link to external CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

<header>
    <h1>32X Web Player</h1>
    <div class="controls">
        <button onclick="document.getElementById('romUpload').click()">Load .BIN</button>
        <input type="file" id="romUpload" accept=".bin,.32x" onchange="handleFileSelect(this)">
        <button onclick="resetEmu()">Reset</button>
    </div>
</header>

<div id="emulator-container">
    <canvas id="gameCanvas" width="640" height="480"></canvas>
    
    <div id="overlay">
        <p>Select a .bin file to start</p>
    </div>
</div>

<footer>
    <span id="status-text">Status: <?php echo htmlspecialchars($romStatus); ?></span>
    <span>FPS: <span id="fps-counter">0</span></span>
</footer>

<!-- Link to external JS -->
<script src="script.js"></script>

</body>
</html>
