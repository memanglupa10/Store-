const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const serveFile = (targetPath, res) => {
  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });

  const stream = fs.createReadStream(targetPath);
  stream.pipe(res);
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(PUBLIC_DIR, decodeURIComponent(reqUrl));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      return serveFile(filePath, res);
    }

    if (!err && stats.isFile()) {
      return serveFile(filePath, res);
    }

    // SPA fallback: if request has no extension or target file doesn't exist, serve root index.html
    const rootIndex = path.join(PUBLIC_DIR, 'index.html');
    fs.stat(rootIndex, (indexErr, indexStats) => {
      if (!indexErr && indexStats.isFile()) {
        return serveFile(rootIndex, res);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    });
  });
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Babyiel Store Inventory running on port ${PORT}`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
