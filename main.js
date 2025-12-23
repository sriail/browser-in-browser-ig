// main.js - v86 Emulator initialization and control

let emulator = null;

// Configuration: Image source and CORS proxy settings
const IMAGE_URL = 'https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz';

// GitHub releases don't support CORS, so we use multiple reliable public CORS proxies
// These are free, public services that add CORS headers to any URL
const CORS_PROXY_URLS = [
    'https://corsproxy.io/?',                    // corsproxy.io - reliable and fast
    'https://api.allorigins.win/raw?url=',       // allorigins.win - good fallback
    'https://cors-anywhere.herokuapp.com/',      // cors-anywhere - popular option
];

// Function to update status message
function updateStatus(message, show = true) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = show ? 'block' : 'none';
}

// Function to fetch and decompress the .img.gz file
async function fetchAndDecompress(url) {
    updateStatus('Downloading image file...');
    
    // List of URLs to try with CORS proxies
    const urlsToTry = [];
    
    // Try each CORS proxy
    for (const proxyUrl of CORS_PROXY_URLS) {
        urlsToTry.push(proxyUrl + encodeURIComponent(url));
    }
    
    let lastError = null;
    
    // Try each URL until one succeeds
    for (let i = 0; i < urlsToTry.length; i++) {
        const tryUrl = urlsToTry[i];
        console.log(`Attempt ${i + 1}/${urlsToTry.length}: Trying URL:`, tryUrl);
        
        try {
            // Fetch with explicit CORS mode to get better error messages
            const response = await fetch(tryUrl, {
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': '*/*'
                }
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
            console.log('Successfully downloaded and decompressed image from:', tryUrl);
            return arrayBuffer;
        } catch (error) {
            console.warn(`Failed with URL ${tryUrl}:`, error.message);
            lastError = error;
            
            // If this isn't the last URL, try the next one
            if (i < urlsToTry.length - 1) {
                updateStatus(`Download failed, trying alternative proxy (${i + 2}/${urlsToTry.length})...`);
                continue;
            }
        }
    }
    
    // All attempts failed
    console.error('All download attempts failed:', lastError);
    
    // Provide more helpful error message for CORS and network issues
    const errorMsg = lastError.message.toLowerCase();
    if (lastError.name === 'TypeError' && 
        (errorMsg.includes('failed to fetch') || 
         errorMsg.includes('networkerror') || 
         errorMsg.includes('cors'))) {
        updateStatus('Error: Unable to download image. All CORS proxies failed. Please check your internet connection or try again later.');
    } else if (lastError.name === 'TypeError') {
        updateStatus('Error: Network error - ' + lastError.message + '. Check your internet connection.');
    } else {
        updateStatus('Error: ' + lastError.message);
    }
    throw lastError;
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
        
        // Download and decompress the image (CORS proxy handled in fetchAndDecompress)
        const imgBuffer = await fetchAndDecompress(IMAGE_URL);
        
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
