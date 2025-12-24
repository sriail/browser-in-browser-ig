# Browser in Browser - CPU Emulators

A web-based CPU emulator project that provides both 32-bit and 64-bit emulation options.

## Emulator Options

### 🔷 v86 Emulator (32-bit) - `index.html`
- Browser-based 32-bit x86 emulation using v86
- Pre-built, ready to use
- Configurable RAM (256MB - 8GB)
- Configurable VRAM (8MB - 64MB)
- **All required v86 and BIOS files included** - no manual downloads needed!

### 🔶 QEMU Emulator (64-bit) - `index-64bit.html`
- Browser-based 64-bit x86_64 emulation using QEMU WebAssembly
- Supports modern 64-bit operating systems and applications
- Full x86_64 instruction set
- Requires more resources than v86
- Links to demo and build instructions provided

## Features

- **Dual architecture support**: Choose between 32-bit (v86) or 64-bit (QEMU) emulation
- Local loading of OS images (for v86)
- Simple, user-friendly interface
- Browser-based - no installation required

## Setup Instructions

### Option 1: v86 Emulator (32-bit)

#### 1. Download the OS Image

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

#### 2. Run a Local Web Server

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

#### 3. Open in Browser

Navigate to `http://localhost:8000` in your web browser to use the v86 (32-bit) emulator.

### Option 2: QEMU Emulator (64-bit)

For 64-bit x86_64 emulation:

1. Follow steps 2 above to run a local web server
2. Navigate to `http://localhost:8000/index-64bit.html`
3. Click "Launch QEMU Demo" to try the 64-bit Alpine Linux demo
4. For custom setups, follow the build instructions on the page

**Note**: The QEMU-based emulator requires building from source for custom OS images. See the [QEMU-wasm repository](https://github.com/ktock/qemu-wasm) for detailed build instructions.

## Usage

### v86 Emulator (32-bit)

1. Ensure `alpine-midori.img` is in the `images/` folder
2. Select desired RAM amount (default: 816MB)
3. Select desired VRAM amount (default: 16MB)
4. Click "Start" button
5. Wait for the image to load
6. The Alpine Linux system will boot automatically

### QEMU Emulator (64-bit)

1. Open `index-64bit.html` in your browser
2. Click "Launch QEMU Demo" to open the 64-bit Alpine Linux demo
3. The demo runs Alpine Linux x86_64 with vim, python3, wget, etc.
4. Login as root when prompted

## Technical Details

### v86 (32-bit)

- **OS Image**: Alpine Linux with Midori browser
- **Image Location**: `images/alpine-midori.img` (downloaded and extracted separately)
- **Emulator**: v86 (x86 32-bit emulator in JavaScript/WebAssembly)
- **Image Loading**: Large disk images (up to 8GB) are loaded asynchronously by v86, fetching data on-demand rather than loading the entire file into memory

### QEMU (64-bit)

- **CPU Architecture**: x86_64 (64-bit)
- **Emulator**: QEMU compiled to WebAssembly via Emscripten
- **OS Support**: Modern 64-bit Linux distributions
- **Demo**: Alpine Linux x86_64 (hosted on GitHub Pages)
- **Custom Images**: Requires building QEMU-wasm from source

## Comparison: 32-bit vs 64-bit

| Feature | v86 (32-bit) | QEMU (64-bit) |
|---------|--------------|---------------|
| CPU Architecture | x86 (32-bit) | x86_64 (64-bit) |
| Setup Complexity | Simple | Complex (requires build for custom images) |
| File Size | ~2MB | ~15-20MB |
| Performance | Fast | Moderate |
| OS Support | 32-bit OSes only | Modern 64-bit OSes |
| Memory Addressing | Limited to 4GB | Full 64-bit addressing |
| Use Case | Legacy software, simple setups | Modern applications, larger memory needs |

## File Structure

```
/
├── index.html          # Main HTML page with v86 (32-bit) emulator
├── index-64bit.html    # QEMU (64-bit) emulator information and demo launcher
├── main.js            # v86 emulator initialization logic
├── libv86.js          # v86 library (included)
├── v86.wasm           # v86 WebAssembly module (included)
├── bios/
│   ├── seabios.bin   # BIOS file (included)
│   └── vgabios.bin   # VGA BIOS file (included)
└── images/           # Place your OS image here (for v86)
    ├── README.md     # Instructions for downloading images
    └── alpine-midori.img  # OS image (download and extract separately)
```

## Notes

### v86 (32-bit)

- The OS image file is loaded asynchronously by the v86 emulator
- Large images (up to 8GB) are fetched on-demand in chunks, not loaded entirely into memory
- The emulator will start quickly and fetch disk data as needed during operation
- Initial boot may be slower as the emulator fetches necessary blocks from the image
- The emulator requires WebAssembly support

### QEMU (64-bit)

- Requires significantly more resources than v86
- Initial load time is longer due to larger WebAssembly file size
- Custom OS images require building QEMU-wasm from source with Docker/Emscripten
- The demo version uses a pre-built Alpine Linux x86_64 image
- Full 64-bit instruction set support enables running modern applications

## Building QEMU-wasm for Custom Setups

To create your own QEMU-wasm setup with custom 64-bit OS images:

### Prerequisites

- Docker installed on your system
- Git
- At least 8GB of free disk space
- Basic knowledge of Linux and command line

### Build Steps

1. Clone the QEMU-wasm repository:
```bash
git clone https://github.com/ktock/qemu-wasm.git
cd qemu-wasm
```

2. Build QEMU with Emscripten using Docker:
```bash
docker build -t qemu-wasm .
```

3. Follow the examples in the repository to create your disk images:
```bash
# See examples/x86_64-alpine/ for Alpine Linux setup
# See examples/networking/ for networking configuration
```

4. The build process generates:
   - `qemu-system-x86_64.wasm` - The WebAssembly binary
   - `qemu-system-x86_64.js` - The JavaScript loader
   - Supporting files for your OS image (kernel, initramfs, rootfs)

5. Host the generated files on a web server alongside your HTML page

For detailed instructions, see the [QEMU-wasm repository](https://github.com/ktock/qemu-wasm) and the [demo repository](https://github.com/ktock/qemu-wasm-demo).

## Resources

- **v86**: [GitHub Repository](https://github.com/copy/v86)
- **QEMU-wasm**: [GitHub Repository](https://github.com/ktock/qemu-wasm)
- **QEMU-wasm Demo**: [Live Demo](https://ktock.github.io/qemu-wasm-demo/)
- **Official QEMU**: [Website](https://www.qemu.org/)

## Troubleshooting

**Error: "Image file not found"**
- Make sure you have downloaded and extracted `alpine-midori.img` and placed it in the `images/` folder
- Check that the filename is exactly `alpine-midori.img`

**Error: "Failed to load image file"**
- Ensure you are running a local web server (not opening the HTML file directly)
- Try a different web server (Python, Node.js, or PHP)

## License

See LICENSE file for details.
