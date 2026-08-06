/**
 * middleware/security.js
 * Security Enhancements: Helmet, CORS, Rate Limiter, Compression & Body Limits
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Rate Limiter Middleware
const apiLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi beberapa saat.'
  }
});

// Security Header Middleware
function applySecurityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

// Helmet Security Configuration
const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Disabled CSP to allow external CDNs (FontAwesome, Chart.js, SVG icons)
  crossOriginEmbedderPolicy: false,
});

// CORS Configuration
const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow all origins or specify whitelist if needed
    callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Callback-Signature', 'X-Auth-Token', 'X-Forwarded-Url'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware: compression(),
  apiLimiter,
  applySecurityHeaders
};
