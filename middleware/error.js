/**
 * middleware/error.js
 * Centralized Error Handling, 404 Handler & Async Route Wrapper
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const path = require('path');

// Async Error Handler Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 Not Found Middleware
function notFoundHandler(req, res, next) {
  const rawUrl = req.originalUrl || req.url || req.path || '';
  const cleanPath = rawUrl.split('?')[0];

  // If request is for an API route, return JSON 404
  if (cleanPath.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint API '${cleanPath}' tidak ditemukan.`
    });
  }

  const fs = require('fs');
  if (cleanPath !== '/') {
    const candidateFiles = [
      path.join(process.cwd(), 'public', cleanPath),
      path.join(process.cwd(), cleanPath),
      path.join(__dirname, '..', 'public', cleanPath),
      path.join(__dirname, '..', cleanPath)
    ];

    for (const file of candidateFiles) {
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        return res.sendFile(file);
      }
    }
  }

  // Single Page Application (SPA) Fallback for storefront routes
  const spaRoutes = ['/login', '/admin', '/katalog', '/dashboard', '/stock', '/products', '/settings'];
  if (spaRoutes.some(route => cleanPath.startsWith(route)) || cleanPath === '/') {
    const spaCandidates = [
      path.join(process.cwd(), 'public', 'index.html'),
      path.join(process.cwd(), 'index.html'),
      path.join(__dirname, '..', 'public', 'index.html'),
      path.join(__dirname, '..', 'index.html')
    ];
    for (const spaFile of spaCandidates) {
      if (fs.existsSync(spaFile)) {
        return res.sendFile(spaFile);
      }
    }
  }

  res.status(404).json({
    success: false,
    message: 'Halaman tidak ditemukan.'
  });
}

// Centralized Error Handling Middleware
function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err.stack || err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  asyncHandler,
  notFoundHandler,
  errorHandler
};
