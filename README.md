# Browser in Browser - v86 Emulator

A simple web-based x86 emulator using v86 that loads and runs Alpine Linux with Midori browser.

## Features

- Browser-based x86 emulation using v86
- Local loading of OS images
- Configurable RAM (256MB - 8GB)
- Configurable VRAM (8MB - 64MB)
- Simple, user-friendly interface
- **All required v86 and BIOS files included** - no manual downloads needed!

## Setup Instructions

### 1. Download the OS Image

The emulator requires an OS image file that is not included in the repository due to its large size.

**Download the Alpine Linux with Midori browser image:**

```bash
cd images
curl -L -o alpine-midori.img.gz https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz
gunzip alpine-midori.img.gz
```

Or download and extract it manually from:
https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz

**Important:** Place the extracted `alpine-midori.img` file in the `images/` folder.

### 2. Run a Local Web Server

Due to browser security restrictions with WebAssembly, you need to serve the files through a web server:

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

### 3. Open in Browser

Navigate to `http://localhost:8000` in your web browser.

## Usage

1. Ensure `alpine-midori.img` is in the `images/` folder
2. Select desired RAM amount (default: 816MB)
3. Select desired VRAM amount (default: 16MB)
4. Click "Start" button
5. Wait for the image to load
6. The Alpine Linux system will boot automatically

## Technical Details

- **OS Image**: Alpine Linux with Midori browser
- **Image Location**: `images/alpine-midori.img` (downloaded and extracted separately)
- **Emulator**: v86 (x86 emulator in JavaScript/WebAssembly)

## File Structure

```
/
├── index.html          # Main HTML page with UI
├── main.js            # Emulator initialization logic
├── libv86.js          # v86 library (included)
├── v86.wasm           # v86 WebAssembly module (included)
├── bios/
│   ├── seabios.bin   # BIOS file (included)
│   └── vgabios.bin   # VGA BIOS file (included)
└── images/           # Place your OS image here
    ├── README.md     # Instructions for downloading images
    └── alpine-midori.img  # OS image (download and extract separately)
```

## Notes

- The OS image file is loaded locally from the `images/` folder
- Large images may take time to load (the Alpine image is ~1GB uncompressed)
- The emulator requires WebAssembly support

## Troubleshooting

**Error: "Image file not found"**
- Make sure you have downloaded and extracted `alpine-midori.img` and placed it in the `images/` folder
- Check that the filename is exactly `alpine-midori.img`

**Error: "Failed to load image file"**
- Ensure you are running a local web server (not opening the HTML file directly)
- Try a different web server (Python, Node.js, or PHP)

## License

See LICENSE file for details.
