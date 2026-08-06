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
const DEFAULT_STOCKS = [
  { id: 'STK-1001', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', email: 'disney.vip01@babyiel.com', password: 'passdisney01', login_by: 'OTP WhatsApp', profile: 'Profil 1 (Rian)', pin: '1234', note: 'Akun batch utama', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 3).toISOString() },
  { id: 'STK-1005', product_id: 'prod-canva', product_name: 'Canva Pro', email: 'canva.designer@yahoo.com', password: 'passcanva05', login_by: 'Magic Link', profile: 'Admin Team', pin: '-', note: 'Akses 1 Tahun', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1006', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', email: 'gpt4o.master@openai.com', password: 'passgpt06', login_by: 'Email & Password', profile: 'Personal', pin: '5544', note: 'Ready GPT-4o', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 5).toISOString() },
  { id: 'STK-1009', product_id: 'prod-vidio', product_name: 'Vidio Platinum', email: 'vidio.plat01@gmail.com', password: 'passvidio09', login_by: 'OTP Phone', profile: 'Profil 1', pin: '1234', note: 'Premier Platinum 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1010', product_id: 'prod-iqiyi', product_name: 'iQIYI Premium', email: 'iqiyi.vip01@outlook.com', password: 'passiqiyi10', login_by: 'Email & Password', profile: 'VIP Profile', pin: '8899', note: 'Standard VIP', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 8).toISOString() },
  { id: 'STK-1011', product_id: 'prod-spotify', product_name: 'Spotify Premium', email: 'spot.fam02@gmail.com', password: 'passspot11', login_by: 'Invite Link', profile: 'Profil Member 11', pin: '-', note: 'Full Garansi 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 2).toISOString() },
  { id: 'STK-1012', product_id: 'prod-youtube', product_name: 'YouTube Premium', email: 'yt.fam02@gmail.com', password: 'passyt12', login_by: 'Google Account', profile: 'User 2', pin: '-', note: 'Individu Plan', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1013', product_id: 'prod-getcontact', product_name: 'Getcontact Premium', email: 'getcontact.prem02@gmail.com', password: 'passgc13', login_by: 'OTP SMS', profile: 'Profil 2', pin: '-', note: 'Aktif 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 12).toISOString() },
  { id: 'STK-1014', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', email: 'disney.prem03@babyiel.com', password: 'passdisney14', login_by: 'OTP WhatsApp', profile: 'Profil 3', pin: '5678', note: 'Private Profile', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 4).toISOString() },
  { id: 'STK-1015', product_id: 'prod-netflix', product_name: 'Netflix Premium', email: 'net.prem4k_02@gmail.com', password: 'passnet15', login_by: 'Email & Password', profile: 'Profil B', pin: '1122', note: 'Private User Screen', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 3).toISOString() }
];

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
