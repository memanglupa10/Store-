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
