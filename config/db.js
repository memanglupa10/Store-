/**
 * config/db.js
 * MySQL Connection Pool with Automatic SSL & Graceful Shutdown
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const mysql = require('mysql2/promise');
const config = require('./env');

const DB_CONFIG = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  connectTimeout: config.db.connectTimeout,
  queueLimit: 0,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
};

let pool = null;
let isMySQLEnabled = false;

async function initDB() {
  if (config.db.disableMySQL) {
    console.log('[DB] MySQL disabled via DISABLE_MYSQL flag. Operating in JSON Database Fallback mode.');
    return false;
  }

  try {
    pool = mysql.createPool({
      ...DB_CONFIG,
      connectTimeout: 2500
    });
    
    // Test connection with 2-second timeout safeguard
    const connPromise = pool.getConnection();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('MySQL connection timeout (2.5s)')), 2500));
    const connection = await Promise.race([connPromise, timeoutPromise]);
    console.log(`[DB] Connected successfully to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    connection.release();
    
    isMySQLEnabled = true;
    return true;
  } catch (err) {
    console.warn(`[DB WARN] MySQL connection failed (${err.message}). Operating in JSON Database Fallback mode.`);
    isMySQLEnabled = false;
    pool = null;
    return false;
  }
}

function getPool() {
  return pool;
}

function checkIsMySQL() {
  return isMySQLEnabled && pool !== null;
}

async function closePool() {
  if (pool) {
    try {
      await pool.end();
      console.log('[DB] MySQL Connection Pool cleanly closed.');
    } catch (err) {
      console.error('[DB ERROR] Error closing MySQL pool:', err);
    }
  }
}

module.exports = {
  initDB,
  getPool,
  checkIsMySQL,
  closePool,
  DB_CONFIG
};
