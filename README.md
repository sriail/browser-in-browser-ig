# Browser in Browser - v86 Emulator

A simple web-based x86 emulator using v86 that loads and runs Alpine Linux with Midori browser.

## Features

- Browser-based x86 emulation using v86
- Automatic download and decompression of gzipped OS images
- Configurable RAM (32MB - 512MB)
- Configurable VRAM (2MB - 32MB)
- Simple, user-friendly interface
- **All required v86 and BIOS files included** - no manual downloads needed!

## Setup Instructions

**Note:** All required v86 library files and BIOS files are now included in the repository. You can start using the emulator immediately after cloning!

### 1. Run a Local Web Server

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

**Note:** You don't need to enable CORS on your local server. The emulator handles CORS automatically using public proxy services when downloading the OS image from GitHub.

### 2. Open in Browser

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
├── libv86.js          # v86 library (included)
├── v86.wasm           # v86 WebAssembly module (included)
├── bios/
│   ├── seabios.bin   # BIOS file (included)
│   └── vgabios.bin   # VGA BIOS file (included)
└── images/           # Optional: for local OS images
```

## Notes

- The OS image is fetched directly from GitHub releases on demand
- Large images may take time to download and decompress
- Ensure your browser supports the DecompressionStream API (modern browsers)
- The emulator requires WebAssembly support

## CORS Handling

**Good News:** CORS issues are now handled automatically using reliable public CORS proxy services! You don't need to run any separate server.

### How It Works

GitHub releases do not send CORS headers (`Access-Control-Allow-Origin`), which prevents browsers from downloading files directly due to browser security policies. The emulator automatically handles this by using multiple reliable public CORS proxy services.

The download process will:
1. Try the primary CORS proxy (corsproxy.io)
2. If that fails, try alternative proxies (allorigins.win, cors-anywhere)
3. Provide clear error messages if all proxies fail

All of this happens automatically in the browser - no server setup required!

### Alternative: Download the Image Locally

If you prefer not to use any proxy service, you can download the image file manually:

1. **Download the image**:
   ```bash
   mkdir -p images
   curl -L -o images/alpine-midori.img.gz https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz
   ```

2. **Update main.js**:
   Change the image URL at the top of the file to:
   ```javascript
   const IMAGE_URL = 'images/alpine-midori.img.gz';
   ```
   And update the CORS proxy URLs to an empty array:
   ```javascript
   const CORS_PROXY_URLS = [];
   ```

3. **Start the server**:
   ```bash
   npx http-server -p 8000 --cors
   ```

### Why Does CORS Matter?

- GitHub releases (`github.com`) don't include `Access-Control-Allow-Origin` headers in their responses
- Browsers block cross-origin requests that lack proper CORS headers for security reasons
- The error appears as `ERR_BLOCKED_BY_CLIENT` or `Failed to fetch` in the console
- This affects all browsers (Chrome, Firefox, Safari, Edge) due to the Same-Origin Policy
- Public CORS proxy services solve this by adding the necessary headers

## License

See LICENSE file for details.
