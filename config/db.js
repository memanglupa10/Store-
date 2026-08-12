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
    console.log('[DB] MySQL disabled via DISABLE_MYSQL flag.');
    return false;
  }

  try {
    pool = mysql.createPool({
      host: DB_CONFIG.host || '127.0.0.1',
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      port: DB_CONFIG.port || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10000,
      queueLimit: 0,
      ssl: DB_CONFIG.ssl
    });
    
    const connection = await pool.getConnection();
    console.log(`[DB] Connected successfully to cPanel MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    connection.release();
    
    isMySQLEnabled = true;
    return true;
  } catch (err) {
    console.warn(`[DB WARN] MySQL connection initial attempt failed (${err.message}). Retrying pool...`);
    try {
      pool = mysql.createPool({
        host: '127.0.0.1',
        user: DB_CONFIG.user,
        password: DB_CONFIG.password,
        database: DB_CONFIG.database,
        port: DB_CONFIG.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 10000
      });
      const connection = await pool.getConnection();
      console.log(`[DB] Connected successfully to cPanel MySQL via 127.0.0.1/${DB_CONFIG.database}`);
      connection.release();
      isMySQLEnabled = true;
      return true;
    } catch (err2) {
      console.error(`[DB ERROR] Cannot connect to cPanel MySQL database (${err2.message}). Please verify MySQL credentials in .env!`);
      isMySQLEnabled = false;
      return false;
    }
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
