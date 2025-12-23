// main.js - v86 Emulator initialization and control

let emulator = null;

// Configuration: Set to true to use local CORS proxy
// If you're experiencing CORS issues, start the cors-proxy.js server with:
// node cors-proxy.js
const USE_CORS_PROXY = false;
const CORS_PROXY_URL = 'http://localhost:8080/';

// Function to update status message
function updateStatus(message, show = true) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = show ? 'block' : 'none';
}

// Function to fetch and decompress the .img.gz file
async function fetchAndDecompress(url) {
    updateStatus('Downloading image file...');
    
    try {
        // Fetch with explicit CORS mode to get better error messages
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        updateStatus('Decompressing image file...');
        
        // Use the Compression Streams API to decompress the gzip file
        const ds = new DecompressionStream("gzip");
        const decompressedStream = response.body.pipeThrough(ds);
        
        // Convert the stream to an ArrayBuffer for v86
        const decompressedResponse = new Response(decompressedStream);
        const arrayBuffer = await decompressedResponse.arrayBuffer();
        
        updateStatus('Image ready, initializing emulator...');
        return arrayBuffer;
    } catch (error) {
        console.error('Error fetching/decompressing image:', error);
        
        // Provide more helpful error message for CORS and network issues
        // CORS errors typically manifest as TypeError with specific patterns
        const errorMsg = error.message.toLowerCase();
        if (error.name === 'TypeError' && 
            (errorMsg.includes('failed to fetch') || 
             errorMsg.includes('networkerror') || 
             errorMsg.includes('cors'))) {
            updateStatus('Error: Unable to download image. This is likely a CORS (Cross-Origin Resource Sharing) issue. Please use the CORS proxy (see README for instructions) or download the image locally.');
        } else if (error.name === 'TypeError') {
            updateStatus('Error: Network error - ' + error.message + '. Check your internet connection.');
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
    const ramBytes = ramMB * 1024 * 1024;
    const vramBytes = vramMB * 1024 * 1024;
    
    try {
        console.log('Starting emulator with RAM:', ramMB, 'MB, VRAM:', vramMB, 'MB');
        
        // URL of the compressed image file
        let imageUrl = 'https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz';
        
        // If CORS proxy is enabled, prepend the proxy URL
        if (USE_CORS_PROXY) {
            imageUrl = CORS_PROXY_URL + imageUrl;
            console.log('Using CORS proxy:', imageUrl);
        }
        
        // Download and decompress the image
        const imgBuffer = await fetchAndDecompress(imageUrl);
        
        console.log('Image decompressed, size:', imgBuffer.byteLength, 'bytes');
        
        // Initialize v86 emulator
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
    
    // Check for DecompressionStream support
    if (typeof DecompressionStream === 'undefined') {
        updateStatus('Error: Your browser does not support DecompressionStream API. Please use a modern browser (Chrome 80+, Edge 80+, Safari 16.4+, Firefox 113+).');
        startButton.disabled = true;
        console.error('DecompressionStream API not supported');
        return;
    }
    
    startButton.addEventListener('click', startEmulator);
    
    console.log('Page loaded, ready to start emulator');
});
