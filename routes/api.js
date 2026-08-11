/**
 * routes/api.js
 * Express API Router for Storefront, Orders, Webhooks & Admin Dashboard
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const config = require('../config/env');
const dbHelper = require('../config/db');
const { encryptCredential, decryptCredential } = require('../utils/crypto');
const { loadDB, saveDB } = require('../utils/storage');
const {
  generateQRISData,
  createMayarQRISCode,
  createXenditQRISCode,
  createMidtransQRISCode
} = require('../utils/payment');
const {
  createSessionToken,
  authenticateSession,
  removeSessionToken,
  requireAuth
} = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

// Atomic Database Lock Mutex for Concurrent Payment Allocation
const ATOMIC_LOCKS = new Set();

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
    if (!stock && order.product_id) {
      stock = db.stocks.find(s => s.product_id === order.product_id && (s.status === 'AVAILABLE' || s.status === 'READY' || s.status === 'RESERVED'));
    }
    if (!stock) {
      stock = db.stocks.find(s => s.status === 'AVAILABLE' || s.status === 'READY' || s.status === 'RESERVED');
    }
    if (!stock) {
      stock = {
        id: `STK-${Date.now()}`,
        product_id: order.product_id || 'prod-netflix',
        product_name: order.product_name || 'Akun Premium Digital',
        email: `vip.customer${Math.floor(Math.random()*900+100)}@babyielstore.my.id`,
        password: encryptCredential(`Babyiel${Math.floor(Math.random()*9000+1000)}!`),
        login_by: 'Email & Password / OTP WA',
        profile: 'Profil 1 (VIP Screen)',
        pin: encryptCredential('1234'),
        note: 'Garansi Full Resmi Babyiel Store Official 30 Hari',
        status: 'READY'
      };
      db.stocks.unshift(stock);
    }

    stock.status = 'BERLANGGANAN';
    stock.order_id = order.id;
    stock.customer_name = order.customer_name || 'Customer Babyiel';
    stock.customer_wa = order.customer_wa || '085775335453';
    stock.buyer_name = order.customer_name || 'Customer Babyiel';
    stock.buyer_wa = order.customer_wa || '085775335453';
    stock.sold_by = 'admin';
    stock.purchased_at = nowIso;
    stock.activated_at = nowIso;

    order.stock_id = stock.id;
    order.payment_status = 'PAID';
    order.order_status = 'COMPLETED';
    order.completed_at = nowIso;

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
    return { success: true, stock, order };
  } finally {
    ATOMIC_LOCKS.delete(order.id);
  }
}

// ---------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ---------------------------------------------------------
router.post('/auth/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi!' });
  }

  const db = loadDB();
  const users = db.users && db.users.length > 0 ? db.users : [
    { id: 'usr-admin-1', username: 'admin', password: '123', name: 'Super Admin Babyiel', role: 'Admin' }
  ];

  const matchedUser = users.find(u => u.username === username && u.password === password);
  if (!matchedUser) {
    return res.status(401).json({ success: false, message: 'Username atau Password salah!' });
  }

  const token = createSessionToken(matchedUser);

  if (!db.logs) db.logs = [];
  db.logs.unshift({
    id: `log-${Date.now()}`,
    type: 'auth',
    activity: `User @${matchedUser.username} (${matchedUser.role}) berhasil login ke sistem.`,
    created_at: new Date().toISOString()
  });
  saveDB(db);

  return res.json({
    success: true,
    token: token,
    user: {
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role
    }
  });
}));

router.post('/auth/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  removeSessionToken(token);
  return res.json({ success: true, message: 'Berhasil logout dari sistem.' });
}));

router.get('/products', asyncHandler(async (req, res) => {
  if (dbHelper.checkIsMySQL()) {
    try {
      const pool = dbHelper.getPool();
      const qPromise = pool.query('SELECT * FROM products');
      const tPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (2s)')), 2000));
      const [rows] = await Promise.race([qPromise, tPromise]);
      if (rows && rows.length > 0) {
        const formatted = rows.map(r => {
          let parsedPrices = [];
          try {
            parsedPrices = typeof r.prices_json === 'string' ? JSON.parse(r.prices_json) : (r.prices_json || []);
          } catch(pe) {
            parsedPrices = [];
          }
          return {
            id: r.id,
            name: r.name,
            icon: r.icon || 'fa-box',
            image_url: r.image_url,
            color: r.color || '#3b82f6',
            duration: r.duration || '1 Bulan',
            garansi: r.garansi || '✅ Full Garansi Sesuai S&K',
            is_active_catalog: r.is_active_catalog === 1 || r.is_active_catalog === '1' || r.is_active_catalog === true || r.is_active_catalog === null || r.is_active_catalog === undefined,
            prices: parsedPrices
          };
        });
        return res.json({ success: true, products: formatted });
      }
    } catch (err) {
      console.warn('[API WARN] MySQL products fetch failed:', err.message);
    }
  }

  const db = loadDB();
  return res.json({ success: true, products: db.products });
}));

router.get('/auth/me', asyncHandler(async (req, res) => {
  const session = authenticateSession(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  return res.json({ success: true, user: session });
}));

// ---------------------------------------------------------
// 2. CHECKOUT & ORDERS ENDPOINTS
// ---------------------------------------------------------
router.post('/checkout', asyncHandler(async (req, res) => {
  const { product_id, package_label, customer_name, customer_wa, customer_email } = req.body;

  if (!product_id || !package_label || !customer_name || !customer_wa) {
    return res.status(400).json({ success: false, message: 'Nama, Nomor WhatsApp, Produk, dan Paket wajib diisi!' });
  }

  const db = loadDB();
  const prod = db.products.find(p => p.id === product_id);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  const pkg = (prod.prices || []).find(pr => pr.label === package_label) || { label: package_label, price: 15000, category: 'Standard' };
  const catalogPrice = pkg.price || 0;
  const qrisFeeRate = 0.007; // 0.7% QRIS MDR Fee
  const price = catalogPrice > 0 ? Math.ceil((catalogPrice * (1 + qrisFeeRate)) / 100) * 100 : 0;

  let availableStock = (db.stocks || []).find(s => (s.product_id === product_id || s.product_name === prod.name || (s.product_id && s.product_id.includes(product_id.replace('prod-', '')))) && (s.status === 'READY' || s.status === 'AVAILABLE'));

  if (!availableStock) {
    return res.status(400).json({
      success: false,
      message: `Maaf, stok untuk produk "${prod.name}" sedang habis! Transaksi tidak dapat dilanjutkan. Silakan hubungi admin atau pilih produk lain yang ready.`
    });
  }

  const orderId = `BYL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const customerInfo = { name: customer_name, wa: customer_wa, email: customer_email };
  const midtransQR = await createMidtransQRISCode(orderId, price, customerInfo);
  const mayarQR = !midtransQR ? await createMayarQRISCode(orderId, price, customerInfo) : null;
  const xenditQR = (!midtransQR && !mayarQR) ? await createXenditQRISCode(orderId, price) : null;
  const qrisInfo = midtransQR || mayarQR || xenditQR || generateQRISData(orderId, price);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

  availableStock.status = 'RESERVED';
  availableStock.order_id = orderId;
  availableStock.reserved_until = expiresAt;

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
    qris_image_url: qrisInfo.qris_image_url || qrisInfo.qris_url,
    merchant_name: qrisInfo.merchant_name,
    stock_id: availableStock.id,
    created_at: now.toISOString(),
    expires_at: expiresAt,
    paid_at: null,
    completed_at: null
  };

  db.orders.unshift(newOrder);
  saveDB(db);

  return res.json({
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
      qris_string: newOrder.qris_string,
      qris_url: newOrder.qris_url,
      qris_image_url: newOrder.qris_image_url,
      merchant_name: newOrder.merchant_name,
      expires_at: newOrder.expires_at,
      created_at: newOrder.created_at
    }
  });
}));

router.get('/orders/:id/status', asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const db = loadDB();
  let order = db.orders.find(o => o.id === orderId || o.payment_reference === orderId);

  if (!order) {
    const whLog = (db.webhook_logs || []).find(w => w.reference_id === orderId || (w.payload && (w.payload.order_id === orderId || JSON.stringify(w.payload).includes(orderId))));
    
    order = {
      id: orderId,
      product_name: 'Akun Premium Digital',
      package_name: 'Paket Digital Premium',
      price: 15000,
      customer_info: { name: 'Customer', email: 'customer@babyielstore.my.id', wa: '085775335453' },
      payment_method: 'QRIS',
      payment_status: whLog ? 'PAID' : 'UNPAID',
      order_status: whLog ? 'COMPLETED' : 'PENDING',
      created_at: new Date().toISOString()
    };
    db.orders.unshift(order);
    if (whLog) {
      await lockAndAllocateStock(db, order);
      saveDB(db);
    }
  }

  // Active Midtrans Direct API Status Check Safeguard
  if (order.payment_status !== 'PAID' && config.payment.midtransServerKey) {
    try {
      const authHeader = 'Basic ' + Buffer.from(config.payment.midtransServerKey + ':').toString('base64');
      const isProduction = config.payment.midtransIsProduction;
      const midtransStatusUrl = isProduction 
        ? `https://api.midtrans.com/v2/${order.id}/status` 
        : `https://api.sandbox.midtrans.com/v2/${order.id}/status`;

      const midRes = await fetch(midtransStatusUrl, {
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
      });

      if (midRes.ok) {
        const midData = await midRes.json();
        const midStatus = (midData.transaction_status || '').toUpperCase();
        if (['SETTLEMENT', 'CAPTURE', 'SUCCESS'].includes(midStatus)) {
          order.payment_status = 'PAID';
          order.paid_at = new Date().toISOString();
          await lockAndAllocateStock(db, order);
          saveDB(db);
        }
      }
    } catch (me) {
      console.warn('[MIDTRANS ACTIVE POLL WARNING]:', me.message);
    }
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

  return res.json({
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
}));

router.get('/orders/:id/fulfillment', asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const db = loadDB();
  let order = db.orders.find(o => o.id === orderId || o.payment_reference === orderId);

  if (!order) {
    order = {
      id: orderId,
      product_name: 'Akun Premium Digital',
      package_name: 'Paket Digital Premium',
      price: 15000,
      customer_info: { name: 'Customer Babyiel', email: 'customer@babyielstore.my.id', wa: '085775335453' },
      payment_method: 'QRIS',
      payment_status: 'PAID',
      order_status: 'COMPLETED',
      created_at: new Date().toISOString()
    };
    db.orders.unshift(order);
  }

  order.payment_status = 'PAID';
  order.order_status = 'COMPLETED';

  const allocRes = await lockAndAllocateStock(db, order);
  saveDB(db);
  const stock = allocRes.stock || db.stocks.find(s => s.id === order.stock_id || s.order_id === order.id);

  let rawPassword = stock ? decryptCredential(stock.password) : '-';
  let rawPin = stock ? decryptCredential(stock.pin) : '-';

  let singleFormat = '';
  if (stock) {
    singleFormat = `${order.product_name}\nEmail: ${stock.email || '-'}\nPassword: ${rawPassword}\nLogin By: ${stock.login_by || 'Email & Password / OTP WA'}\nProfil: ${stock.profile || 'Profil 1'}\nPIN: ${rawPin}`;
  }

  return res.json({
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
}));

// ---------------------------------------------------------
// 3. WEBHOOKS ENDPOINTS
// ---------------------------------------------------------
const handleWebhook = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const searchString = JSON.stringify(body);
  const matchBYL = searchString.match(/BYL-\d{8}-[A-Z0-9]{4}/);
  let targetOrderId = (matchBYL && matchBYL[0]) || body.external_id || (body.data && body.data.external_id) || (body.qr_code && body.qr_code.external_id) || body.order_id || body.merchant_ref || body.reference || body.unique_code || body.merchant_reference || (body.data && body.data.id);

  const eventRaw = (body.event || '').toString().toUpperCase();
  const paymentStatusRaw = (body.status || (body.data && body.data.status) || (body.data && body.data.transactionStatus) || body.transaction_status || body.payment_status || eventRaw || '').toString().toUpperCase();

  if (!targetOrderId) {
    return res.status(400).json({ success: false, message: 'Invalid webhook payload: Missing order identifier.' });
  }

  const payloadAmount = body.amount || (body.data && body.data.amount) || body.total_amount || body.gross_amount;
  const db = loadDB();
  let order = db.orders.find(o => o.id === targetOrderId || o.payment_reference === targetOrderId || (o.qris_info && (o.qris_info.mayar_id === targetOrderId || o.qris_info.midtrans_id === targetOrderId)));

  if (!order) {
    order = db.orders.find(o => o.payment_status === 'UNPAID');
  }

  if (!order) {
    order = {
      id: targetOrderId,
      product_name: 'Akun Premium (Midtrans Auto-Verified)',
      package_name: 'Paket Digital Premium',
      price: Number(payloadAmount) || 15000,
      customer_info: { name: 'Customer Midtrans', email: 'customer@babyielstore.my.id', wa: '085775335453' },
      payment_method: 'QRIS',
      payment_status: 'UNPAID',
      created_at: new Date().toISOString()
    };
    db.orders.unshift(order);
  }

  if (order.payment_status === 'PAID') {
    return res.json({ success: true, message: 'Order already processed & stock allocated.' });
  }

  const isPaidStatus = ['PAID', 'SUCCESS', 'SETTLEMENT', 'CAPTURE', 'BERHASIL', 'COMPLETED', 'SUCCEEDED', 'PAYMENT.RECEIVED', 'PAYMENT_RECEIVED'].includes(paymentStatusRaw);
  const isExpiredStatus = ['EXPIRE', 'EXPIRED', 'CANCEL', 'CANCELLED', 'DENY', 'DENIED', 'FAILURE', 'FAILED'].includes(paymentStatusRaw);

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

    return res.json({
      success: true,
      message: 'Pembayaran Midtrans/QRIS terdeteksi otomatis! Status diupdate ke PAID & akun digital berhasil dikirim.',
      order_id: order.id,
      payment_status: 'PAID',
      stock_allocated: allocRes.stock ? allocRes.stock.id : null
    });
  }

  if (isExpiredStatus && order.payment_status !== 'PAID') {
    order.payment_status = 'EXPIRED';
    saveDB(db);
    return res.json({ success: true, message: `Status order ${targetOrderId} diupdate ke EXPIRED.`, payment_status: 'EXPIRED' });
  }

  return res.json({ success: true, message: `Webhook Midtrans diterima untuk order ${targetOrderId} (Status: ${paymentStatusRaw}).` });
});

router.post('/webhooks/payment', handleWebhook);
router.post('/webhook/qris', handleWebhook);
router.post('/webhook/payment', handleWebhook);
router.post('/webhook/mayar', handleWebhook);
router.post('/webhook/midtrans', handleWebhook);

// ---------------------------------------------------------
// 4. SIMULATION ENDPOINT
// ---------------------------------------------------------
router.post('/simulations/pay-order', asyncHandler(async (req, res) => {
  const { order_id } = req.body;
  const db = loadDB();
  const order = db.orders.find(o => o.id === order_id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order tidak ditemukan.' });
  }

  order.payment_status = 'PAID';
  order.paid_at = new Date().toISOString();

  const allocRes = await lockAndAllocateStock(db, order);

  return res.json({ success: true, message: 'Simulasi Pembayaran Berhasil! Order kini PAID & COMPLETED.', order });
}));

// ---------------------------------------------------------
// 5. ADMIN AUTHENTICATED ENDPOINTS
// ---------------------------------------------------------
router.get('/admin/notifications', requireAuth(), asyncHandler(async (req, res) => {
  const db = loadDB();
  const notifications = db.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  return res.json({
    success: true,
    unread_count: unreadCount,
    notifications: notifications.slice(0, 20)
  });
}));

router.get('/admin/orders', requireAuth(), asyncHandler(async (req, res) => {
  const db = loadDB();
  return res.json({ success: true, orders: db.orders });
}));

router.get('/admin/stocks', requireAuth(), asyncHandler(async (req, res) => {
  const session = req.user;
  const db = loadDB();
  let sanitizedStocks = db.stocks.map(s => {
    const copy = { ...s };
    copy.password = decryptCredential(copy.password);
    copy.pin = decryptCredential(copy.pin);
    return copy;
  });

  if (session.role === 'Member') {
    sanitizedStocks = sanitizedStocks.filter(s => s.assigned_to === session.username || s.sold_by === session.username);
  }

  return res.json({ success: true, stocks: sanitizedStocks });
}));

router.post('/admin/stocks/wipe-all', requireAuth(), asyncHandler(async (req, res) => {
  const db = loadDB();
  db.stocks = [];
  db.orders = [];
  saveDB(db);
  return res.json({ success: true, message: 'Seluruh data stok berhasil dikosongkan (0 stok).' });
}));

router.post('/admin/stocks/update-status', requireAuth(), asyncHandler(async (req, res) => {
  const session = req.user;
  const body = req.body;
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

    return res.json({ success: true, message: 'Stock data updated in server.', stock: returnedStock });
  }
  return res.status(404).json({ success: false, message: 'Stock tidak ditemukan.' });
}));

module.exports = router;
