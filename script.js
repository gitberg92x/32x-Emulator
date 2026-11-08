let egameInstance = null;

function loadRom(file) {
    if (!file) return;

    const statusText = document.getElementById('status-text');
    const overlay = document.getElementById('overlay');
    
    statusText.textContent = "Status: Uploading...";
    
    // Create an object URL for immediate preview (optional, but good for UX)
    // However, EmulatorJS works best with a server-side path.
    // We will send it to PHP first to get a stable path.
    
    const formData = new FormData();
    formData.append('rom', file);

    fetch('', { 
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(html => {
        // Re-parse the page to get updated PHP variables
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newStatus = doc.getElementById('status-text').textContent;
        
        statusText.textContent = newStatus;
        
        // Hide any old overlays
        const oldOverlay = document.querySelector('#emulator-container > div[style*="position: absolute"]');
        if(oldOverlay) oldOverlay.remove();

        // Initialize EmulatorJS
        initEmulator(newStatus);
    })
    .catch(err => {
        console.error(err);
        statusText.textContent = "Error: Check Server Logs";
    });
}

function handleFileSelect(input) {
    loadRom(input.files[0]);
}

function resetEmu() {
    if (egameInstance) {
        egameInstance.reset();
    } else {
        // Fallback if instance isn't ready
        location.reload();
    }
}

function initEmulator(statusMessage) {
    // EmulatorJS configuration
    const config = {
        "data-url": "https://cdn.emulatorjs.org/stable/data/",
        "loader": "#gameCanvas",
        "system": "sega32x", // Specifically targeting Sega 32X
        "theme": "dark",
        "bg": "#000000",
        "fullscreen": false,
        "saveStateOnExit": true,
        "virtualButtonsBottom": true,
        "startPaused": false,
        "volume": 1.0,
        "autoROM": false, // We provide the URL manually
        "url": "<?php echo !empty($romFile) ? '../' . $romFile : ''; ?>" 
    };

    // If we have a ROM, load it. Otherwise show placeholder.
    if (config.url) {
        // Clear previous instances if any
        const container = document.getElementById('gameCanvas');
        container.innerHTML = ''; 
        
        // Create the emulator instance
        egameInstance = new EJS(config.loader, config);
        
        // Add a loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:#000; display:flex; justify-content:center; align-items:center; color:white; z-index:100;";
        overlay.innerHTML = "<p>Loading Core...</p>";
        container.appendChild(overlay);
        
        // Remove overlay when loaded
        egameInstance.addEventListener("loaded", () => {
            if(container.contains(overlay)) {
                container.removeChild(overlay);
            }
        });
    } else {
        // Show default message
        const container = document.getElementById('gameCanvas');
        container.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#666;">Upload a ROM to start</div>';
    }
}

// Initial check on load
window.onload = function() {
    // Check if there's already a rom loaded from PHP
    const phpRom = "<?php echo !empty($romFile) ? '../' . $romFile : ''; ?>";
    if (phpRom) {
        initEmulator("<?php echo htmlspecialchars($romStatus); ?>");
    }
};
