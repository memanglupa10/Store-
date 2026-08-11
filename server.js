/**
 * server.js
 * Production-Ready Enterprise Express Application & Server
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const http = require('http');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const config = require('./config/env');
const dbHelper = require('./config/db');
const {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  apiLimiter,
  applySecurityHeaders
} = require('./middleware/security');
const { notFoundHandler, errorHandler } = require('./middleware/error');

const healthRouter = require('./routes/health');
const apiRouter = require('./routes/api');

// Auto Git Clean on cPanel Server Startup (Keeps repository 100% clean for cPanel Git Deployment)
try {
  const { execSync } = require('child_process');
  const fs = require('fs');
  const repoDir = '/home/babyiels/repositories/Store-';
  const targetDir = fs.existsSync(repoDir) ? repoDir : __dirname;
  execSync('git reset --hard HEAD && git clean -fd', { cwd: targetDir, stdio: 'ignore', timeout: 5000 });
  console.log('[cPanel Auto-Clean] Discarded local uncommitted server changes.');
} catch (gitErr) {
  console.warn('[cPanel Auto-Clean Notice]:', gitErr.message);
}

// Auto Copy-Sync /home/babyiels/store/* to /home/babyiels/public_html/* for Instant Live Website Updates
try {
  const fs = require('fs');
  const path = require('path');
  const repoDir = '/home/babyiels/repositories/Store-';
  const storeDir = '/home/babyiels/store';
  const publicDir = '/home/babyiels/public_html';

  // Auto Purge Dummy Stocks in database.json across cPanel paths
  [repoDir, storeDir, publicDir, path.join(__dirname, 'public'), __dirname].forEach(dir => {
    const dbPath = path.join(dir, 'data', 'database.json');
    if (fs.existsSync(dbPath)) {
      try {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (dbData && dbData.stocks && dbData.stocks.length > 0 && dbData.stocks.some(s => s.email && (s.email.includes('@babyiel.com') || s.email.includes('.ready')))) {
          dbData.stocks = [];
          dbData.orders = [];
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
          console.log(`[Auto-Wipe] Cleared dummy stocks in ${dbPath}`);
        }
      } catch (e) {}
    }
  });

  const actualStoreDir = fs.existsSync(repoDir) ? repoDir : (fs.existsSync(storeDir) ? storeDir : null);
  if (actualStoreDir && fs.existsSync(publicDir) && actualStoreDir !== publicDir) {
    const filesToSync = ['index.html', 'js/app.js', 'js/database.js', 'css/style.css', 'deploy.php', '.htaccess'];
    filesToSync.forEach(f => {
      const src = path.join(actualStoreDir, f);
      const dest = path.join(publicDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });
    function copyFolderRecursive(src, dest) {
      if (!fs.existsSync(src)) return;
      if (!fs.existsSync(dest)) {
        try { fs.mkdirSync(dest, { recursive: true }); } catch (e) {}
      }
      const items = fs.readdirSync(src);
      items.forEach(item => {
        const srcItem = path.join(src, item);
        const destItem = path.join(dest, item);
        try {
          if (fs.statSync(srcItem).isDirectory()) {
            copyFolderRecursive(srcItem, destItem);
          } else {
            fs.copyFileSync(srcItem, destItem);
          }
        } catch (e) {}
      });
    }

    const srcAssets = path.join(storeDir, 'assets');
    const destAssets = path.join(publicDir, 'assets');
    copyFolderRecursive(srcAssets, destAssets);
    console.log('[cPanel Public-Sync] Synced latest frontend & assets to public_html.');
  }
} catch (syncErr) {
  console.warn('[cPanel Public-Sync Notice]:', syncErr.message);
}

// Initialize Database Connection Pool
dbHelper.initDB();

const app = express();

// 1. Trust Proxy Configuration for Render, Railway, Nginx, Cloudflare, & Vercel
app.set('trust proxy', config.server.trustProxy || 1);

// 2. Disable x-powered-by Header
app.disable('x-powered-by');

// 3. Global Logging Middleware
const logFormat = config.isProduction ? 'combined' : 'dev';
app.use(morgan(logFormat));

// 4. Security & Performance Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(applySecurityHeaders);

// 5. Body Parsing with Strict Payload Size Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 6. Static File Serving with Strict No-Cache Headers for Instant Updates
const PUBLIC_DIR = __dirname;
app.use(express.static(PUBLIC_DIR, {
  maxAge: 0,
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// 7. Rate Limiter on API Endpoints
app.use('/api', apiLimiter);

// 8. Health Check Endpoints
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);

// 9. Primary API Routes
app.use('/api', apiRouter);

// 10. SPA Routing & 404 Error Handling
app.use(notFoundHandler);

// 11. Centralized Error Handling Middleware
app.use(errorHandler);

// HTTP Server Instance
const PORT = config.server.port;
const server = http.createServer(app);

// Graceful Shutdown Handler
async function gracefulShutdown(signal) {
  console.log(`\n[SYSTEM] ${signal} received. Initiating graceful shutdown...`);
  
  server.close(async () => {
    console.log('[SYSTEM] HTTP server stopped accepting connections.');
    await dbHelper.closePool();
    console.log('[SYSTEM] Process exited cleanly.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[SYSTEM ERROR] Forceful shutdown triggered due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start Server when not in Serverless Vercel context
if (!config.isVercel && !server.listening) {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Babyiel Store Express Server running on port/socket ${PORT}`);
    console.log(`🔒 Security Hardening: Helmet, CORS, Rate-Limit & Compression Active`);
    console.log(`🗄️ Database Mode: ${dbHelper.checkIsMySQL() ? 'MySQL Connection Pool' : 'JSON Storage Fallback'}`);
    console.log(`===================================================`);
  });
}

// Export Express Application for Vercel Serverless Function & Testing
module.exports = app;
module.exports.server = server;
