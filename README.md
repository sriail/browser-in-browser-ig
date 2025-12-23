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

Due to browser security restrictions with WebAssembly and CORS, you need to serve the files through a web server:

Using Python 3:
```bash
python3 -m http.server 8000
```

Using Node.js (with `http-server` and CORS enabled):
```bash
npx http-server -p 8000 --cors
```

Using PHP:
```bash
php -S localhost:8000
```

**Important:** If you encounter CORS errors when downloading the OS image, ensure your web server has CORS enabled. The repository includes configuration files for various server types:
- `.htaccess` - For Apache servers
- `vercel.json` - For Vercel deployments
- `_headers` - For Netlify deployments
- `http-server.config.json` - For http-server (Node.js)

For `http-server`, use the `--cors` flag as shown above to enable CORS support.

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

## Troubleshooting CORS Issues

**Important:** GitHub releases do not send CORS headers (`Access-Control-Allow-Origin`), which prevents browsers from downloading files directly from cross-origin requests. This is a security feature of browsers.

If you encounter CORS (Cross-Origin Resource Sharing) errors when downloading the OS image, use one of these solutions:

### Solution 1: Use the Built-in CORS Proxy (Recommended for Development)

This repository includes a simple CORS proxy server that you can run locally:

1. **Start the CORS proxy server** (in a separate terminal):
   ```bash
   node cors-proxy.js
   ```
   This will start a proxy server on `http://localhost:8080`

2. **Enable the proxy in main.js**:
   Open `main.js` and change:
   ```javascript
   const USE_CORS_PROXY = false;
   ```
   to:
   ```javascript
   const USE_CORS_PROXY = true;
   ```

3. **Start the web server** (in another terminal):
   ```bash
   npx http-server -p 8000 --cors
   ```

4. **Open in browser**: Navigate to `http://localhost:8000`

### Solution 2: Use http-server with CORS enabled

The simplest solution is to use `http-server` with CORS enabled:

```bash
npx http-server -p 8000 --cors
```

Note: This enables CORS for your local server but doesn't solve the GitHub releases CORS issue. You still need the CORS proxy.

### Solution 3: Download the Image Locally

Download the image file manually and serve it locally:

1. **Download the image**:
   ```bash
   mkdir -p images
   curl -L -o images/alpine-midori.img.gz https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz
   ```

2. **Update main.js**:
   Change the image URL to:
   ```javascript
   const imageUrl = 'images/alpine-midori.img.gz';
   ```

3. **Start the server**:
   ```bash
   npx http-server -p 8000 --cors
   ```

### Solution 4: Use a Public CORS Proxy (Not Recommended for Production)

Modify `main.js` to use a public CORS proxy service:
```javascript
const imageUrl = 'https://cors-anywhere.herokuapp.com/https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz';
```

**Warning**: Public CORS proxies have rate limits and are not reliable for production use.

### Why Does This Happen?

- GitHub releases (`github.com`) don't include `Access-Control-Allow-Origin` headers in their responses
- Browsers block cross-origin requests that lack proper CORS headers for security reasons
- The error appears as `ERR_BLOCKED_BY_CLIENT` or `Failed to fetch` in the console
- This affects all browsers (Chrome, Firefox, Safari, Edge) due to the Same-Origin Policy

## License

See LICENSE file for details.
