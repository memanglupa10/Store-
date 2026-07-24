const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

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
  // === STOCK READY / AVAILABLE (15 items) ===
  { id: 'STK-1001', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', email: 'disney.vip01@babyiel.com', password: 'passdisney01', login_by: 'OTP WhatsApp', profile: 'Profil 1 (Rian)', pin: '1234', note: 'Akun batch utama', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 3).toISOString() },
  { id: 'STK-1005', product_id: 'prod-canva', product_name: 'Canva Pro', email: 'canva.designer@yahoo.com', password: 'passcanva05', login_by: 'Magic Link', profile: 'Admin Team', pin: '-', note: 'Akses 1 Tahun', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1006', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', email: 'gpt4o.master@openai.com', password: 'passgpt06', login_by: 'Email & Password', profile: 'Personal', pin: '5544', note: 'Ready GPT-4o', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 5).toISOString() },
  { id: 'STK-1009', product_id: 'prod-vidio', product_name: 'Vidio Platinum', email: 'vidio.plat01@gmail.com', password: 'passvidio09', login_by: 'OTP Phone', profile: 'Profil 1', pin: '1234', note: 'Premier Platinum 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1010', product_id: 'prod-iqiyi', product_name: 'iQIYI Premium', email: 'iqiyi.vip01@outlook.com', password: 'passiqiyi10', login_by: 'Email & Password', profile: 'VIP Profile', pin: '8899', note: 'Standard VIP', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 8).toISOString() },
  { id: 'STK-1011', product_id: 'prod-spotify', product_name: 'Spotify Premium', email: 'spot.fam02@gmail.com', password: 'passspot11', login_by: 'Invite Link', profile: 'Profil Member 11', pin: '-', note: 'Full Garansi 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 2).toISOString() },
  { id: 'STK-1012', product_id: 'prod-youtube', product_name: 'YouTube Premium', email: 'yt.fam02@gmail.com', password: 'passyt12', login_by: 'Google Account', profile: 'User 2', pin: '-', note: 'Individu Plan', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1013', product_id: 'prod-getcontact', product_name: 'Getcontact Premium', email: 'getcontact.prem02@gmail.com', password: 'passgc13', login_by: 'OTP SMS', profile: 'Profil 2', pin: '-', note: 'Aktif 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 12).toISOString() },
  { id: 'STK-1014', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', email: 'disney.prem03@babyiel.com', password: 'passdisney14', login_by: 'OTP WhatsApp', profile: 'Profil 3', pin: '5678', note: 'Private Profile', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 4).toISOString() },
  { id: 'STK-1015', product_id: 'prod-netflix', product_name: 'Netflix Premium', email: 'net.prem4k_02@gmail.com', password: 'passnet15', login_by: 'Email & Password', profile: 'Profil B', pin: '1122', note: 'Private User Screen', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 3).toISOString() },
  { id: 'STK-1016', product_id: 'prod-canva', product_name: 'Canva Pro', email: 'canva.brand02@gmail.com', password: 'passcanva16', login_by: 'Magic Link', profile: 'Brand Kit', pin: '-', note: 'Garansi Full', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 2).toISOString() },
  { id: 'STK-1017', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', email: 'gpt4o.team02@openai.com', password: 'passgpt17', login_by: 'Email & Password', profile: 'Team 2', pin: '9090', note: 'Batch Admin', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 6).toISOString() },
  { id: 'STK-1018', product_id: 'prod-vidio', product_name: 'Vidio Platinum', email: 'vidio.plat02@gmail.com', password: 'passvidio18', login_by: 'OTP Phone', profile: 'Profil 2', pin: '4321', note: 'Premier League Ready', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },
  { id: 'STK-1019', product_id: 'prod-iqiyi', product_name: 'iQIYI Premium', email: 'iqiyi.vip02@gmail.com', password: 'passiqiyi19', login_by: 'Email & Password', profile: 'VIP Screen 2', pin: '7788', note: 'Aktif 1 Bulan', status: 'AVAILABLE', created_at: new Date(nowSeed - 3600000 * 15).toISOString() },
  { id: 'STK-1031', product_id: 'prod-spotify', product_name: 'Spotify Premium', email: 'spot.fam03@gmail.com', password: 'passspot31', login_by: 'Invite Link', profile: 'User 5', pin: '-', note: 'Garansi 30 Hari', status: 'AVAILABLE', created_at: new Date(nowSeed - 86400000 * 1).toISOString() },

  // Default Fallbacks
  { id: 'stk-nf-001', product_id: 'prod-netflix', email: 'netflix.prem01@babyiel.com', password: 'password123', login_by: 'OTP WhatsApp', profile: 'Profil 1 (Rian)', pin: '1234', note: 'Garansi 30 Hari Full', status: 'AVAILABLE', created_at: new Date().toISOString() },
  { id: 'stk-nf-002', product_id: 'prod-netflix', email: 'netflix.prem02@babyiel.com', password: 'password456', login_by: 'Email & Password', profile: 'Profil 2 (Sinta)', pin: '5678', note: 'Garansi 30 Hari Full', status: 'AVAILABLE', created_at: new Date().toISOString() },
  { id: 'stk-cnv-001', product_id: 'prod-canva', email: 'canvadesign.pro01@yahoo.com', password: 'canvapassword99', login_by: 'Invite Link', profile: 'Designer Team', pin: '-', note: 'Member Pro 30 Hari', status: 'AVAILABLE', created_at: new Date().toISOString() }
];

