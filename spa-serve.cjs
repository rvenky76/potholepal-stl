#!/usr/bin/env node
// Minimal static file server with SPA fallback: unknown paths serve index.html
// so expo-router client-side navigation works. Loopback-only.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || 'dist';
const PORT = Number(process.argv[3] || 8099);
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.map': 'application/json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(ROOT, urlPath);
    if (urlPath === '/' || !path.extname(filePath)) {
      // directory or extensionless (client route) -> try file, else index.html
      const candidate = urlPath === '/' ? path.join(ROOT, 'index.html') : filePath;
      if (!fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) {
        filePath = path.join(ROOT, 'index.html');
      }
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // SPA fallback
        fs.readFile(path.join(ROOT, 'index.html'), (e2, idx) => {
          if (e2) { res.writeHead(404); res.end('not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(idx);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(PORT, HOST, () => console.log(`serving ${ROOT} at http://${HOST}:${PORT}`));
