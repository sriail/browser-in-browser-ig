# Browser in Browser - v86 Emulator

A simple web-based x86 emulator using v86 that loads and runs Alpine Linux with Midori browser.

## Features

- Browser-based x86 emulation using v86
- Automatic download and decompression of gzipped OS images
- Configurable RAM (32MB - 512MB)
- Configurable VRAM (2MB - 32MB)
- Simple, user-friendly interface

## Setup Instructions

### 1. Download v86 Library Files

Download the v86 library files from the [v86 releases page](https://github.com/copy/v86/releases):

1. Download `libv86.js` and place it in the root directory
2. Download `v86.wasm` and place it in the root directory

Or use these direct commands:

```bash
# Download v86 library files
wget https://github.com/copy/v86/releases/download/latest/libv86.js
wget https://github.com/copy/v86/releases/download/latest/v86.wasm
```

### 2. Download BIOS Files

Download the BIOS files and place them in the `bios/` directory:

```bash
# Create bios directory and download BIOS files
mkdir -p bios
cd bios
wget https://github.com/copy/v86/raw/master/bios/seabios.bin
wget https://github.com/copy/v86/raw/master/bios/vgabios.bin
cd ..
```

### 3. Run a Local Web Server

Due to browser security restrictions with WebAssembly and CORS, you need to serve the files through a web server:

Using Python 3:
```bash
python3 -m http.server 8000
```

Using Node.js (with `http-server`):
```bash
npx http-server -p 8000
```

Using PHP:
```bash
php -S localhost:8000
```

### 4. Open in Browser

Navigate to `http://localhost:8000` in your web browser.

## Usage

1. Select desired RAM amount (default: 128MB)
2. Select desired VRAM amount (default: 8MB)
3. Click "Start Emulator"
4. Wait for the image to download and decompress
5. The Alpine Linux system will boot automatically

## Technical Details

- **OS Image**: Alpine Linux with Midori browser
- **Image Source**: https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz
- **Emulator**: v86 (x86 emulator in JavaScript/WebAssembly)
- **Decompression**: Uses browser's native DecompressionStream API

## File Structure

```
/
├── index.html          # Main HTML page with UI
├── main.js            # Emulator initialization logic
├── libv86.js          # v86 library (download separately)
├── v86.wasm           # v86 WebAssembly module (download separately)
├── bios/
│   ├── seabios.bin   # BIOS file (download separately)
│   └── vgabios.bin   # VGA BIOS file (download separately)
└── images/           # Optional: for local OS images
```

## Notes

- The OS image is fetched directly from GitHub releases on demand
- Large images may take time to download and decompress
- Ensure your browser supports the DecompressionStream API (modern browsers)
- The emulator requires WebAssembly support

## License

See LICENSE file for details.
