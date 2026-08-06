/**
 * routes/health.js
 * Production System Health Check Endpoint
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const express = require('express');
const router = express.Router();
const dbHelper = require('../config/db');

router.get('/', (req, res) => {
  const isMySQL = dbHelper.checkIsMySQL();

  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isMySQL ? 'MySQL Connection Pool' : 'JSON Storage Fallback'
  });
});

module.exports = router;
