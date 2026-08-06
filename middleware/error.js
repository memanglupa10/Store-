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

  // Single Page Application (SPA) Fallback for storefront routes
  const spaRoutes = ['/login', '/admin', '/katalog', '/dashboard', '/stock', '/products', '/settings'];
  const reqPath = req.path || '';
  if (spaRoutes.some(route => reqPath.startsWith(route)) || reqPath === '/') {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
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
