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

const DEFAULT_STOCKS = [
  {
    id: 'stk-nf-001',
    product_id: 'prod-netflix',
    package_label: '1 Bulan',
    email: 'netflix.prem01@babyiel.com',
    password: 'password123',
    login_by: 'OTP WhatsApp',
    profile: 'Profil 1 (Rian)',
    pin: '1234',
    note: 'Garansi 30 Hari Full',
    status: 'AVAILABLE',
    order_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'stk-nf-002',
    product_id: 'prod-netflix',
    package_label: '1 Bulan',
    email: 'netflix.prem02@babyiel.com',
    password: 'password456',
    login_by: 'Email & Password',
    profile: 'Profil 2 (Sinta)',
    pin: '5678',
    note: 'Garansi 30 Hari Full',
    status: 'AVAILABLE',
    order_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'stk-cnv-001',
    product_id: 'prod-canva',
    package_label: '1 Bulan',
    email: 'canvadesign.pro01@yahoo.com',
    password: 'canvapassword99',
    login_by: 'Invite Link',
    profile: 'Designer Team',
    pin: '-',
    note: 'Member Pro 30 Hari',
    status: 'AVAILABLE',
    order_id: null,
    created_at: new Date().toISOString()
  }
];

// Database Manager
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: DEFAULT_PRODUCTS,
      stocks: DEFAULT_STOCKS,
      orders: [],
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
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { products: DEFAULT_PRODUCTS, stocks: DEFAULT_STOCKS, orders: [], webhook_logs: [], settings: {} };
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

    // Check available stock
    const availableStock = db.stocks.find(s => s.product_id === product_id && s.status === 'AVAILABLE');

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
      order_status: availableStock ? 'PENDING_PAYMENT' : 'WAITING_STOCK',
      payment_reference: `REF-${orderId}`,
      qris_string: qrisInfo.qr_string,
      qris_url: qrisInfo.qris_url,
      merchant_name: qrisInfo.merchant_name,
      stock_id: null,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      paid_at: null,
      completed_at: null
    };

    // Temporarily Reserve Stock if available
    if (availableStock) {
      availableStock.status = 'RESERVED';
      availableStock.order_id = orderId;
      availableStock.reserved_until = expiresAt;
    }

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

    const stock = db.stocks.find(s => s.id === order.stock_id || s.order_id === order.id);
    const prod = db.products.find(p => p.id === order.product_id);
    const settings = db.settings || {};

    let formattedText = '';
    if (stock) {
      let tpl = (prod && prod.template) ? prod.template : `✨ {{product_name}} ✨\n\n📞 Nomor WA : {{nomor}}\n📩 Email : {{email}}\n🔑 Password : {{password}}\nLogin By : {{login}}\n👤 Profil : {{profile}}\n🔐 PIN : {{pin}}\n\n━━━━━━━━━━━━━━\n📌 GARANSI & CATATAN\n🛡️ {{note}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`;

      if (!tpl.includes('{{password}}')) {
        tpl = tpl.replace('{{email}}', '{{email}}\n🔑 Password : {{password}}');
      }

      formattedText = tpl
        .replace(/\{\{product_name\}\}/g, order.product_name || (prod ? prod.name : 'Digital Account'))
        .replace(/\{\{nomor\}\}/g, order.customer_wa || '-')
        .replace(/\{\{email\}\}/g, stock.email || '-')
        .replace(/\{\{password\}\}/g, stock.password || '-')
        .replace(/\{\{login\}\}/g, stock.login_by || 'Email & Password')
        .replace(/\{\{profile\}\}/g, stock.profile || 'Profil 1')
        .replace(/\{\{pin\}\}/g, stock.pin || '1234')
        .replace(/\{\{note\}\}/g, stock.note || 'Garansi Resmi Sesuai S&K')
        .replace(/\{\{support_phone\}\}/g, settings.support_phone || '085775335453');
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
      formatted_text: formattedText,
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
      const nowIso = new Date().toISOString();
      order.payment_status = 'PAID';
      order.paid_at = nowIso;

      // Find Stock Allocation
      let stock = db.stocks.find(s => s.order_id === order.id || (s.product_id === order.product_id && s.status === 'RESERVED'));
      if (!stock) {
        stock = db.stocks.find(s => s.product_id === order.product_id && s.status === 'AVAILABLE');
      }

      if (stock) {
        stock.status = 'SOLD';
        stock.order_id = order.id;
        stock.sold_at = nowIso;

        order.stock_id = stock.id;
        order.order_status = 'COMPLETED';
        order.completed_at = nowIso;
      } else {
        order.order_status = 'WAITING_STOCK';
      }

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

    const nowIso = new Date().toISOString();
    order.payment_status = 'PAID';
    order.paid_at = nowIso;

    let stock = db.stocks.find(s => s.order_id === order.id || (s.product_id === order.product_id && s.status === 'RESERVED'));
    if (!stock) {
      stock = db.stocks.find(s => s.product_id === order.product_id && s.status === 'AVAILABLE');
    }

    if (stock) {
      stock.status = 'SOLD';
      stock.order_id = order.id;
      stock.sold_at = nowIso;

      order.stock_id = stock.id;
      order.order_status = 'COMPLETED';
      order.completed_at = nowIso;
    } else {
      order.order_status = 'WAITING_STOCK';
    }

    saveDB(db);
    return sendJSON({ success: true, message: 'Simulasi Pembayaran Berhasil! Order kini PAID & COMPLETED.', order });
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
