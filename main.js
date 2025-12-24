// main.js - v86 Emulator initialization and control

let emulator = null;

// Configuration: Local image path
// Place your alpine-midori.img file in the images/ folder
const IMAGE_URL = 'images/alpine-midori.img';

// Constants for better readability
const BYTES_PER_MB = 1024 * 1024;

// Function to update status message
function updateStatus(message, show = true) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = show ? 'block' : 'none';
}

// Function to fetch the .img file from local storage
async function fetchImage(url) {
    updateStatus('Loading image file...');
    
    console.log('Loading image from:', url);
    
    try {
        // Fetch the local file
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to load image file. Status: ${response.status}. Make sure you have placed alpine-midori.img in the images/ folder.`);
        }
        
        // Get content length for progress tracking
        const contentLength = response.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        
        updateStatus('Reading image file...');
        console.log('Loading image, size:', totalBytes, 'bytes');
        
        // Read the response as an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        
        updateStatus('Image ready, initializing emulator...');
        console.log('Successfully loaded image');
        console.log('Image size:', arrayBuffer.byteLength, 'bytes');
        return arrayBuffer;
    } catch (error) {
        console.error('Failed to load image:', error);
        
        // Provide helpful error message
        if (error.message.includes('Status: 404')) {
            updateStatus('Error: Image file not found. Please download alpine-midori.img and place it in the images/ folder. See images/README.md for instructions.');
        } else if (error.name === 'TypeError' && error.message.toLowerCase().includes('failed to fetch')) {
            updateStatus('Error: Failed to load image file. Make sure alpine-midori.img is in the images/ folder and you are running a local web server.');
        } else {
            updateStatus('Error: ' + error.message);
        }
        throw error;
    }
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
        
        // Load the image file
        const imgBuffer = await fetchImage(IMAGE_URL);
        
        console.log('Image loaded, size:', imgBuffer.byteLength, 'bytes');
        console.log('Image buffer type:', imgBuffer.constructor.name);
        console.log('Initializing V86 with', ramMB, 'MB RAM and', vramMB, 'MB VRAM');
        
        // Verify the buffer is valid
        if (!imgBuffer || imgBuffer.byteLength === 0) {
            throw new Error('Invalid image buffer - buffer is empty or null');
        }
        
        // Initialize v86 emulator with the decompressed image buffer
        emulator = new V86({
            screen_container: document.getElementById("screen_container"),
            bios: {
                url: "bios/seabios.bin",
            },
            vga_bios: {
                url: "bios/vgabios.bin",
            },
            hda: {
                buffer: imgBuffer,
            },
            memory_size: ramBytes,
            vga_memory_size: vramBytes,
            autostart: true,
        });
        
        console.log('V86 emulator instance created successfully');
        
        updateStatus('Emulator started successfully!');
        startButton.textContent = 'Running';
        
        // Optional: Add event listeners for emulator state
        emulator.add_listener("emulator-ready", function() {
            console.log("Emulator is ready");
        });
        
    } catch (error) {
        console.error('Failed to start emulator:', error);
        updateStatus('Failed to start emulator: ' + error.message);
        startButton.disabled = false;
        startButton.textContent = 'Start Emulator';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    
    startButton.addEventListener('click', startEmulator);
    
    console.log('Page loaded, ready to start emulator');
});
