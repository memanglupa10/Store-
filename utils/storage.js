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
    id: 'prod-sharing-premium-ul',
    name: 'ShariNG Premium UL',
    icon: 'fa-tv',
    image_url: 'assets/icons/netflix.svg',
    color: '#7c3aed',
    duration: '1 Hari - 7 Hari',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari', price: 6000, category: '💎 Sharing' },
      { label: '3 Hari', price: 12000, category: '💎 Sharing' },
      { label: '7 Hari', price: 17000, category: '💎 Sharing' }
    ]
  },
  {
    id: 'prod-netflix',
    name: 'Netflix',
    icon: 'fa-film',
    image_url: 'assets/icons/netflix.svg',
    color: '#ef4444',
    duration: '1 Hari - 1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari', price: 6000, category: '💎 Sharing' },
      { label: '7 Hari', price: 12000, category: '💎 Sharing' },
      { label: '14 Hari', price: 18000, category: '💎 Sharing' },
      { label: '1 Bulan', price: 40000, category: '💎 Sharing' },
      { label: '1 Bulan PROMO', price: 55000, category: '🔥 Promo' }
    ]
  },
  {
    id: 'prod-netflix-1p2u',
    name: 'Netflix 1P2U',
    icon: 'fa-film',
    image_url: 'assets/icons/netflix.svg',
    color: '#dc2626',
    duration: '1 Hari - 1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari', price: 5000, category: '💎 Sharing 1P2U' },
      { label: '7 Hari', price: 12000, category: '💎 Sharing 1P2U' },
      { label: '1 Bulan', price: 30000, category: '💎 Sharing 1P2U' }
    ]
  },
  {
    id: 'prod-netflix-semi-private',
    name: 'Netflix Semi Private',
    icon: 'fa-film',
    image_url: 'assets/icons/netflix.svg',
    color: '#b91c1c',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 55000, category: '👑 Semi Private' }
    ]
  },
  {
    id: 'prod-viu-private-basic',
    name: 'Viu Private Basic',
    icon: 'fa-play',
    image_url: 'assets/icons/viu.svg',
    color: '#f59e0b',
    duration: '1 Bulan - 2 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 10000, category: '👑 Private Basic' },
      { label: '2 Bulan', price: 20000, category: '👑 Private Basic' }
    ]
  },
  {
    id: 'prod-viu-private-anti-limit',
    name: 'Viu Private Anti Limit',
    icon: 'fa-play',
    image_url: 'assets/icons/viu.svg',
    color: '#d97706',
    duration: '1 Bulan - 1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 15000, category: '🛡️ Anti Limit' },
      { label: '2 Bulan', price: 25000, category: '🛡️ Anti Limit' },
      { label: '6 Bulan', price: 40000, category: '🛡️ Anti Limit' },
      { label: '1 Tahun', price: 45000, category: '🛡️ Anti Limit' }
    ]
  },
  {
    id: 'prod-wetv-sharing',
    name: 'WeTV Sharing',
    icon: 'fa-circle-play',
    image_url: 'assets/icons/wetv.svg',
    color: '#f97316',
    duration: '1 Bulan - 1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 15000, category: '💎 Sharing' },
      { label: '3 Bulan', price: 26000, category: '💎 Sharing' },
      { label: '1 Tahun', price: 42000, category: '💎 Sharing' }
    ]
  },
  {
    id: 'prod-wetv-anti-limit',
    name: 'WeTV Anti Limit',
    icon: 'fa-circle-play',
    image_url: 'assets/icons/wetv.svg',
    color: '#ea580c',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 25000, category: '🛡️ Anti Limit' }
    ]
  },
  {
    id: 'prod-wetv-private',
    name: 'WeTV Private',
    icon: 'fa-circle-play',
    image_url: 'assets/icons/wetv.svg',
    color: '#c2410c',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 38000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-youtube-sharing',
    name: 'YouTube Sharing',
    icon: 'fa-play-circle',
    image_url: 'assets/icons/youtube.svg',
    color: '#ff0000',
    duration: '1 Bulan - 3 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 24000, category: '💎 Sharing' },
      { label: '3 Bulan Invite', price: 32000, category: '📩 Invite' }
    ]
  },
  {
    id: 'prod-youtube-private',
    name: 'YouTube Private',
    icon: 'fa-play-circle',
    image_url: 'assets/icons/youtube.svg',
    color: '#cc0000',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan Mobile', price: 27000, category: '📱 Mobile' },
      { label: '1 Bulan All Device', price: 43000, category: '💻 All Device' }
    ]
  },
  {
    id: 'prod-iqiyi-sharing-standard',
    name: 'iQIYI Sharing Standard',
    icon: 'fa-tv',
    image_url: 'assets/icons/iqiyi.svg',
    color: '#10b981',
    duration: '1 Bulan - 3 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 15000, category: '💎 Sharing Standard' },
      { label: '3 Bulan', price: 25000, category: '💎 Sharing Standard' }
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
