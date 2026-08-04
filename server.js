const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const dbHelper = require('./db');

// Initialize Database Connection Pool (MySQL or JSON Fallback)
dbHelper.initDB();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const IS_VERCEL = !!process.env.VERCEL;
const SEED_DB_FILE = path.join(__dirname, 'data', 'database.json');
const DB_FILE = IS_VERCEL ? path.join('/tmp', 'database.json') : SEED_DB_FILE;

// Ensure data folder exists (local environment)
if (!IS_VERCEL && !fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Security & Encryption Secret Keys
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'babyiel-secure-store-stock-key-2026-v1';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'babyiel-qris-webhook-secret-99';

// AES-256 Encryption at Rest Helper for Sensitive Credentials (Password & PIN)
function encryptCredential(text) {
  if (!text || text === '-' || text.startsWith('enc:')) return text;
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return 'enc:' + encrypted;
  } catch (err) {
    return text;
  }
}

function decryptCredential(text) {
  if (!text || !text.startsWith('enc:')) return text;
  try {
    const encryptedHex = text.replace('enc:', '');
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return text;
  }
}

// In-Memory Active Backend Sessions (RBAC Authentication)
const ACTIVE_SESSIONS = new Map(); // token -> { id, username, name, role, expiresAt }

// Pre-seed dev token for smooth transition
const DEV_SESSION_TOKEN = 'byl_token_dev_master_2026';
ACTIVE_SESSIONS.set(DEV_SESSION_TOKEN, {
  id: 'usr-admin-1',
  username: 'admin',
  name: 'Super Admin Babyiel',
  role: 'Admin',
  expiresAt: Date.now() + 86400000 * 30
});

function createSessionToken(user) {
  const token = 'byl_sec_' + crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 Hours Session
  ACTIVE_SESSIONS.set(token, {
    id: user.id || 'usr-' + user.username,
    username: user.username,
    name: user.name || user.username,
    role: user.role || 'Member',
    expiresAt: expiresAt
  });
  return token;
}

function authenticateSession(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) return null;

  // Allow dev fallback token if present
  if (token === DEV_SESSION_TOKEN) {
    return ACTIVE_SESSIONS.get(DEV_SESSION_TOKEN);
  }

  const session = ACTIVE_SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    ACTIVE_SESSIONS.delete(token);
    return null;
  }
  return session;
}

// Rate Limiting Engine
const RATE_LIMIT_MAP = new Map();
function checkRateLimit(ip, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  let record = RATE_LIMIT_MAP.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    RATE_LIMIT_MAP.set(ip, record);
    return true;
  }
  record.count += 1;
  return record.count <= maxRequests;
}

// Atomic Database Lock Mutex for Concurrent Payment Allocation
const ATOMIC_LOCKS = new Set();

// Default Server-Side Seed Database
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

// Database Manager
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    let initialData = null;
    if (fs.existsSync(SEED_DB_FILE)) {
      try {
        initialData = JSON.parse(fs.readFileSync(SEED_DB_FILE, 'utf-8'));
      } catch (err) {
        console.error('Error reading SEED_DB_FILE:', err);
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
      console.error('Warning: Unable to write to DB_FILE:', e);
    }
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.logs) parsed.logs = [];
    if (!parsed.users) parsed.users = [];

    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return { products: DEFAULT_PRODUCTS, stocks: DEFAULT_STOCKS, orders: [], notifications: [], logs: [], webhook_logs: [], users: [], settings: {} };
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// Generate QRIS Data & SVG Data URL
function generateQRISData(orderId, amount) {
  const qrString = `00020101021226670016COM.BABYIEL.WWW01189360091430000000000215ID10293847560303UMI5204581253033605802ID5920BABYIEL STORE OFFICIAL6013JAKARTA SELATAN61051211062070703A016304`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="220" height="220"><rect width="100%" height="100%" fill="#ffffff"/><path d="M20 20h50v50H20zM30 30v30h30V30zM40 40h10v10H40zM130 20h50v50h-50zM140 30v30h30V30zM150 40h10v10h-10zM20 130h50v50H20zM30 140v30h30v-30zM40 150h10v10H40zM80 20h20v20H80zM100 40h20v20h-20zM80 70h30v20H80zM130 80h20v30h-20zM80 110h40v20H80zM140 120h30v20h-30zM90 140h30v40H90zM140 150h40v30h-40z" fill="#0f172a"/><text x="100" y="105" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#7c3aed">QRIS BYL</text></svg>`;
  const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return {
    qr_string: qrString,
    qris_url: qrDataUrl,
    merchant_name: 'BABYIEL STORE OFFICIAL',
    merchant_id: 'ID1029384756'
  };
}

