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
  // If request is for an API route, return JSON 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint API '${req.originalUrl}' tidak ditemukan.`
    });
  }

  const reqPath = req.path || '';
  const fs = require('fs');
  const targetPublic = path.join(process.cwd(), 'public', reqPath);
  const targetRoot = path.join(process.cwd(), reqPath);

  // Static file fallback check
  if (reqPath !== '/') {
    if (fs.existsSync(targetPublic) && fs.statSync(targetPublic).isFile()) {
      return res.sendFile(targetPublic);
    }
    if (fs.existsSync(targetRoot) && fs.statSync(targetRoot).isFile()) {
      return res.sendFile(targetRoot);
    }
  }

  // Single Page Application (SPA) Fallback for storefront routes
  const spaRoutes = ['/login', '/admin', '/katalog', '/dashboard', '/stock', '/products', '/settings'];
  if (spaRoutes.some(route => reqPath.startsWith(route)) || reqPath === '/') {
    const spaIndex = fs.existsSync(path.join(process.cwd(), 'public', 'index.html'))
      ? path.join(process.cwd(), 'public', 'index.html')
      : path.join(process.cwd(), 'index.html');
    return res.sendFile(spaIndex);
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
