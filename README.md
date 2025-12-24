# Browser in Browser - v86 based Emulator

A simple web-based 64-bit x86_64 emulator using QEMU compiled to WebAssembly.

## Features

- Browser-based 64-bit x86_64 emulation using QEMU WebAssembly
- Configurable RAM (256MB - 8GB)
- Configurable VRAM (8MB - 64MB)
- Simple, user-friendly interface
- Runs Alpine Linux x86_64 with vim, python3, wget, and more

## Setup Instructions

### Run a Local Web Server

Due to browser security restrictions, you need to serve the files through a web server:

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

### Open in Browser

Navigate to `http://localhost:8000` in your web browser.

## Usage

1. Select desired RAM amount (default: 816MB)
2. Select desired VRAM amount (default: 16MB)
3. Click "Start" button
4. The QEMU emulator will open in a new window
5. Login as root when prompted

## Technical Details

- **Emulator**: QEMU compiled to WebAssembly (x86_64 64-bit)
- **Demo OS**: Alpine Linux x86_64
- **Demo Location**: https://ktock.github.io/qemu-wasm-demo/
- **Full x86_64 instruction set support**

## Resources

- **QEMU-wasm**: [GitHub Repository](https://github.com/ktock/qemu-wasm)
- **QEMU-wasm Demo**: [Live Demo](https://ktock.github.io/qemu-wasm-demo/)
- **Official QEMU**: [Website](https://www.qemu.org/)

## License

See LICENSE file for details.