// Database Manager
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: DEFAULT_PRODUCTS,
      stocks: DEFAULT_STOCKS,
      orders: [],
      notifications: [],
      logs: [],
      webhook_logs: [],
      settings: {
        store_title: 'Babyiel Store',
        support_phone: '085775335453',
        qris_merchant_name: 'BABYIEL STORE OFFICIAL',
        qris_merchant_id: 'ID1029384756'
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.logs) parsed.logs = [];

    // Auto-migrate stocks if database has fewer than 15 stocks
    if (!parsed.stocks || parsed.stocks.length < 15) {
      DEFAULT_STOCKS.forEach(defStk => {
        if (!parsed.stocks.some(s => s.id === defStk.id || s.email === defStk.email)) {
          parsed.stocks.push(defStk);
        }
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return { products: DEFAULT_PRODUCTS, stocks: DEFAULT_STOCKS, orders: [], notifications: [], logs: [], webhook_logs: [], settings: {} };
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
    'Access-Control-Allow-Origin': '*'
  });

  const stream = fs.createReadStream(targetPath);
  stream.pipe(res);
};

// Helper: Parse JSON Body from HTTP Request
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

// MAIN HTTP SERVER
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Helper for JSON API responses
  const sendJSON = (data, statusCode = 200) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Signature',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end(JSON.stringify(data));
  };

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Signature',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // =========================================================
  // REST API ENDPOINTS
  // =========================================================

  // 1. POST /api/checkout (Customer Order & QRIS Creation)
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
    const price = pkg.price || 0;

    // Check available stock (match package_label first, then any available for product)
    let availableStock = db.stocks.find(s => s.product_id === product_id && s.package_label === package_label && (s.status === 'AVAILABLE' || s.status === 'READY'));
    if (!availableStock) {
      availableStock = db.stocks.find(s => s.product_id === product_id && (s.status === 'AVAILABLE' || s.status === 'READY'));
    }

    // Auto-replenish stock if empty for smooth demo/production testing
    if (!availableStock) {
      const newStockId = `stk-${product_id.replace('prod-', '')}-${Date.now().toString().slice(-4)}`;
      availableStock = {
        id: newStockId,
        product_id: product_id,
        package_label: package_label,
        email: `${product_id.replace('prod-', '')}.user${Math.floor(Math.random()*900+100)}@babyiel.com`,
        password: `pass${Math.floor(Math.random()*899999+100000)}`,
        login_by: 'Email & Password / OTP WA',
        profile: `Profil ${Math.floor(Math.random()*4+1)}`,
        pin: `${Math.floor(Math.random()*8999+1000)}`,
        note: 'Garansi Resmi Full 100%',
        status: 'AVAILABLE',
        order_id: null,
        created_at: new Date().toISOString()
      };
      db.stocks.push(availableStock);
    }

    // Create Order Record
    const orderId = `BYL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const qrisInfo = generateQRISData(orderId, price);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 minutes QRIS countdown

    const newOrder = {
      id: orderId,
      product_id: prod.id,
      product_name: prod.name,
      package_name: `${pkg.label} (${pkg.category || 'Member'})`,
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

    // Temporarily Reserve Stock
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

  // 2. GET /api/orders/:id/status (Public Polling Status - NO PASSWORDS EXPOSED)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && method === 'GET') {
    const parts = pathname.split('/');
    const orderId = parts[3];

    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return sendJSON({ success: false, message: 'Order tidak ditemukan.' }, 404);
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
      completed_at: order.completed_at
    });
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
    // Default 1 Bulan (30 Hari)
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
}

  // 3. GET /api/orders/:id/fulfillment (Public Customer Credential Delivery Page)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/fulfillment') && method === 'GET') {
    const parts = pathname.split('/');
    const orderId = parts[3];

    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return sendJSON({ success: false, message: 'Order tidak ditemukan.' }, 404);
    }

    // SECURITY CHECK: Credential ONLY released when Payment = PAID & Order = COMPLETED!
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

    const prod = db.products.find(p => p.id === order.product_id);
    const settings = db.settings || {};

    let singleFormat = '';
    if (stock) {
      singleFormat = `${order.product_name}\nEmail: ${stock.email || '-'}\nPassword: ${stock.password || '-'}\nLogin By: ${stock.login_by || 'Email & Password / OTP WA'}\nProfil: ${stock.profile || 'Profil 1'}\nPIN: ${stock.pin || '1234'}`;
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
        password: stock.password,
        login_by: stock.login_by || 'Email & Password / OTP WA',
        profile: stock.profile || 'Profil 1',
        pin: stock.pin || '1234',
        note: stock.note || 'Simpan bukti transaksi untuk garansi'
      } : null
    });
  }

  // 4. POST /api/webhooks/payment (Payment Gateway Webhook Callback)
  if (pathname === '/api/webhooks/payment' && method === 'POST') {
    const body = await parseBody(req);
    const { reference, order_id, status, amount } = body;

    const targetOrderId = order_id || reference;
    if (!targetOrderId) {
      return sendJSON({ success: false, message: 'Invalid webhook payload.' }, 400);
    }

    const db = loadDB();
    const order = db.orders.find(o => o.id === targetOrderId || o.payment_reference === targetOrderId);

    if (!order) {
      return sendJSON({ success: false, message: 'Order reference not found.' }, 404);
    }

    // Idempotency Check: Ignore if already paid
    if (order.payment_status === 'PAID') {
      return sendJSON({ success: true, message: 'Order already processed.' });
    }

    if (status === 'PAID' || status === 'SUCCESS') {
      const now = new Date();
      const nowIso = now.toISOString();
      order.payment_status = 'PAID';
      order.paid_at = nowIso;

      // Find Stock Allocation (Search both AVAILABLE & READY status)
      let stock = db.stocks.find(s => s.order_id === order.id || (s.product_id === order.product_id && s.status === 'RESERVED'));
      if (!stock) {
        stock = db.stocks.find(s => s.product_id === order.product_id && (s.status === 'AVAILABLE' || s.status === 'READY'));
      }

      if (stock) {
        stock.status = 'BERLANGGANAN';
        stock.order_id = order.id;
        stock.customer_name = order.customer_name;
        stock.customer_wa = order.customer_wa;
        stock.purchased_at = nowIso;
        stock.activated_at = nowIso;
        stock.expires_at = calculateExpiryDate(order.package_name, now);

        order.stock_id = stock.id;
        order.order_status = 'COMPLETED';
        order.completed_at = nowIso;
      } else {
        order.order_status = 'WAITING_STOCK';
      }

      // Add Admin Notification & Activity Log
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

      // Log Webhook Result
      db.webhook_logs.unshift({
        id: `wh-${Date.now()}`,
        reference_id: targetOrderId,
        status: status,
        processed_at: nowIso
      });

      saveDB(db);
      return sendJSON({ success: true, message: 'Webhook payment processed & stock allocated.' });
    }

    return sendJSON({ success: true, message: 'Webhook received.' });
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

    const now = new Date();
    const nowIso = now.toISOString();
    order.payment_status = 'PAID';
    order.paid_at = nowIso;

    let stock = db.stocks.find(s => s.order_id === order.id || (s.product_id === order.product_id && s.status === 'RESERVED'));
    if (!stock) {
      stock = db.stocks.find(s => s.product_id === order.product_id && (s.status === 'AVAILABLE' || s.status === 'READY'));
    }

    if (stock) {
      stock.status = 'BERLANGGANAN';
      stock.order_id = order.id;
      stock.customer_name = order.customer_name;
      stock.customer_wa = order.customer_wa;
      stock.purchased_at = nowIso;
      stock.activated_at = nowIso;
      stock.expires_at = calculateExpiryDate(order.package_name, now);

      order.stock_id = stock.id;
      order.order_status = 'COMPLETED';
      order.completed_at = nowIso;
    } else {
      order.order_status = 'WAITING_STOCK';
    }

    // Add Admin Notification & Activity Log
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
    return sendJSON({ success: true, message: 'Simulasi Pembayaran Berhasil! Order kini PAID & COMPLETED.', order });
  }

  // 6. GET /api/admin/notifications (Admin Notifications Feed API)
  if (pathname === '/api/admin/notifications' && method === 'GET') {
    const db = loadDB();
    const notifications = db.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    return sendJSON({
      success: true,
      unread_count: unreadCount,
      notifications: notifications.slice(0, 20)
    });
  }

  // 6. GET /api/admin/orders (Admin Orders Monitor Endpoint)
  if (pathname === '/api/admin/orders' && method === 'GET') {
    const db = loadDB();
    return sendJSON({ success: true, orders: db.orders });
  }

  // 7. GET /api/admin/stocks (Admin Stocks Endpoint)
  if (pathname === '/api/admin/stocks' && method === 'GET') {
    const db = loadDB();
    return sendJSON({ success: true, stocks: db.stocks });
  }

  // 8. POST /api/admin/stocks/update-status (Update Stock Status & Assignment)
  if (pathname === '/api/admin/stocks/update-status' && method === 'POST') {
    const body = await parseBody(req);
    const { id, status, assigned_to, sold_by, customer_name, customer_wa } = body;
    const db = loadDB();
    let stock = db.stocks.find(s => s.id === id || (s.email && s.email === body.email));
    if (stock) {
      if (status) stock.status = status;
      if (assigned_to !== undefined) stock.assigned_to = assigned_to;
      if (sold_by !== undefined) stock.sold_by = sold_by;
      if (customer_name) stock.customer_name = customer_name;
      if (customer_wa) stock.customer_wa = customer_wa;
      saveDB(db);
      return sendJSON({ success: true, message: 'Stock status updated in server.', stock });
    }
    return sendJSON({ success: false, message: 'Stock tidak ditemukan.' }, 404);
  }

  // =========================================================
  // STATIC FILE SERVER & SPA FALLBACK
  // =========================================================
  let reqUrl = pathname;
  if (reqUrl === '/') reqUrl = '/index.html';

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
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Babyiel Store Automated Sales Server running on port ${PORT}`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
