// db.js - MySQL Connection Pool with Seamless JSON Fallback
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'babyiel_store',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isMySQLEnabled = false;

async function initDB() {
  if (process.env.DISABLE_MYSQL === 'true') {
    console.log('[DB] MySQL disabled via DISABLE_MYSQL flag. Using JSON File Database.');
    return false;
  }

  try {
    pool = mysql.createPool(DB_CONFIG);
    // Test connection
    const connection = await pool.getConnection();
    console.log(`[DB] Connected successfully to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    connection.release();
    isMySQLEnabled = true;
    return true;
  } catch (err) {
    console.warn(`[DB] MySQL connection failed (${err.message}). Falling back to local JSON database mode.`);
    isMySQLEnabled = false;
    return false;
  }
}

function getPool() {
  return pool;
}

function checkIsMySQL() {
  return isMySQLEnabled && pool !== null;
}

module.exports = {
  initDB,
  getPool,
  checkIsMySQL,
  DB_CONFIG
};
