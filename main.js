// main.js - v86 Emulator initialization and control

let emulator = null;

// Configuration: Image source and CORS proxy settings
const IMAGE_URL = 'https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz';

// CORS proxies as fallback only - we'll try direct download first
// These are free, public services that add CORS headers to any URL
const CORS_PROXY_URLS = [
    'https://corsproxy.io/?',                    // corsproxy.io - reliable and fast
    'https://api.allorigins.win/raw?url=',       // allorigins.win - good fallback
    // Note: cors-anywhere may have rate limits on public deployments
];

// Constants for better readability
const BYTES_PER_MB = 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 300000; // 5 minutes

// Function to update status message
function updateStatus(message, show = true) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = show ? 'block' : 'none';
}

// Function to fetch and decompress the .img.gz file
async function fetchAndDecompress(url) {
    updateStatus('Downloading image file...');
    
    // Validate URL for security
    let isLocalPath = false;
    let isValidRemote = false;
    
    // First check if it looks like a local path (no protocol)
    if (!url.includes('://')) {
        isLocalPath = true;
    } else {
        // It has a protocol, so validate as remote URL
        try {
            const parsedUrl = new URL(url);
            
            // Check if it's a valid remote URL - must be HTTPS from specific GitHub path
            if (parsedUrl.protocol === 'https:' &&
                parsedUrl.hostname === 'github.com' && 
                parsedUrl.pathname.startsWith('/sriail/file-serving/releases/download/')) {
                isValidRemote = true;
            }
        } catch (e) {
            // Invalid URL - will be rejected
        }
    }
    
    if (!isLocalPath && !isValidRemote) {
        throw new Error('Invalid or unauthorized image URL');
    }
    
    // List of URLs to try - direct URL first, then CORS proxies
    const urlsToTry = [];
    
    // For remote URLs, try direct download first
    if (!isLocalPath) {
        urlsToTry.push(url);
    }
    
    // Add CORS proxies as fallback (only for remote URLs)
    if (!isLocalPath && CORS_PROXY_URLS.length > 0) {
        for (const proxyUrl of CORS_PROXY_URLS) {
            urlsToTry.push(proxyUrl + encodeURIComponent(url));
        }
    }
    
    // If it's a local path and no URLs were added, use the path directly
    if (urlsToTry.length === 0) {
        urlsToTry.push(url);
    }
    
    let lastError = null;
    
    // Try each URL until one succeeds
    for (let i = 0; i < urlsToTry.length; i++) {
        const tryUrl = urlsToTry[i];
        console.log(`Attempt ${i + 1}/${urlsToTry.length}: Trying URL:`, tryUrl);
        
        try {
            // Create an AbortController for timeout handling
            const controller = new AbortController();
            let timeoutOccurred = false;
            const timeoutId = setTimeout(() => {
                timeoutOccurred = true;
                controller.abort();
                console.warn('Request timeout - aborting fetch after', DOWNLOAD_TIMEOUT_MS / 1000, 'seconds');
            }, DOWNLOAD_TIMEOUT_MS);
            
            try {
                // Fetch with explicit CORS mode and abort signal
                const response = await fetch(tryUrl, {
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Accept': 'application/gzip, application/octet-stream'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Get content length for progress tracking
                const contentLength = response.headers.get('content-length');
                const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
                
                updateStatus('Decompressing image file...');
                console.log('Starting decompression, compressed size:', totalBytes, 'bytes');
                
                // Use the Compression Streams API to decompress the gzip file
                const ds = new DecompressionStream("gzip");
                const decompressedStream = response.body.pipeThrough(ds);
                
                // Read the decompressed stream in chunks for better memory management
                const reader = decompressedStream.getReader();
                const chunks = [];
                let receivedBytes = 0;
                let lastReportedMB = 0;
                
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        break;
                    }
                    
                    chunks.push(value);
                    receivedBytes += value.length;
                    
                    // Update status every MB for better feedback
                    const currentMB = Math.floor(receivedBytes / BYTES_PER_MB);
                    if (currentMB > lastReportedMB) {
                        updateStatus(`Decompressing... ${currentMB} MB decompressed`);
                        lastReportedMB = currentMB;
                    }
                }
                
                // Combine all chunks into a single ArrayBuffer
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const arrayBuffer = new ArrayBuffer(totalLength);
                const uint8View = new Uint8Array(arrayBuffer);
                
                let offset = 0;
                for (const chunk of chunks) {
                    uint8View.set(chunk, offset);
                    offset += chunk.length;
                }
                
                updateStatus('Image ready, initializing emulator...');
                console.log('Successfully downloaded and decompressed image from:', tryUrl);
                console.log('Decompressed size:', totalLength, 'bytes');
                return arrayBuffer;
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.warn(`Failed with URL ${tryUrl}:`, error.message);
            lastError = error;
            
            // Check if error is due to abort and enhance the message
            if (error.name === 'AbortError') {
                console.error('Download was aborted due to timeout or manual cancellation');
                // Enhance error message but preserve the AbortError type
                error.message = timeoutOccurred 
                    ? 'Download timeout - the file is too large or connection is too slow. Please try again or use a faster connection.'
                    : 'Download was aborted - ' + error.message;
            }
            
            // If this isn't the last URL, try the next one
            if (i < urlsToTry.length - 1) {
                // Determine what we're trying next based on current position
                let nextAttemptType;
                if (i === 0 && !isLocalPath) {
                    // We just failed direct download, trying first CORS proxy
                    nextAttemptType = 'CORS proxy';
                } else {
                    // We failed a CORS proxy, trying another one
                    nextAttemptType = 'alternative proxy';
                }
                updateStatus(`Download failed, trying ${nextAttemptType} (${i + 2}/${urlsToTry.length})...`);
                continue;
            }
        }
    }
    
    // All attempts failed
    console.error('All download attempts failed:', lastError);
    
    // Provide more helpful error message for CORS and network issues
    const errorMsg = lastError.message.toLowerCase();
    if (lastError.name === 'AbortError') {
        updateStatus('Error: Download was aborted. ' + lastError.message);
    } else if (lastError.name === 'TypeError' && 
        (errorMsg.includes('failed to fetch') || 
         errorMsg.includes('networkerror') || 
         errorMsg.includes('cors'))) {
        updateStatus('Error: Unable to download image. Direct download and CORS proxies failed. Please ensure the server has proper CORS headers or try again later.');
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
    const ramBytes = ramMB * BYTES_PER_MB;
    const vramBytes = vramMB * BYTES_PER_MB;
    
    try {
        console.log('Starting emulator with RAM:', ramMB, 'MB, VRAM:', vramMB, 'MB');
        
        // Download and decompress the image (CORS proxy handled in fetchAndDecompress)
        const imgBuffer = await fetchAndDecompress(IMAGE_URL);
        
        console.log('Image decompressed, size:', imgBuffer.byteLength, 'bytes');
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
