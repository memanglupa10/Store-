/**
 * api/index.js
 * Vercel Serverless Function Handler for Express App
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const app = require('../server');

module.exports = (req, res) => {
  if (req.headers && req.headers['x-forwarded-url']) {
    req.url = req.headers['x-forwarded-url'];
  }
  return app(req, res);
};
