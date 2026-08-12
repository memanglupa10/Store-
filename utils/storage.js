/**
 * utils/storage.js
 * Atomic Storage Engine for JSON File Fallback & Defaults
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const PUBLIC_DIR = path.join(__dirname, '..');
const SEED_DB_FILE = path.join(PUBLIC_DIR, 'data', 'database.json');
const DB_FILE = config.isVercel ? path.join('/tmp', 'database.json') : SEED_DB_FILE;

// Ensure data folder exists in local environment
if (!config.isVercel && !fs.existsSync(path.join(PUBLIC_DIR, 'data'))) {
  try {
    fs.mkdirSync(path.join(PUBLIC_DIR, 'data'), { recursive: true });
  } catch (e) {
    console.warn('[STORAGE WARN] Could not create data directory:', e.message);
  }
}

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-netflix',
    name: 'Netflix Premium',
    icon: 'fa-film',
    image_url: 'assets/icons/netflix.svg',
    color: '#ef4444',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '3 Hari', price: 7000, category: '💎 Sharing 1P1U' },
      { label: '7 Hari', price: 14000, category: '💎 Sharing 1P1U' },
      { label: '1 Bulan', price: 35000, category: '💎 Sharing 1P1U' },
      { label: '1 Bulan', price: 26000, category: '💎 Sharing 1P2U' },
      { label: '1 Bulan', price: 165000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-canva',
    name: 'Canva Pro',
    icon: 'fa-palette',
    image_url: 'assets/icons/canva.svg',
    color: '#06b6d4',
    duration: '1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 10000, category: '💎 Member' },
      { label: '1 Tahun', price: 27000, category: '💎 Member' }
    ]
  },
  {
    id: 'prod-youtube',
    name: 'YouTube Premium',
    icon: 'fa-youtube',
    image_url: 'assets/icons/youtube.svg',
    color: '#ff0000',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 12000, category: '💎 Invite Family' },
      { label: '3 Bulan', price: 30000, category: '💎 Invite Family' }
    ]
  },
  {
    id: 'prod-spotify',
    name: 'Spotify Premium',
    icon: 'fa-spotify',
    image_url: 'assets/icons/spotify.svg',
    color: '#1db954',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 15000, category: '💎 Individual' },
      { label: '3 Bulan', price: 40000, category: '💎 Individual' }
    ]
  }
];

const nowSeed = new Date();
const SEED_APP_LIST = [
  { id: 'prod-netflix', name: 'Netflix Premium', prefix: 'netflix' },
  { id: 'prod-canva', name: 'Canva Pro', prefix: 'canva' },
  { id: 'prod-chatgpt', name: 'ChatGPT Plus', prefix: 'chatgpt' },
  { id: 'prod-getcontact', name: 'Getcontact Premium', prefix: 'getcontact' },
  { id: 'prod-disney', name: 'Disney+ Hotstar', prefix: 'disney' },
  { id: 'prod-youtube', name: 'YouTube Premium', prefix: 'youtube' },
  { id: 'prod-alightmotion', name: 'Alight Motion Premium', prefix: 'alight' },
  { id: 'prod-wetv', name: 'WeTV Premium', prefix: 'wetv' },
  { id: 'prod-spotify', name: 'Spotify Premium', prefix: 'spotify' },
  { id: 'prod-vidio', name: 'Vidio Platinum', prefix: 'vidio' },
  { id: 'prod-iqiyi', name: 'iQIYI Premium', prefix: 'iqiyi' },
  { id: 'prod-viu', name: 'VIU Premium', prefix: 'viu' },
  { id: 'prod-amazon', name: 'Amazon Prime Video', prefix: 'prime' }
];

const DEFAULT_STOCKS = [];

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    let initialData = null;
    if (fs.existsSync(SEED_DB_FILE)) {
      try {
        initialData = JSON.parse(fs.readFileSync(SEED_DB_FILE, 'utf-8'));
      } catch (err) {
        console.error('[STORAGE ERROR] Failed reading SEED_DB_FILE:', err.message);
      }
    }
    if (!initialData) {
      initialData = {
        products: DEFAULT_PRODUCTS,
        stocks: DEFAULT_STOCKS,
        orders: [],
        notifications: [],
        logs: [],
        webhook_logs: [],
        users: [
          { id: 'usr-admin-1', username: 'admin', password: '123', name: 'Super Admin Babyiel', role: 'Admin' },
          { id: 'usr-admin-2', username: 'admin2', password: '123', name: 'Admin Operasional', role: 'Admin' },
          { id: 'usr-m1', username: 'member1', password: '123', name: 'Reseller Budi', role: 'Member' },
          { id: 'usr-m2', username: 'member2', password: '123', name: 'Reseller Siti', role: 'Member' },
          { id: 'usr-m3', username: 'member3', password: '123', name: 'Reseller Dewi', role: 'Member' },
          { id: 'usr-m4', username: 'member4', password: '123', name: 'Reseller Ahmad', role: 'Member' }
        ],
        settings: {
          store_title: 'Babyiel Store',
          support_phone: '085775335453',
          qris_merchant_name: 'BABYIEL STORE OFFICIAL',
          qris_merchant_id: 'ID1029384756'
        }
      };
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (e) {
      console.error('[STORAGE ERROR] Unable to write to DB_FILE:', e.message);
    }
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.logs) parsed.logs = [];
    if (!parsed.users) parsed.users = [];
    if (!parsed.webhook_logs) parsed.webhook_logs = [];

    // Always force parsed.stocks to empty [] so dummy stocks are never served from JSON fallback
    parsed.stocks = [];
    return parsed;
  } catch (err) {
    console.error('[STORAGE ERROR] Error reading database file:', err.message);
    return {
      products: DEFAULT_PRODUCTS,
      stocks: DEFAULT_STOCKS,
      orders: [],
      notifications: [],
      logs: [],
      webhook_logs: [],
      users: [],
      settings: {}
    };
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[STORAGE ERROR] Error saving database file:', err.message);
  }
}

module.exports = {
  loadDB,
  saveDB,
  DEFAULT_PRODUCTS,
  DEFAULT_STOCKS,
};
