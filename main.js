// main.js - v86 Emulator initialization and control

let emulator = null;

// Configuration: Local image path
// Place your alpine-midori.img.gz file in the images/ folder
const IMAGE_URL = 'images/alpine-midori.img.gz';

// Constants for better readability
const BYTES_PER_MB = 1024 * 1024;

// Function to update status message
function updateStatus(message, show = true) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = show ? 'block' : 'none';
}

// Function to fetch and decompress the .img.gz file from local storage
async function fetchAndDecompress(url) {
    updateStatus('Loading image file...');
    
    console.log('Loading image from:', url);
    
    try {
        // Fetch the local file
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to load image file. Status: ${response.status}. Make sure you have placed alpine-midori.img.gz in the images/ folder.`);
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
        console.log('Successfully loaded and decompressed image');
        console.log('Decompressed size:', totalLength, 'bytes');
        return arrayBuffer;
    } catch (error) {
        console.error('Failed to load image:', error);
        
        // Provide helpful error message
        if (error.message.includes('Status: 404')) {
            updateStatus('Error: Image file not found. Please download alpine-midori.img.gz and place it in the images/ folder. See images/README.md for instructions.');
        } else if (error.name === 'TypeError' && error.message.toLowerCase().includes('failed to fetch')) {
            updateStatus('Error: Failed to load image file. Make sure alpine-midori.img.gz is in the images/ folder and you are running a local web server.');
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
