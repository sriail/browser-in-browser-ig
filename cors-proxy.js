// Simple CORS proxy server for development
// This server proxies requests to GitHub releases to avoid CORS issues
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Extract the target URL from the request
  const targetPath = req.url.substring(1); // Remove leading slash
  
  if (!targetPath) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('CORS Proxy Server is running. Usage: http://localhost:8080/https://...');
    return;
  }
  
  console.log('Proxying request to:', targetPath);
  
  // Parse the target URL
  let targetUrl;
  try {
    targetUrl = new url.URL(targetPath);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid URL');
    return;
  }
  
  // Function to make the request and follow redirects
  function makeRequest(currentUrl, redirectCount = 0) {
    if (redirectCount > 5) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Too many redirects');
      return;
    }
    
    const parsedUrl = new url.URL(currentUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: {
        'User-Agent': 'CORS-Proxy',
        'Accept': '*/*'
      }
    };
    
    // Choose http or https module based on protocol
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const proxy = protocol.request(options, (targetRes) => {
      // Check if it's a redirect
      if (targetRes.statusCode >= 300 && targetRes.statusCode < 400 && targetRes.headers.location) {
        const redirectUrl = targetRes.headers.location;
        console.log('Following redirect to:', redirectUrl);
        makeRequest(redirectUrl, redirectCount + 1);
        return;
      }
      
      // Copy safe headers from target response, excluding headers that might interfere
      const safeHeaders = {};
      const headersToSkip = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-expose-headers',
        'access-control-allow-credentials',
        'connection',
        'keep-alive',
        'transfer-encoding'
        // Note: content-encoding and content-length are preserved for proper handling
      ];
      
      for (const [key, value] of Object.entries(targetRes.headers)) {
        const lowerKey = key.toLowerCase();
        if (!headersToSkip.includes(lowerKey)) {
          safeHeaders[key] = value;
        }
      }
      
      // Set CORS headers
      safeHeaders['Access-Control-Allow-Origin'] = '*';
      safeHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      safeHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      
      res.writeHead(targetRes.statusCode, safeHeaders);
      
      // Pipe the response
      targetRes.pipe(res);
    });
    
    proxy.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error: ' + err.message);
    });
    
    proxy.end();
  }
  
  makeRequest(targetUrl.href);
});

server.listen(PORT, () => {
  console.log(`CORS Proxy server listening on http://localhost:${PORT}`);
  console.log(`Usage: http://localhost:${PORT}/https://github.com/...`);
});
