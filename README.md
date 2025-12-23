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

## CORS Handling

**Good News:** CORS issues are now handled automatically! The emulator uses a public CORS proxy service by default, so you don't need to do anything special.

### How It Works

GitHub releases do not send CORS headers (`Access-Control-Allow-Origin`), which would normally prevent browsers from downloading files directly. The emulator now automatically uses a public CORS proxy service (cors.sh) to work around this limitation.

The download process will:
1. Try the primary CORS proxy (cors.sh)
2. If that fails, try the local CORS proxy (if you're running cors-proxy.js)
3. Provide clear error messages if all methods fail

### Optional: Running a Local CORS Proxy

If you prefer to use a local CORS proxy for better privacy or reliability:

1. **Start the CORS proxy server** (in a separate terminal):
   ```bash
   node cors-proxy.js
   ```
   This will start a proxy server on `http://localhost:8080`

2. **Start the web server** (in another terminal):
   ```bash
   npx http-server -p 8000 --cors
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

The emulator will automatically detect and use your local CORS proxy as a fallback if the public proxy fails.

### Alternative: Download the Image Locally

If you prefer not to use any proxy service, you can download the image file manually:

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
   And disable the CORS proxy:
   ```javascript
   const USE_CORS_PROXY = false;
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
- The CORS proxy solves this by adding the necessary headers

## License

See LICENSE file for details.
