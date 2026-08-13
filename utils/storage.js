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
  // --- STREAMING / ENTERTAINMENT ---
  {
    id: 'prod-netflix',
    name: 'Netflix Premium',
    icon: 'fa-film',
    image_url: 'assets/icons/netflix.svg',
    color: '#ef4444',
    duration: '1 Hari - 1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari (Sharing UL)', price: 6000, category: '⚡ Sharing UL' },
      { label: '3 Hari (Sharing UL)', price: 12000, category: '⚡ Sharing UL' },
      { label: '7 Hari (Sharing UL)', price: 17000, category: '⚡ Sharing UL' },
      { label: '1 Hari (Sharing 1P1U)', price: 6000, category: '💎 Sharing 1P1U' },
      { label: '7 Hari (Sharing 1P1U)', price: 12000, category: '💎 Sharing 1P1U' },
      { label: '14 Hari (Sharing 1P1U)', price: 18000, category: '💎 Sharing 1P1U' },
      { label: '1 Bulan (Sharing 1P1U)', price: 40000, category: '💎 Sharing 1P1U' },
      { label: '1 Bulan PROMO (Sharing 1P1U)', price: 55000, category: '🔥 Promo' },
      { label: '1 Hari (Sharing 1P2U)', price: 5000, category: '👥 Sharing 1P2U' },
      { label: '7 Hari (Sharing 1P2U)', price: 12000, category: '👥 Sharing 1P2U' },
      { label: '1 Bulan (Sharing 1P2U)', price: 30000, category: '👥 Sharing 1P2U' },
      { label: '1 Bulan (Semi Private)', price: 55000, category: '👑 Semi Private' }
    ]
  },
  {
    id: 'prod-viu',
    name: 'VIU Premium',
    icon: 'fa-play',
    image_url: 'assets/icons/viu.svg',
    color: '#f59e0b',
    duration: '1 Bulan - 1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Private Basic)', price: 10000, category: '👑 Private Basic' },
      { label: '2 Bulan (Private Basic)', price: 20000, category: '👑 Private Basic' },
      { label: '1 Bulan (Anti Limit)', price: 15000, category: '🛡️ Anti Limit' },
      { label: '2 Bulan (Anti Limit)', price: 25000, category: '🛡️ Anti Limit' },
      { label: '6 Bulan (Anti Limit)', price: 40000, category: '🛡️ Anti Limit' },
      { label: '1 Tahun (Anti Limit)', price: 45000, category: '🛡️ Anti Limit' }
    ]
  },
  {
    id: 'prod-wetv',
    name: 'WeTV VIP',
    icon: 'fa-circle-play',
    image_url: 'assets/icons/wetv.svg',
    color: '#f97316',
    duration: '1 Bulan - 1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 15000, category: '💎 Sharing' },
      { label: '3 Bulan (Sharing)', price: 26000, category: '💎 Sharing' },
      { label: '1 Tahun (Sharing)', price: 42000, category: '💎 Sharing' },
      { label: '1 Bulan (Anti Limit)', price: 25000, category: '🛡️ Anti Limit' },
      { label: '1 Bulan (Private)', price: 38000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-youtube',
    name: 'YouTube Premium',
    icon: 'fa-play-circle',
    image_url: 'assets/icons/youtube.svg',
    color: '#ff0000',
    duration: '1 Bulan - 3 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 24000, category: '💎 Sharing' },
      { label: '3 Bulan (Invite Family)', price: 32000, category: '📩 Invite Family' },
      { label: '1 Bulan (Private Mobile)', price: 27000, category: '📱 Private Mobile' },
      { label: '1 Bulan (Private All Device)', price: 43000, category: '💻 Private All Device' }
    ]
  },
  {
    id: 'prod-iqiyi',
    name: 'iQIYI VIP',
    icon: 'fa-tv',
    image_url: 'assets/icons/iqiyi.svg',
    color: '#10b981',
    duration: '1 Bulan - 3 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing Standard)', price: 15000, category: '💎 Sharing Standard' },
      { label: '3 Bulan (Sharing Standard)', price: 25000, category: '💎 Sharing Standard' }
    ]
  },

  // --- EDITING ---
  {
    id: 'prod-canva',
    name: 'Canva Pro',
    icon: 'fa-palette',
    image_url: 'assets/icons/canva.svg',
    color: '#06b6d4',
    duration: '1 Bulan - 1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    note: '✨ Designer +Rp2.000',
    prices: [
      { label: '1 Bulan', price: 10000, category: '💎 Member' },
      { label: '2 Bulan', price: 14000, category: '💎 Member' },
      { label: '3 Bulan', price: 17000, category: '💎 Member' },
      { label: '4 Bulan', price: 20000, category: '💎 Member' },
      { label: '6 Bulan', price: 25000, category: '💎 Member' },
      { label: '1 Tahun', price: 35000, category: '💎 Member' }
    ]
  },
  {
    id: 'prod-capcut',
    name: 'CapCut Pro',
    icon: 'fa-scissors',
    image_url: 'assets/icons/canva.svg',
    color: '#0f172a',
    duration: '7 Hari',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '7 Hari (Standard)', price: 20000, category: '👑 Private' },
      { label: '7 Hari (Pro)', price: 25000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-picsart',
    name: 'Picsart Gold',
    icon: 'fa-paint-brush',
    image_url: 'assets/icons/canva.svg',
    color: '#ec4899',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 15000, category: '💎 Sharing' },
      { label: '1 Bulan (Private)', price: 25000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-ibispaint',
    name: 'ibis Paint X Pro',
    icon: 'fa-pen-nib',
    image_url: 'assets/icons/canva.svg',
    color: '#3b82f6',
    duration: '1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Tahun (Sharing)', price: 35000, category: '💎 Sharing' }
    ]
  },
  {
    id: 'prod-meitu',
    name: 'Meitu VIP',
    icon: 'fa-wand-magic-sparkles',
    image_url: 'assets/icons/canva.svg',
    color: '#f43f5e',
    duration: '7 Hari',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '7 Hari', price: 17000, category: '👑 VIP' }
    ]
  },
  {
    id: 'prod-alightmotion',
    name: 'Alight Motion Premium',
    icon: 'fa-video',
    image_url: 'assets/icons/alightmotion.svg',
    color: '#10b981',
    duration: '1 Bulan - 1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 12000, category: '💎 Sharing' },
      { label: '1 Tahun (Sharing)', price: 25000, category: '💎 Sharing' },
      { label: '1 Bulan (Private)', price: 30000, category: '👑 Private' },
      { label: '1 Tahun (Private)', price: 45000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-beautyplus',
    name: 'BeautyPlus Premium',
    icon: 'fa-camera',
    image_url: 'assets/icons/canva.svg',
    color: '#fb7185',
    duration: '1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Tahun (Sharing)', price: 35000, category: '💎 Sharing' }
    ]
  },

  // --- LISTENING ---
  {
    id: 'prod-applemusic',
    name: 'Apple Music',
    icon: 'fa-music',
    image_url: 'assets/icons/spotify.svg',
    color: '#fa233b',
    duration: '1 Bulan - 3 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 23000, category: '👑 Individual' },
      { label: '2 Bulan', price: 30000, category: '👑 Individual' },
      { label: '3 Bulan', price: 40000, category: '👑 Individual' }
    ]
  },
  {
    id: 'prod-spotify',
    name: 'Spotify Premium',
    icon: 'fa-spotify',
    image_url: 'assets/icons/spotify.svg',
    color: '#1db954',
    duration: '1 Bulan - 2 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 25000, category: '💎 Sharing' },
      { label: '2 Bulan (Sharing)', price: 40000, category: '💎 Sharing' },
      { label: '1 Bulan (Family)', price: 29000, category: '👨‍👩‍👧 Family Plan' }
    ]
  },

  // --- EDUCATION & AI ---
  {
    id: 'prod-scribd',
    name: 'Scribd VIP',
    icon: 'fa-book-open',
    image_url: 'assets/icons/canva.svg',
    color: '#1e3a8a',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 12000, category: '💎 Sharing' },
      { label: '1 Bulan (Private)', price: 23000, category: '👑 Private' }
    ]
  },
  {
    id: 'prod-chatgpt',
    name: 'ChatGPT Plus & AI',
    icon: 'fa-robot',
    image_url: 'assets/icons/chatgpt.svg',
    color: '#10b981',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi GPT-4o',
    prices: [
      { label: '1 Bulan (Sharing)', price: 38000, category: '💎 Sharing' },
      { label: '1 Bulan (Invite Email Pribadi)', price: 45000, category: '📩 Invite Email' }
    ]
  },
  {
    id: 'prod-ms365',
    name: 'Microsoft 365',
    icon: 'fa-windows',
    image_url: 'assets/icons/canva.svg',
    color: '#0284c7',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (via Invite)', price: 15000, category: '📩 Invite' }
    ]
  },
  {
    id: 'prod-camscanner',
    name: 'CamScanner Premium',
    icon: 'fa-file-contract',
    image_url: 'assets/icons/canva.svg',
    color: '#059669',
    duration: '1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Tahun (Sharing)', price: 25000, category: '💎 Sharing' }
    ]
  },
  {
    id: 'prod-duolingo',
    name: 'Duolingo Super',
    icon: 'fa-graduation-cap',
    image_url: 'assets/icons/canva.svg',
    color: '#58cc02',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing)', price: 17000, category: '💎 Sharing' }
    ]
  },
  {
    id: 'prod-gemini',
    name: 'Gemini Advanced AI',
    icon: 'fa-brain',
    image_url: 'assets/icons/chatgpt.svg',
    color: '#8b5cf6',
    duration: '1 Bulan - 3 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Sharing Invite)', price: 20000, category: '📩 Invite' },
      { label: '3 Bulan (Sharing Invite)', price: 32000, category: '📩 Invite' }
    ]
  },

  // --- OTHER ---
  {
    id: 'prod-getcontact',
    name: 'Getcontact Premium',
    icon: 'fa-address-book',
    image_url: 'assets/icons/getcontact.svg',
    color: '#3b82f6',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan (Private)', price: 18000, category: '👑 Private' },
      { label: '1 Bulan (Semi Private)', price: 10000, category: '👑 Semi Private' },
      { label: 'Jasa Cek Nomor GTC (Per Nomor)', price: 1000, category: '⚡ Jasa Cek' }
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
