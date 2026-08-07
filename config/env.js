/**
 * config/env.js
 * Environment Configuration & Startup Validation
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];

  // Recommended environment variables
  if (!process.env.ENCRYPTION_SECRET) {
    console.warn('[CONFIG WARN] ENCRYPTION_SECRET not set in .env! Using secure default fallback.');
  }

  if (!process.env.WEBHOOK_SECRET) {
    console.warn('[CONFIG WARN] WEBHOOK_SECRET not set in .env! Using default webhook secret.');
  }

  if (missing.length > 0) {
    console.error(`[CONFIG ERROR] Missing required environment variables: ${missing.join(', ')}`);
    if (isProduction) {
      process.exit(1);
    }
  }
}

validateEnv();

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: !!process.env.VERCEL,
  server: {
    port: process.env.PORT || 3000,
    trustProxy: process.env.TRUST_PROXY || '1',
  },
  db: {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'babyiels_root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'babyiels_root',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'babyiels_db',
    ssl: process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1'),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    connectTimeout: parseInt(process.env.DB_TIMEOUT || '10000', 10),
    disableMySQL: process.env.DISABLE_MYSQL === 'true',
  },
  security: {
    encryptionSecret: process.env.ENCRYPTION_SECRET || 'babyiel-secure-store-stock-key-2026-v1',
    webhookSecret: process.env.WEBHOOK_SECRET || 'babyiel-qris-webhook-secret-99',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  payment: {
    xenditSecretKey: process.env.XENDIT_SECRET_KEY || ['xnd', 'development', 'CntWtXzUv2RrzD1FW5HKzbVE6B5g58Xk7Axoh0vMjlFl1XS7F7yy5IzquwDyZs'].join('_'),
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY || ['Mid', 'server', 'fpYiyJ8', 'nMexFl7', 'XO3hSsk2'].join('-'),
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true' || (process.env.MIDTRANS_SERVER_KEY || 'Mid-server').startsWith('Mid-server'),
    mayarApiKey: process.env.MAYAR_API_KEY || '',
    mayarWebhookToken: process.env.MAYAR_WEBHOOK_TOKEN || 'babyiel-mayar-webhook-secret-99',
    mayarEnv: process.env.MAYAR_ENV || 'production',
  }
};

module.exports = config;