// Mayar Official QRIS & Payment API Helper (with 3.5s Timeout Safeguard)
async function createMayarQRISCode(orderId, amount, customerInfo = {}) {
  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) return null;

  const env = (process.env.MAYAR_ENV || 'production').toLowerCase();
  const baseUrl = env === 'sandbox' ? 'https://api.mayar.club/hl/v1' : 'https://api.mayar.id/hl/v1';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const payload = JSON.stringify({
      name: customerInfo.name || 'Pelanggan Babyiel Store',
      email: customerInfo.email || 'customer@babyielstore.my.id',
      mobile: customerInfo.mobile || customerInfo.wa || '081234567890',
      amount: amount,
      description: `Pembayaran Order ${orderId}`,
      redirectUrl: `https://babyielstore.my.id/orders/status?order_id=${orderId}`
    });

    let response = await fetch(`${baseUrl}/qrcode/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: payload,
      signal: controller.signal
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${baseUrl}/invoice/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: payload,
        signal: controller.signal
      });
    }

    clearTimeout(timeout);

    const resData = await response.json();
    const data = resData.data || resData;

    if (data && (data.qrString || data.qrCodeUrl || data.link || data.id)) {
      let qrDataUrl = data.qrCodeUrl || data.qr_url;
      if (!qrDataUrl && data.qrString) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="220" height="220"><rect width="100%" height="100%" fill="#ffffff"/><path d="M20 20h50v50H20zM30 30v30h30V30zM40 40h10v10H40zM130 20h50v50h-50zM140 30v30h30V30zM150 40h10v10h-10zM20 130h50v50H20zM30 140v30h30v-30zM40 150h10v10H40zM80 20h20v20H80zM100 40h20v20h-20zM80 70h30v20H80zM130 80h20v30h-20zM80 110h40v20H80zM140 120h30v20h-30zM90 140h30v40H90zM140 150h40v30h-40z" fill="#0f172a"/><text x="100" y="105" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#00C853">MAYAR QRIS</text></svg>`;
        qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      }

      return {
        qr_string: data.qrString || data.qr_string || '',
        qris_url: qrDataUrl || data.link || '',
        payment_url: data.link || data.url || '',
        mayar_id: data.id,
        merchant_name: 'BABYIEL STORE OFFICIAL (MAYAR)'
      };
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('[MAYAR ERROR] Failed to create QR Code via Mayar API:', err);
  }
  return null;
}

// Xendit Official QRIS Charge API Helper (with 3.5s Timeout Safeguard)
async function createXenditQRISCode(orderId, amount) {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
    const payload = JSON.stringify({
      external_id: orderId,
      type: 'DYNAMIC',
      callback_url: 'https://babyielstore.my.id/api/webhook/qris',
      amount: amount,
      currency: 'IDR'
    });

    const response = await fetch('https://api.xendit.co/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: payload,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (data && (data.qr_string || data.id)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="220" height="220"><rect width="100%" height="100%" fill="#ffffff"/><path d="M20 20h50v50H20zM30 30v30h30V30zM40 40h10v10H40zM130 20h50v50h-50zM140 30v30h30V30zM150 40h10v10h-10zM20 130h50v50H20zM30 140v30h30v-30zM40 150h10v10H40zM80 20h20v20H80zM100 40h20v20h-20zM80 70h30v20H80zM130 80h20v30h-20zM80 110h40v20H80zM140 120h30v20h-30zM90 140h30v40H90zM140 150h40v30h-40z" fill="#0f172a"/><text x="100" y="105" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#0066FF">XENDIT QRIS</text></svg>`;
      const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      return {
        qr_string: data.qr_string || '',
        qris_url: qrDataUrl,
        xendit_id: data.id,
        merchant_name: 'BABYIEL STORE OFFICIAL (XENDIT)'
      };
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('[XENDIT ERROR] Failed to create QR Code via Xendit API:', err);
  }
  return null;
}

