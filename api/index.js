/**
 * api/index.js
 * Vercel Serverless Function Handler for Express App
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const app = require('../server');

module.exports = (req, res) => {
  return app(req, res);
};

