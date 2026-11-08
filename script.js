const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status-text');
const fpsCounter = document.getElementById('fps-counter');
const overlay = document.getElementById('overlay');

let emulationLoop;
let lastTime = 0;

// --- EMULATION LOGIC ---
function loadRom(file) {
    if (!file) return;

    statusText.textContent = "Status: Uploading...";
    overlay.innerHTML = '<p>Loading...</p>';

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
        overlay.innerHTML = '';
        startEmulation();
    })
    .catch(err => {
        console.error(err);
        statusText.textContent = "Error: Check Server Logs";
        startDemoMode();
    });
}

function handleFileSelect(input) {
    loadRom(input.files[0]);
}

function resetEmu() {
    cancelAnimationFrame(emulationLoop);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    statusText.textContent = "Status: Reset";
    overlay.innerHTML = '<p>Rebooting...</p>';
    setTimeout(() => { 
        overlay.innerHTML = '<p>Select a .bin file</p>'; 
        statusText.textContent = "Status: Idle";
    }, 1000);
}

function startEmulation() {
    let frameCount = 0;
    let startTime = performance.now();

    function loop(timestamp) {
        frameCount++;
        if (timestamp - startTime >= 1000) {
            fpsCounter.innerText = frameCount;
            frameCount = 0;
            startTime = timestamp;
        }

        drawFrame(timestamp);
        emulationLoop = requestAnimationFrame(loop);
    }
    emulationLoop = requestAnimationFrame(loop);
}

function startDemoMode() {
    statusText.textContent = "Status: Demo Mode";
    startEmulation();
}

function drawFrame(time) {
    // Modern, clean visual simulation
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a clean grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const scrollY = (time * 0.05) % 40;
    
    for(let y = scrollY; y < canvas.height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw a sleek UI element
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`TIME: ${(time/1000).toFixed(2)}`, 20, 30);
    
    // Moving object
    const objX = (Math.sin(time * 0.002) + 1) * (canvas.width / 2) - 20;
    const objY = canvas.height / 2;
    
    ctx.fillStyle = "#0056b3";
    ctx.beginPath();
    ctx.arc(objX, objY, 20, 0, Math.PI * 2);
    ctx.fill();
}
