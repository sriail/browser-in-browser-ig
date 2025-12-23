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

If you encounter CORS (Cross-Origin Resource Sharing) errors when downloading the OS image:

1. **Enable CORS on your local server:**
   - For `http-server` (Node.js): Use `npx http-server -p 8000 --cors`
   - For Python: The built-in server doesn't easily support CORS headers, consider using `http-server` instead
   - For Apache: The `.htaccess` file in this repository will automatically enable CORS
   
2. **Check browser console:** Look for specific error messages about "Access-Control-Allow-Origin"

3. **Alternative solution - Use a CORS proxy:**
   If the GitHub releases URL is blocked by CORS, you can modify `main.js` to use a CORS proxy service like:
   ```javascript
   const imageUrl = 'https://cors-anywhere.herokuapp.com/https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz';
   ```
   Note: Public CORS proxies may have rate limits. Consider setting up your own CORS proxy for production use.

4. **Download image locally:**
   You can download the image file manually and place it in a local `images/` directory, then update the URL in `main.js` to point to the local file:
   ```javascript
   const imageUrl = 'images/alpine-midori.img.gz';
   ```

## License

See LICENSE file for details.