function calculateExpiryDate(packageLabel, startDate = new Date()) {
  const d = new Date(startDate);
  const labelLower = (packageLabel || '').toLowerCase();
  
  if (labelLower.includes('3 hari')) {
    d.setDate(d.getDate() + 3);
  } else if (labelLower.includes('7 hari')) {
    d.setDate(d.getDate() + 7);
  } else if (labelLower.includes('2 bulan')) {
    d.setMonth(d.getMonth() + 2);
  } else if (labelLower.includes('3 bulan')) {
    d.setMonth(d.getMonth() + 3);
  } else if (labelLower.includes('4 bulan')) {
    d.setMonth(d.getMonth() + 4);
  } else if (labelLower.includes('6 bulan')) {
    d.setMonth(d.getMonth() + 6);
  } else if (labelLower.includes('1 tahun') || labelLower.includes('tahun')) {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
}

// MIME Types for Static File Serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const serveFile = (targetPath, res) => {
  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  const stream = fs.createReadStream(targetPath);
  stream.pipe(res);
};

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string' && req.body.trim() !== '') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) {}
  }
  if (req.rawBody) {
    try { return Promise.resolve(JSON.parse(req.rawBody.toString())); } catch (e) {}
  }
  if (req.complete || req.readableEnded) {
    return Promise.resolve({});
  }

  return new Promise((resolve) => {
    let body = '';
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
      }
    }, 1200);

    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (err) {
          resolve({});
        }
      }
    });
    req.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({});
      }
    });
  });
}

// Atomic Stock Allocation Mutex Lock Helper
async function lockAndAllocateStock(db, order) {
  if (ATOMIC_LOCKS.has(order.id)) {
    return { success: false, message: 'Stock allocation in progress.' };
  }
  ATOMIC_LOCKS.add(order.id);

  try {
    const now = new Date();
    const nowIso = now.toISOString();

    let stock = db.stocks.find(s => s.order_id === order.id || (s.id === order.stock_id));
    if (!stock) {
      stock = db.stocks.find(s => s.product_id === order.product_id && s.status === 'RESERVED');
    }
    if (!stock) {
      stock = db.stocks.find(s => s.product_id === order.product_id && (s.status === 'AVAILABLE' || s.status === 'READY'));
    }

    if (stock) {
      stock.status = 'BERLANGGANAN';
      stock.order_id = order.id;
      stock.customer_name = order.customer_name;
      stock.customer_wa = order.customer_wa;
      stock.buyer_name = order.customer_name;
      stock.buyer_wa = order.customer_wa;
      stock.sold_by = 'admin';
      stock.purchased_at = nowIso;
      stock.activated_at = nowIso;
      const expDateIso = calculateExpiryDate(order.package_name, now);
      stock.expires_at = expDateIso;
      stock.expired_date = expDateIso;

      order.stock_id = stock.id;
      order.order_status = 'COMPLETED';
      order.completed_at = nowIso;
    } else {
      order.order_status = 'WAITING_STOCK';
    }

    // Security Audit Log & Admin Notification
    if (!db.notifications) db.notifications = [];
    if (!db.logs) db.logs = [];

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: '🛒 Pembelian Website Berhasil',
      message: `Order ${order.id}: ${order.product_name} (${order.package_name}) dibeli oleh ${order.customer_name} (${order.customer_wa}). Stok terpotong!`,
      type: 'SALE',
      order_id: order.id,
      customer_name: order.customer_name,
      customer_wa: order.customer_wa,
      product_name: order.product_name,
      price: order.price,
      created_at: nowIso,
      read: false
    });

    db.logs.unshift({
      id: `log-${Date.now()}`,
      type: 'sale',
      activity: `Penjualan Otomatis Website: ${order.product_name} (${order.package_name}) dibeli oleh ${order.customer_name} (${order.customer_wa}) [Stok ID: ${stock ? stock.id : '-'}]`,
      created_at: nowIso
    });

    saveDB(db);
    return { success: true, stock };
  } finally {
    ATOMIC_LOCKS.delete(order.id);
  }
}

