// main.js - v86 Emulator initialization and control

let emulator = null;

// Configuration: Local image path
// Place your alpine-midori.img file in the images/ folder
const IMAGE_URL = 'images/alpine-midori.img';

// Optional: Set the expected image size in bytes for progress tracking
// 8GB = 8 * 1024 * 1024 * 1024 bytes = 8589934592 bytes
// Leave as null if unknown - v86 will still work without it
const IMAGE_SIZE = 8 * 1024 * 1024 * 1024; // 8GB

// Constants for better readability
const BYTES_PER_MB = 1024 * 1024;

// Function to update status message
function updateStatus(message, show = true) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = show ? 'block' : 'none';
}

// Function to start the emulator
async function startEmulator() {
    // Disable the start button to prevent multiple clicks
    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
    startButton.textContent = 'Loading...';
    
    // Get RAM and VRAM values from selectors
    const ramMB = parseInt(document.getElementById('ram').value);
    const vramMB = parseInt(document.getElementById('vram').value);
    
    // Convert MB to bytes
    const ramBytes = ramMB * BYTES_PER_MB;
    const vramBytes = vramMB * BYTES_PER_MB;
    
    try {
        console.log('Starting emulator with RAM:', ramMB, 'MB, VRAM:', vramMB, 'MB');
        console.log('Using async loading for disk image:', IMAGE_URL);
        
        updateStatus('Initializing emulator with async disk image loading...');
        
        // Initialize v86 emulator with async URL-based loading
        // This allows v86 to fetch the large disk image in chunks as needed
        // instead of loading the entire file into memory
        emulator = new V86({
            wasm_path: "v86.wasm",
            screen_container: document.getElementById("screen_container"),
            bios: {
                url: "bios/seabios.bin",
            },
            vga_bios: {
                url: "bios/vgabios.bin",
            },
            hda: {
                url: IMAGE_URL,
                async: true,
                size: IMAGE_SIZE,
            },
            memory_size: ramBytes,
            vga_memory_size: vramBytes,
            autostart: true,
        });
        
        console.log('V86 emulator instance created successfully');
        
        updateStatus('Emulator loading... The disk image will be fetched as needed.');
        startButton.textContent = 'Loading...';
        
        // Add event listeners for emulator state and download progress
        emulator.add_listener("emulator-ready", function() {
            console.log("Emulator is ready");
            updateStatus('Emulator ready! Booting...');
        });
        
        emulator.add_listener("emulator-loaded", function() {
            console.log("Emulator loaded");
            updateStatus('Emulator started successfully!');
            startButton.textContent = 'Running';
        });
        
        emulator.add_listener("download-progress", function(e) {
            if (e.file_name && (e.file_name === IMAGE_URL || e.file_name.endsWith(IMAGE_URL))) {
                const percent = e.lengthComputable && e.total > 0 ? 
                    Math.round((e.loaded / e.total) * 100) : 0;
                if (percent > 0) {
                    updateStatus(`Loading disk image: ${percent}% (${Math.round(e.loaded / BYTES_PER_MB)} MB / ${Math.round(e.total / BYTES_PER_MB)} MB)`);
                } else {
                    updateStatus(`Loading disk image: ${Math.round(e.loaded / BYTES_PER_MB)} MB loaded...`);
                }
            }
        });
        
        emulator.add_listener("download-error", function(e) {
            console.error("Download error:", e);
            if (e.file_name && (e.file_name === IMAGE_URL || e.file_name.endsWith(IMAGE_URL))) {
                updateStatus('Error: Failed to load disk image. Make sure alpine-midori.img is in the images/ folder and you are running a local web server.');
                startButton.disabled = false;
                startButton.textContent = 'Start';
            }
        });
        
    } catch (error) {
        console.error('Failed to start emulator:', error);
        updateStatus('Failed to start emulator: ' + error.message);
        startButton.disabled = false;
        startButton.textContent = 'Start';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    
    startButton.addEventListener('click', startEmulator);
    
    console.log('Page loaded, ready to start emulator');
});
