# Browser Emulator

A browser-in-browser emulator using v86 to run Alpine Linux with Midori browser.

## Features

- Emulates x86 hardware in the browser using v86
- Runs Alpine Linux with Midori browser
- Downloads and decompresses the disk image on-the-fly
- Shows download progress with bytes downloaded
- Status updates: "Downloading...", "Decompressing...", "Booting..."
- Error handling for network and decompression failures

## Requirements

- A modern web browser with WebAssembly support
- A web server to serve the files (required for WASM and CORS)

## Files

- `index.html` - Main HTML file with the emulator
- `libv86.js` - v86 JavaScript library
- `v86.wasm` - v86 WebAssembly binary

## Usage

1. Serve the files using any web server:
   ```bash
   # Using Python
   python3 -m http.server 8080
   
   # Or using Node.js
   npx serve .
   ```

2. Open `http://localhost:8080/index.html` in your browser

3. Wait for the Alpine Midori image to download and decompress

4. The system will boot automatically

## How It Works

1. **Download**: The Alpine Midori image is fetched from GitHub releases with progress tracking
2. **Decompress**: The gzip-compressed image is decompressed using the pako library
3. **Boot**: v86 boots the system from the decompressed disk image

## Dependencies

- [v86](https://github.com/copy/v86) - x86 virtualization in the browser
- [pako](https://github.com/nodeca/pako) - zlib port to JavaScript (loaded via CDN)

## License

GPL-3.0 License