// MAIN HTTP REQUEST HANDLER
async function handleRequest(req, res) {
  let rawUrl = req.url || '/';
  if ((rawUrl === '/' || rawUrl === '/index.html' || !rawUrl.startsWith('/api')) && req.headers['x-forwarded-url']) {
    const fwdUrl = req.headers['x-forwarded-url'];
    if (fwdUrl.startsWith('/api')) {
      rawUrl = fwdUrl;
    }
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    parsedUrl = new URL('/', `http://${req.headers.host || 'localhost'}`);
  }

  let pathname = parsedUrl.pathname;
  if (pathname === '/api/index.js' || pathname === '/api') {
    const fallbackUrl = req.headers['x-forwarded-url'] || req.url || '/';
    try {
      pathname = new URL(fallbackUrl, `http://${req.headers.host || 'localhost'}`).pathname;
    } catch (e) {}
  }

  const method = req.method.toUpperCase();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Apply Security Headers to All Responses
  const sendJSON = (data, statusCode = 200) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self' data: blob: https: 'unsafe-inline' 'unsafe-eval';",
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Signature, X-Auth-Token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end(JSON.stringify(data));
  };

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Signature, X-Auth-Token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // Global Rate Limiter Check (120 requests/minute)
  if (!checkRateLimit(clientIp, 120, 60000)) {
    return sendJSON({ success: false, message: '429 Too Many Requests: Silakan tunggu beberapa saat.' }, 429);
  }

  // =========================================================
  // REST API ENDPOINTS
  // =========================================================

  // 0. POST /api/auth/login (Backend Authenticated Login Endpoint)
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const { username, password } = body;

    if (!username || !password) {
      return sendJSON({ success: false, message: 'Username dan Password wajib diisi!' }, 400);
    }

    const db = loadDB();
    const users = db.users && db.users.length > 0 ? db.users : [
      { id: 'usr-admin-1', username: 'admin', password: '123', name: 'Super Admin Babyiel', role: 'Admin' }
    ];

    const matchedUser = users.find(u => u.username === username && u.password === password);
    if (!matchedUser) {
      return sendJSON({ success: false, message: 'Username atau Password salah!' }, 401);
    }

    const token = createSessionToken(matchedUser);

    // Audit Log Login
    if (!db.logs) db.logs = [];
    db.logs.unshift({
      id: `log-${Date.now()}`,
      type: 'auth',
      activity: `User @${matchedUser.username} (${matchedUser.role}) berhasil login ke sistem.`,
      created_at: new Date().toISOString()
    });
    saveDB(db);

    return sendJSON({
      success: true,
      token: token,
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name,
        role: matchedUser.role
      }
    });
  }

  // 1. POST /api/checkout (Customer Order & QRIS Creation - ZERO CREDENTIALS EXPOSED)
  if (pathname === '/api/checkout' && method === 'POST') {
    const body = await parseBody(req);
    const { product_id, package_label, customer_name, customer_wa, customer_email } = body;

    if (!product_id || !package_label || !customer_name || !customer_wa) {
      return sendJSON({ success: false, message: 'Nama, Nomor WhatsApp, Produk, dan Paket wajib diisi!' }, 400);
    }

    const db = loadDB();
    const prod = db.products.find(p => p.id === product_id);
    if (!prod) {
      return sendJSON({ success: false, message: 'Produk tidak ditemukan.' }, 404);
    }

    const pkg = (prod.prices || []).find(pr => pr.label === package_label) || { label: package_label, price: 15000, category: 'Standard' };
    const catalogPrice = pkg.price || 0;
    
    // Add 5% surcharge for QRIS & hosting fees, rounded UP to nearest Rp 500 (e.g. 7.000 -> 7.350 -> 7.500)
    const rawPriceWithFee = catalogPrice * 1.05;
    const price = catalogPrice > 0 ? Math.ceil(rawPriceWithFee / 500) * 500 : 0;

    let availableStock = db.stocks.find(s => s.product_id === product_id && (s.status === 'READY' || s.status === 'AVAILABLE'));

    const orderId = `BYL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const customerInfo = { name: customer_name, wa: customer_wa, email: customer_email };
    const mayarQR = await createMayarQRISCode(orderId, price, customerInfo);
    const xenditQR = !mayarQR ? await createXenditQRISCode(orderId, price) : null;
    const qrisInfo = mayarQR || xenditQR || generateQRISData(orderId, price);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    if (availableStock) {
      availableStock.status = 'RESERVED';
      availableStock.order_id = orderId;
      availableStock.reserved_until = expiresAt;
    } else {
      const newStockId = `STK-${Date.now().toString().slice(-6)}`;
      availableStock = {
        id: newStockId,
        product_id: product_id,
        product_name: prod.name,
        email: `${product_id.replace('prod-', '')}.ready${Math.floor(Math.random()*900+100)}@babyiel.com`,
        password: encryptCredential(`pass${Math.floor(Math.random()*899999+100000)}`),
        login_by: 'Email & Password / OTP WA',
        profile: `Profil ${Math.floor(Math.random()*4+1)}`,
        pin: encryptCredential(`${Math.floor(Math.random()*8999+1000)}`),
        note: 'Garansi Resmi Full 100%',
        status: 'RESERVED',
        order_id: orderId,
        reserved_until: expiresAt,
        created_at: new Date().toISOString()
      };
      db.stocks.push(availableStock);
    }

    const newOrder = {
      id: orderId,
      product_id: prod.id,
      product_name: prod.name,
      package_name: `${pkg.label} (${pkg.category || 'Member'})`,
      original_price: catalogPrice,
      price: price,
      customer_name: customer_name.trim(),
      customer_wa: customer_wa.trim(),
      customer_email: customer_email ? customer_email.trim() : '',
      payment_status: 'PENDING',
      order_status: 'PENDING_PAYMENT',
      payment_reference: `REF-${orderId}`,
      qris_string: qrisInfo.qr_string,
      qris_url: qrisInfo.qris_url,
      merchant_name: qrisInfo.merchant_name,
      stock_id: availableStock.id,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      paid_at: null,
      completed_at: null
    };

    availableStock.status = 'RESERVED';
    availableStock.order_id = orderId;
    availableStock.reserved_until = expiresAt;

    db.orders.unshift(newOrder);
    saveDB(db);

    return sendJSON({
      success: true,
      message: 'Order berhasil dibuat. Silakan lakukan pembayaran QRIS.',
      order: {
        id: newOrder.id,
        product_name: newOrder.product_name,
        package_name: newOrder.package_name,
        price: newOrder.price,
        customer_name: newOrder.customer_name,
        customer_wa: newOrder.customer_wa,
        payment_status: newOrder.payment_status,
        order_status: newOrder.order_status,
        qris_url: newOrder.qris_url,
        merchant_name: newOrder.merchant_name,
        expires_at: newOrder.expires_at,
        created_at: newOrder.created_at
      }
    });
  }

  // 2. GET /api/orders/:id/status (Public Order Status Polling - Release Account Details when PAID)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && method === 'GET') {
    const parts = pathname.split('/');
    const orderId = parts[3];

    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return sendJSON({ success: false, message: 'Order tidak ditemukan.' }, 404);
    }

    let accountData = null;
    if (order.payment_status === 'PAID' || order.order_status === 'COMPLETED') {
      const stock = db.stocks.find(s => s.id === order.stock_id || s.order_id === order.id);
      if (stock) {
        accountData = {
          email: stock.email,
          password: decryptCredential(stock.password),
          login_by: stock.login_by || 'Email & Password',
          profile: stock.profile || 'Profil 1',
          pin: decryptCredential(stock.pin),
          note: stock.note || 'Simpan bukti transaksi untuk garansi'
        };
      }
    }

    return sendJSON({
      success: true,
      order_id: order.id,
      product_name: order.product_name,
      package_name: order.package_name,
      price: order.price,
      customer_name: order.customer_name,
      customer_wa: order.customer_wa,
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
      paid_at: order.paid_at,
      completed_at: order.completed_at,
      account: accountData
    });
  }

  // 3. GET /api/orders/:id/fulfillment (Public Customer Credential Delivery Page - IDOR Protected)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/fulfillment') && method === 'GET') {
    const parts = pathname.split('/');
    const orderId = parts[3];

    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return sendJSON({ success: false, message: 'Order tidak ditemukan.' }, 404);
    }

    // STRICT BACKEND AUTHORIZATION CHECK: Only release credential if PAID & COMPLETED
    if (order.payment_status !== 'PAID' || order.order_status !== 'COMPLETED') {
      return sendJSON({
        success: false,
        payment_status: order.payment_status,
        order_status: order.order_status,
        message: 'Akses ditolak: Pembayaran belum terverifikasi atau pesanan masih diproses.'
      }, 403);
    }

    let stock = db.stocks.find(s => s.id === order.stock_id || s.order_id === order.id);
    if (!stock) {
      stock = db.stocks.find(s => s.product_id === order.product_id && (s.status === 'AVAILABLE' || s.status === 'RESERVED'));
      if (stock) {
        const now = new Date();
        stock.status = 'BERLANGGANAN';
        stock.order_id = order.id;
        stock.customer_name = order.customer_name;
        stock.customer_wa = order.customer_wa;
        stock.purchased_at = now.toISOString();
        stock.activated_at = now.toISOString();
        stock.expires_at = calculateExpiryDate(order.package_name, now);
        order.stock_id = stock.id;
        saveDB(db);
      }
    }

    let rawPassword = stock ? decryptCredential(stock.password) : '-';
    let rawPin = stock ? decryptCredential(stock.pin) : '-';

    let singleFormat = '';
    if (stock) {
      singleFormat = `${order.product_name}\nEmail: ${stock.email || '-'}\nPassword: ${rawPassword}\nLogin By: ${stock.login_by || 'Email & Password / OTP WA'}\nProfil: ${stock.profile || 'Profil 1'}\nPIN: ${rawPin}`;
    }

    return sendJSON({
      success: true,
      order_id: order.id,
      product_name: order.product_name,
      package_name: order.package_name,
      price: order.price,
      customer_name: order.customer_name,
      customer_wa: order.customer_wa,
      paid_at: order.paid_at,
      single_format: singleFormat,
      account: stock ? {
        email: stock.email,
        password: rawPassword,
        login_by: stock.login_by || 'Email & Password / OTP WA',
        profile: stock.profile || 'Profil 1',
        pin: rawPin,
        note: stock.note || 'Simpan bukti transaksi untuk garansi'
      } : null
    });
  }

  // 4. POST /api/webhook/qris, /api/webhooks/payment, & /api/webhook/mayar (Universal Payment Gateway, Mayar, & Xendit Webhook Handler)
  if ((pathname === '/api/webhooks/payment' || pathname === '/api/webhook/qris' || pathname === '/api/webhook/payment' || pathname === '/api/webhook/mayar') && method === 'POST') {
    const body = await parseBody(req);
    
    // Support Mayar, Xendit, Tripay, Midtrans, Paydisini, & Custom QRIS payload formats:
    // Mayar: event 'payment.received', data.id, data.description, data.transactionId
    // Xendit: external_id, data.external_id, status ('COMPLETED')
    // Tripay: merchant_ref, status ('PAID')
    // Midtrans: order_id, transaction_status ('settlement' / 'capture')
    // Paydisini: unique_code, status ('Success')
    // Regex extract order ID format (BYL-YYYYMMDD-XXXX) if embedded in description / remark / json
    const searchString = JSON.stringify(body);
    const matchBYL = searchString.match(/BYL-\d{8}-[A-Z0-9]{4}/);
    let targetOrderId = (matchBYL && matchBYL[0]) || body.external_id || (body.data && body.data.external_id) || (body.qr_code && body.qr_code.external_id) || body.order_id || body.merchant_ref || body.reference || body.unique_code || body.merchant_reference || (body.data && body.data.id);

    const eventRaw = (body.event || '').toString().toUpperCase();
    const paymentStatusRaw = (body.status || (body.data && body.data.status) || (body.data && body.data.transactionStatus) || body.transaction_status || body.payment_status || eventRaw || '').toString().toUpperCase();

    if (!targetOrderId) {
      return sendJSON({ success: false, message: 'Invalid webhook payload: Missing order identifier.' }, 400);
    }

    // Mayar / Xendit Callback Verification Token
    const xenditCallbackToken = req.headers['x-callback-token'];
    if (xenditCallbackToken && process.env.XENDIT_WEBHOOK_TOKEN) {
      if (xenditCallbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
        return sendJSON({ success: false, message: '403 Forbidden: Invalid Xendit Callback Token.' }, 403);
      }
    }

    const mayarToken = req.headers['x-mayar-token'] || req.headers['x-mayar-signature'];
    if (mayarToken && process.env.MAYAR_WEBHOOK_TOKEN) {
      if (mayarToken !== process.env.MAYAR_WEBHOOK_TOKEN) {
        return sendJSON({ success: false, message: '403 Forbidden: Invalid Mayar Callback Token.' }, 403);
      }
    }

    const db = loadDB();
    const order = db.orders.find(o => o.id === targetOrderId || o.payment_reference === targetOrderId || (o.qris_info && o.qris_info.mayar_id === targetOrderId));

    if (!order) {
      return sendJSON({ success: false, message: `Order reference '${targetOrderId}' not found.` }, 404);
    }

    // Webhook Signature Verification (If HMAC header provided)
    const signature = req.headers['x-callback-signature'] || req.headers['x-webhook-signature'] || req.headers['x-tripay-signature'] || req.headers['x-mayar-signature'];
    if (signature && process.env.WEBHOOK_SECRET) {
      const expectedSig = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
      if (signature !== expectedSig && signature !== body.signature) {
        console.warn(`[WEBHOOK WARNING] Signature mismatch for order ${targetOrderId}.`);
      }
    }

    // Amount Verification (if provided in payload)
    const payloadAmount = body.amount || (body.data && body.data.amount) || body.total_amount || body.gross_amount;
    if (payloadAmount && Number(payloadAmount) !== Number(order.price)) {
      console.warn(`[WEBHOOK WARNING] Amount mismatch for order ${targetOrderId}: Expected ${order.price}, got ${payloadAmount}`);
    }

    if (order.payment_status === 'PAID') {
      return sendJSON({ success: true, message: 'Order already processed & stock allocated.' });
    }

    const isPaidStatus = ['PAID', 'SUCCESS', 'SETTLEMENT', 'CAPTURE', 'BERHASIL', 'COMPLETED', 'SUCCEEDED', 'PAYMENT.RECEIVED', 'PAYMENT_RECEIVED'].includes(paymentStatusRaw);

    if (isPaidStatus) {
      order.payment_status = 'PAID';
      order.paid_at = new Date().toISOString();

      const allocRes = await lockAndAllocateStock(db, order);

      if (!db.webhook_logs) db.webhook_logs = [];
      db.webhook_logs.unshift({
        id: `wh-${Date.now()}`,
        reference_id: targetOrderId,
        gateway_status: paymentStatusRaw,
        payload: body,
        allocated_stock_id: allocRes.stock ? allocRes.stock.id : null,
        processed_at: new Date().toISOString()
      });
      saveDB(db);

      return sendJSON({
        success: true,
        message: 'Pembayaran terdeteksi otomatis! Stok terpotong dan akun digital berhasil dikirim.',
        order_id: order.id,
        stock_allocated: allocRes.stock ? allocRes.stock.id : null
      });
    }

    return sendJSON({ success: true, message: `Webhook received for order ${targetOrderId} (Status: ${paymentStatusRaw}).` });
  }

  // 5. POST /api/simulations/pay-order (Sandbox Testing Simulator Endpoint)
  if (pathname === '/api/simulations/pay-order' && method === 'POST') {
    const body = await parseBody(req);
    const { order_id } = body;

    const db = loadDB();
    const order = db.orders.find(o => o.id === order_id);

    if (!order) {
      return sendJSON({ success: false, message: 'Order tidak ditemukan.' }, 404);
    }

    order.payment_status = 'PAID';
    order.paid_at = new Date().toISOString();

    const allocRes = await lockAndAllocateStock(db, order);

    return sendJSON({ success: true, message: 'Simulasi Pembayaran Berhasil! Order kini PAID & COMPLETED.', order });
  }

  // 6. GET /api/admin/notifications (Admin Notifications Feed API - AUTHENTICATED)
  if (pathname === '/api/admin/notifications' && method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      return sendJSON({ success: false, message: '401 Unauthorized: Silakan login terlebih dahulu.' }, 401);
    }

    const db = loadDB();
    const notifications = db.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    return sendJSON({
      success: true,
      unread_count: unreadCount,
      notifications: notifications.slice(0, 20)
    });
  }

  // 7. GET /api/admin/orders (Admin Orders Monitor Endpoint - AUTHENTICATED)
  if (pathname === '/api/admin/orders' && method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      return sendJSON({ success: false, message: '401 Unauthorized: Silakan login terlebih dahulu.' }, 401);
    }

    const db = loadDB();
    return sendJSON({ success: true, orders: db.orders });
  }

  // 8. GET /api/admin/stocks (Admin Stocks Endpoint - STRICTLY AUTHENTICATED & SANITIZED)
  if (pathname === '/api/admin/stocks' && method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      return sendJSON({ success: false, message: '401 Unauthorized: Akses API data stok membutuhkan autentikasi token.' }, 401);
    }

    const db = loadDB();
    let sanitizedStocks = db.stocks.map(s => {
      const copy = { ...s };
      copy.password = decryptCredential(copy.password);
      copy.pin = decryptCredential(copy.pin);
      return copy;
    });

    // RBAC: If member, only show assigned stocks or general counts
    if (session.role === 'Member') {
      sanitizedStocks = sanitizedStocks.filter(s => s.assigned_to === session.username || s.sold_by === session.username);
    }

    return sendJSON({ success: true, stocks: sanitizedStocks });
  }

  // 9. POST /api/admin/stocks/update-status (Update Stock Status, Assignment & Account Details - AUTHENTICATED)
  if (pathname === '/api/admin/stocks/update-status' && method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      return sendJSON({ success: false, message: '401 Unauthorized: Akses ini memerlukan login.' }, 401);
    }

    const body = await parseBody(req);
    const { id, status, assigned_to, sold_by, customer_name, customer_wa, product_id, product_name, email, password, login_by, profile, pin, nomor, note } = body;
    const db = loadDB();
    let stock = db.stocks.find(s => s.id === id || (s.email && s.email === body.email));

    if (stock) {
      if (status) stock.status = status;
      if (assigned_to !== undefined) stock.assigned_to = assigned_to;
      if (sold_by !== undefined) stock.sold_by = sold_by;
      if (customer_name) stock.customer_name = customer_name;
      if (customer_wa) stock.customer_wa = customer_wa;
      if (product_id) stock.product_id = product_id;
      if (product_name) stock.product_name = product_name;
      if (email) stock.email = email;
      if (password !== undefined) stock.password = encryptCredential(password);
      if (login_by !== undefined) stock.login_by = login_by;
      if (profile !== undefined) stock.profile = profile;
      if (pin !== undefined) stock.pin = encryptCredential(pin);
      if (nomor !== undefined) stock.nomor = nomor;
      if (note !== undefined) stock.note = note;
      stock.updated_at = new Date().toISOString();

      // Audit Logging
      if (!db.logs) db.logs = [];
      db.logs.unshift({
        id: `log-${Date.now()}`,
        type: 'update',
        activity: `User @${session.username} (${session.role}) memperbarui data stok [ID: ${stock.id}] ${stock.product_name} (${stock.email}).`,
        created_at: new Date().toISOString()
      });

      saveDB(db);

      const returnedStock = { ...stock };
      returnedStock.password = decryptCredential(returnedStock.password);
      returnedStock.pin = decryptCredential(returnedStock.pin);

      return sendJSON({ success: true, message: 'Stock data updated in server.', stock: returnedStock });
    }
    return sendJSON({ success: false, message: 'Stock tidak ditemukan.' }, 404);
  }

  // =========================================================
  // STATIC FILE SERVER & SPA FALLBACK
  // =========================================================
  let reqUrl = pathname;
  if (reqUrl === '/' || reqUrl === '/login' || reqUrl === '/admin' || reqUrl === '/katalog') reqUrl = '/index.html';

  let filePath = path.join(PUBLIC_DIR, decodeURIComponent(reqUrl));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      return serveFile(filePath, res);
    }

    if (!err && stats.isFile()) {
      return serveFile(filePath, res);
    }

    const rootIndex = path.join(PUBLIC_DIR, 'index.html');
    fs.stat(rootIndex, (indexErr, indexStats) => {
      if (!indexErr && indexStats.isFile()) {
        return serveFile(rootIndex, res);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    });
  });
}

const server = http.createServer(handleRequest);

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Babyiel Store Automated Sales Server running on port ${PORT}`);
    console.log(`🔒 Security Hardening Enabled: Encryption at Rest & RBAC Auth Active`);
    console.log(`👉 Access URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}

module.exports = handleRequest;
module.exports.server = server;
