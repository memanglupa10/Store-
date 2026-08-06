-- =========================================================
-- Babyiel Store - Complete MySQL Database Schema & 124 Seed Data
-- Optimized for cPanel MySQL (phpMyAdmin) & PostgreSQL
-- =========================================================

-- ---------------------------------------------------------
-- 1. USERS TABLE (Authentication & Role Access)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'Member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 2. PRODUCTS TABLE (Catalog Products & Price Tiers)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'fa-box',
  image_url TEXT,
  color VARCHAR(20) DEFAULT '#A76CF5',
  duration VARCHAR(50) DEFAULT '1 Bulan',
  garansi VARCHAR(100) DEFAULT 'Full Garansi Resmi 30 Hari',
  prices_json TEXT,
  template TEXT,
  is_active_catalog BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 3. STOCKS TABLE (Digital Account Inventory)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  login_by VARCHAR(50) DEFAULT 'Email & Password',
  profile VARCHAR(100) DEFAULT 'Profil 1',
  pin VARCHAR(50) DEFAULT '-',
  note TEXT,
  status VARCHAR(30) DEFAULT 'AVAILABLE',
  assigned_to VARCHAR(100) DEFAULT NULL,
  sold_by VARCHAR(100) DEFAULT NULL,
  buyer_name VARCHAR(100) DEFAULT NULL,
  buyer_wa VARCHAR(30) DEFAULT NULL,
  purchased_at TIMESTAMP NULL DEFAULT NULL,
  activated_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_stocks_product_status (product_id, status),
  INDEX idx_stocks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 4. ORDERS TABLE (Automated QRIS Checkout & Transactions)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  price_category VARCHAR(50) DEFAULT 'Standard',
  amount INT NOT NULL,
  payment_ref VARCHAR(100) UNIQUE,
  payment_method VARCHAR(50) DEFAULT 'QRIS',
  qris_data TEXT,
  status VARCHAR(30) DEFAULT 'PENDING',
  allocated_stock_id VARCHAR(50) DEFAULT NULL,
  account_email VARCHAR(150) DEFAULT NULL,
  account_password VARCHAR(255) DEFAULT NULL,
  account_pin VARCHAR(50) DEFAULT NULL,
  account_profile VARCHAR(100) DEFAULT NULL,
  account_login_by VARCHAR(50) DEFAULT NULL,
  account_note TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_payment_ref (payment_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 5. WEBHOOK_LOGS TABLE (Idempotent QRIS Webhook Audit)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) DEFAULT 'QRIS_PAYMENT',
  payment_ref VARCHAR(100) NOT NULL,
  payload_json TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PROCESSED',
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhook_logs_ref (payment_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 6. ACTIVITY_LOGS TABLE (System Audit Trail)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) DEFAULT 'info',
  activity TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 7. NOTIFICATIONS TABLE (System & Expiration Alerts)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (username, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 8. SETTINGS TABLE (Store Metadata & Configuration)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- COMPLETE DATA SEEDS (11 PRODUCTS, 124 STOCKS, 6 USERS, SETTINGS)
-- =========================================================

-- 1. Default Users
INSERT IGNORE INTO users (id, username, password, name, role) VALUES
  ('usr-admin-1', 'admin', '123', 'Super Admin Babyiel', 'Admin'),
  ('usr-admin-2', 'admin2', '123', 'Admin Operasional', 'Admin'),
  ('usr-m1', 'member1', '123', 'Reseller Budi', 'Member'),
  ('usr-m2', 'member2', '123', 'Reseller Siti', 'Member'),
  ('usr-m3', 'member3', '123', 'Reseller Dewi', 'Member'),
  ('usr-m4', 'member4', '123', 'Reseller Ahmad', 'Member');

-- 2. Default Store Settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES
  ('store_title', 'Babyiel Store'),
  ('support_phone', '085775335453'),
  ('store_subtitle', 'Akun Digital Premium Terpercaya & Bergaransi'),
  ('ticker_text', 'PROMO SPESIAL HARI INI: PROSES CEPAT 1-5 MENIT • FULL GARANSI RESMI • READY AKUN PREMIUM POPULER DISKON RESELLER UP TO 50%'),
  ('qris_merchant_name', 'BABYIEL STORE OFFICIAL'),
  ('qris_merchant_id', 'ID1029384756');

-- 3. Insert All Products
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-netflix', 'Netflix Premium', 'fa-film', 'assets/icons/netflix.svg', '#ef4444', '1 Bulan', 'Full Garansi Resmi 30 Hari', '[{"label":"3 Hari","price":7000,"category":"💎 Sharing 1P1U"},{"label":"7 Hari","price":14000,"category":"💎 Sharing 1P1U"},{"label":"1 Bulan","price":35000,"category":"💎 Sharing 1P1U"},{"label":"3 Hari","price":6000,"category":"💎 Sharing 1P2U"},{"label":"7 Hari","price":10000,"category":"💎 Sharing 1P2U"},{"label":"1 Bulan","price":26000,"category":"💎 Sharing 1P2U"},{"label":"1 Bulan","price":165000,"category":"👑 Private"}]', '✨ NETFLIX PREMIUM 4K UHD SHARING ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ Sharing (1 Bulan Premium 4K UHD)
✔️ Private Profil & PIN kustom
✔️ Bebas streaming 4K Ultra HD

━━━━━━━━━━━━━━
📌 GARANSI
🛡️ Garansi full 30 hari anti-hold / logout
🛡️ Wajib simpan bukti pembelian

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-canva', 'Canva Pro', 'fa-palette', 'assets/icons/canva.svg', '#06b6d4', '1 Tahun', 'Full Garansi Resmi 365 Hari', '[{"label":"1 Bulan","price":10000,"category":"💎 Member"},{"label":"2 Bulan","price":15000,"category":"💎 Member"},{"label":"3 Bulan","price":20000,"category":"💎 Member"},{"label":"4 Bulan","price":22000,"category":"💎 Member"},{"label":"6 Bulan","price":25000,"category":"💎 Member"},{"label":"1 Tahun","price":27000,"category":"💎 Member"}]', '✨ CANVA PRO DESIGNER TEAM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-chatgpt', 'ChatGPT Plus', 'fa-robot', 'assets/icons/chatgpt.svg', '#10b981', '1 Bulan', 'Full Garansi GPT-4o', '[{"label":"1 Bulan","price":35000,"category":"💎 Sharing 1P"}]', '✨ CHATGPT PLUS GPT-4o ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-getcontact', 'Getcontact Premium', 'fa-address-book', 'assets/icons/getcontact.svg', '#3b82f6', '1 Bulan', 'Full Garansi Resmi 30 Hari', '[{"label":"1 Bulan","price":15000,"category":"💎 Member"}]', '✨ GETCONTACT PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-disney', 'Disney+ Hotstar', 'fa-tv', 'assets/icons/disney.svg', '#3b82f6', '1 Bulan', 'Full Garansi Premium Hotstar', '[{"label":"1 Bulan","price":25000,"category":"💎 Basic Plan"},{"label":"1 Bulan","price":45000,"category":"👑 Premium Plan"}]', '✨ DISNEY+ HOTSTAR PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-youtube', 'YouTube Premium', 'fa-youtube', 'assets/icons/youtube.svg', '#ff0000', '1 Bulan', 'Full Garansi No Ads & Music', '[{"label":"1 Bulan","price":12000,"category":"💎 Invite Family"},{"label":"3 Bulan","price":30000,"category":"💎 Invite Family"},{"label":"1 Bulan","price":25000,"category":"👑 Individual Plan"}]', '✨ YOUTUBE PREMIUM & MUSIC ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-alightmotion', 'Alight Motion Premium', 'fa-wand-magic-sparkles', 'assets/icons/alightmotion.svg', '#8b5cf6', '1 Tahun', 'Full Garansi Preset No Watermark', '[{"label":"1 Tahun","price":20000,"category":"💎 Member"}]', '✨ ALIGHT MOTION PRO PRESET ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-spotify', 'Spotify Premium', 'fa-music', 'assets/icons/spotify.svg', '#10b981', '1 Bulan', 'Full Garansi Music Without Ads', '[{"label":"1 Bulan","price":12000,"category":"👨‍👩‍👧 Family Plan"},{"label":"2 Bulan","price":18000,"category":"👨‍👩‍👧 Family Plan"},{"label":"3 Bulan","price":23000,"category":"👨‍👩‍👧 Family Plan"},{"label":"1 Bulan","price":20000,"category":"👤 Individual Plan"},{"label":"2 Bulan","price":30000,"category":"👤 Individual Plan"},{"label":"3 Bulan","price":40000,"category":"👤 Individual Plan"}]', '✨ SPOTIFY PREMIUM INDIVIDUAL / FAMILY ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-vidio', 'Vidio Platinum', 'fa-tv', 'assets/icons/vidio.svg', '#ec4899', '1 Bulan', 'Full Garansi Premier Platinum', '[{"label":"7 Hari","price":15000,"category":"👑 Private"},{"label":"1 Bulan","price":30000,"category":"👑 Private"},{"label":"1 Bulan","price":15000,"category":"💎 Sharing"}]', '✨ VIDIO PLATINUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-viu', 'Viu Premium', 'fa-film', 'assets/icons/viu.svg', '#eab308', '1 Bulan', 'Full Garansi Anti Backfree', '[{"label":"1 Bulan","price":10000,"category":"🛡️ Anti Backfree"},{"label":"2 Bulan","price":12000,"category":"🛡️ Anti Backfree"},{"label":"3 Bulan","price":15000,"category":"🛡️ Anti Backfree"},{"label":"1 Bulan","price":15000,"category":"🚀 Anti Limit"},{"label":"2 Bulan","price":18000,"category":"🚀 Anti Limit"},{"label":"3 Bulan","price":20000,"category":"🚀 Anti Limit"}]', '✨ VIU PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);
INSERT IGNORE INTO products (id, name, icon, image_url, color, duration, garansi, prices_json, template, is_active_catalog) VALUES ('prod-amazon', 'Amazon Prime Video', 'fa-brands fa-amazon', 'assets/icons/amazon.svg', '#f59e0b', '1 Bulan', 'Full Garansi Resmi 30 Hari', '[{"label":"1 Bulan","price":15000,"category":"💎 Sharing"},{"label":"1 Bulan","price":25000,"category":"👑 Private"}]', '✨ AMAZON PRIME VIDEO ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})', TRUE);

-- 4. Insert All 124 Stocks
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1001', 'prod-netflix', 'Netflix Premium', 'netflix.ready001@babyiel.com', 'pass100001', 'OTP WhatsApp', 'Profil 2', '1001', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1002', 'prod-canva', 'Canva Pro', 'canva.ready002@babyiel.com', 'pass100002', 'Email & Password', 'Profil 3', '1002', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1003', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready003@babyiel.com', 'pass100003', 'OTP WhatsApp', 'Profil 4', '1003', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1004', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready004@babyiel.com', 'pass100004', 'Email & Password', 'Profil 1', '1004', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1005', 'prod-disney', 'Disney+ Hotstar', 'disney.ready005@babyiel.com', 'pass100005', 'OTP WhatsApp', 'Profil 2', '1005', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1006', 'prod-youtube', 'YouTube Premium', 'youtube.ready006@babyiel.com', 'pass100006', 'Email & Password', 'Profil 3', '1006', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1007', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready007@babyiel.com', 'pass100007', 'OTP WhatsApp', 'Profil 4', '1007', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1008', 'prod-vidio', 'Vidio Platinum', 'vidio.ready008@babyiel.com', 'pass100008', 'Email & Password', 'Profil 1', '1008', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1009', 'prod-viu', 'Viu Premium', 'viu.ready009@babyiel.com', 'pass100009', 'OTP WhatsApp', 'Profil 2', '1009', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1010', 'prod-spotify', 'Spotify Premium', 'spotify.ready010@babyiel.com', 'pass100010', 'Email & Password', 'Profil 3', '1010', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1011', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready011@babyiel.com', 'pass100011', 'OTP WhatsApp', 'Profil 4', '1011', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1012', 'prod-netflix', 'Netflix Premium', 'netflix.ready012@babyiel.com', 'pass100012', 'Email & Password', 'Profil 1', '1012', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1013', 'prod-canva', 'Canva Pro', 'canva.ready013@babyiel.com', 'pass100013', 'OTP WhatsApp', 'Profil 2', '1013', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1014', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready014@babyiel.com', 'pass100014', 'Email & Password', 'Profil 3', '1014', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1015', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready015@babyiel.com', 'pass100015', 'OTP WhatsApp', 'Profil 4', '1015', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1016', 'prod-disney', 'Disney+ Hotstar', 'disney.ready016@babyiel.com', 'pass100016', 'Email & Password', 'Profil 1', '1016', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1017', 'prod-youtube', 'YouTube Premium', 'youtube.ready017@babyiel.com', 'pass100017', 'OTP WhatsApp', 'Profil 2', '1017', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1018', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready018@babyiel.com', 'pass100018', 'Email & Password', 'Profil 3', '1018', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1019', 'prod-vidio', 'Vidio Platinum', 'vidio.ready019@babyiel.com', 'pass100019', 'OTP WhatsApp', 'Profil 4', '1019', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1020', 'prod-viu', 'Viu Premium', 'viu.ready020@babyiel.com', 'pass100020', 'Email & Password', 'Profil 1', '1020', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1021', 'prod-spotify', 'Spotify Premium', 'spotify.ready021@babyiel.com', 'pass100021', 'OTP WhatsApp', 'Profil 2', '1021', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1022', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready022@babyiel.com', 'pass100022', 'Email & Password', 'Profil 3', '1022', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1023', 'prod-netflix', 'Netflix Premium', 'netflix.ready023@babyiel.com', 'pass100023', 'OTP WhatsApp', 'Profil 4', '1023', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1024', 'prod-canva', 'Canva Pro', 'canva.ready024@babyiel.com', 'pass100024', 'Email & Password', 'Profil 1', '1024', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1025', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready025@babyiel.com', 'pass100025', 'OTP WhatsApp', 'Profil 2', '1025', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1026', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready026@babyiel.com', 'pass100026', 'Email & Password', 'Profil 3', '1026', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1027', 'prod-disney', 'Disney+ Hotstar', 'disney.ready027@babyiel.com', 'pass100027', 'OTP WhatsApp', 'Profil 4', '1027', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1028', 'prod-youtube', 'YouTube Premium', 'youtube.ready028@babyiel.com', 'pass100028', 'Email & Password', 'Profil 1', '1028', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1029', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready029@babyiel.com', 'pass100029', 'OTP WhatsApp', 'Profil 2', '1029', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1030', 'prod-vidio', 'Vidio Platinum', 'vidio.ready030@babyiel.com', 'pass100030', 'Email & Password', 'Profil 3', '1030', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1031', 'prod-viu', 'Viu Premium', 'viu.ready031@babyiel.com', 'pass100031', 'OTP WhatsApp', 'Profil 4', '1031', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1032', 'prod-spotify', 'Spotify Premium', 'spotify.ready032@babyiel.com', 'pass100032', 'Email & Password', 'Profil 1', '1032', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1033', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready033@babyiel.com', 'pass100033', 'OTP WhatsApp', 'Profil 2', '1033', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1034', 'prod-netflix', 'Netflix Premium', 'netflix.ready034@babyiel.com', 'pass100034', 'Email & Password', 'Profil 3', '1034', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1035', 'prod-canva', 'Canva Pro', 'canva.ready035@babyiel.com', 'pass100035', 'OTP WhatsApp', 'Profil 4', '1035', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1036', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready036@babyiel.com', 'pass100036', 'Email & Password', 'Profil 1', '1036', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1037', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready037@babyiel.com', 'pass100037', 'OTP WhatsApp', 'Profil 2', '1037', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1038', 'prod-disney', 'Disney+ Hotstar', 'disney.ready038@babyiel.com', 'pass100038', 'Email & Password', 'Profil 3', '1038', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1039', 'prod-youtube', 'YouTube Premium', 'youtube.ready039@babyiel.com', 'pass100039', 'OTP WhatsApp', 'Profil 4', '1039', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1040', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready040@babyiel.com', 'pass100040', 'Email & Password', 'Profil 1', '1040', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1041', 'prod-vidio', 'Vidio Platinum', 'vidio.ready041@babyiel.com', 'pass100041', 'OTP WhatsApp', 'Profil 2', '1041', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1042', 'prod-viu', 'Viu Premium', 'viu.ready042@babyiel.com', 'pass100042', 'Email & Password', 'Profil 3', '1042', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1043', 'prod-spotify', 'Spotify Premium', 'spotify.ready043@babyiel.com', 'pass100043', 'OTP WhatsApp', 'Profil 4', '1043', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1044', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready044@babyiel.com', 'pass100044', 'Email & Password', 'Profil 1', '1044', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1045', 'prod-netflix', 'Netflix Premium', 'netflix.ready045@babyiel.com', 'pass100045', 'OTP WhatsApp', 'Profil 2', '1045', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1046', 'prod-canva', 'Canva Pro', 'canva.ready046@babyiel.com', 'pass100046', 'Email & Password', 'Profil 3', '1046', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1047', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready047@babyiel.com', 'pass100047', 'OTP WhatsApp', 'Profil 4', '1047', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1048', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready048@babyiel.com', 'pass100048', 'Email & Password', 'Profil 1', '1048', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1049', 'prod-disney', 'Disney+ Hotstar', 'disney.ready049@babyiel.com', 'pass100049', 'OTP WhatsApp', 'Profil 2', '1049', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1050', 'prod-youtube', 'YouTube Premium', 'youtube.ready050@babyiel.com', 'pass100050', 'Email & Password', 'Profil 3', '1050', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1051', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready051@babyiel.com', 'pass100051', 'OTP WhatsApp', 'Profil 4', '1051', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1052', 'prod-vidio', 'Vidio Platinum', 'vidio.ready052@babyiel.com', 'pass100052', 'Email & Password', 'Profil 1', '1052', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1053', 'prod-viu', 'Viu Premium', 'viu.ready053@babyiel.com', 'pass100053', 'OTP WhatsApp', 'Profil 2', '1053', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1054', 'prod-spotify', 'Spotify Premium', 'spotify.ready054@babyiel.com', 'pass100054', 'Email & Password', 'Profil 3', '1054', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1055', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready055@babyiel.com', 'pass100055', 'OTP WhatsApp', 'Profil 4', '1055', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1056', 'prod-netflix', 'Netflix Premium', 'netflix.ready056@babyiel.com', 'pass100056', 'Email & Password', 'Profil 1', '1056', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1057', 'prod-canva', 'Canva Pro', 'canva.ready057@babyiel.com', 'pass100057', 'OTP WhatsApp', 'Profil 2', '1057', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1058', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready058@babyiel.com', 'pass100058', 'Email & Password', 'Profil 3', '1058', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1059', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready059@babyiel.com', 'pass100059', 'OTP WhatsApp', 'Profil 4', '1059', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1060', 'prod-disney', 'Disney+ Hotstar', 'disney.ready060@babyiel.com', 'pass100060', 'Email & Password', 'Profil 1', '1060', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1061', 'prod-youtube', 'YouTube Premium', 'youtube.ready061@babyiel.com', 'pass100061', 'OTP WhatsApp', 'Profil 2', '1061', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1062', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready062@babyiel.com', 'pass100062', 'Email & Password', 'Profil 3', '1062', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1063', 'prod-vidio', 'Vidio Platinum', 'vidio.ready063@babyiel.com', 'pass100063', 'OTP WhatsApp', 'Profil 4', '1063', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1064', 'prod-viu', 'Viu Premium', 'viu.ready064@babyiel.com', 'pass100064', 'Email & Password', 'Profil 1', '1064', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1065', 'prod-spotify', 'Spotify Premium', 'spotify.ready065@babyiel.com', 'pass100065', 'OTP WhatsApp', 'Profil 2', '1065', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1066', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready066@babyiel.com', 'pass100066', 'Email & Password', 'Profil 3', '1066', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1067', 'prod-netflix', 'Netflix Premium', 'netflix.ready067@babyiel.com', 'pass100067', 'OTP WhatsApp', 'Profil 4', '1067', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1068', 'prod-canva', 'Canva Pro', 'canva.ready068@babyiel.com', 'pass100068', 'Email & Password', 'Profil 1', '1068', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1069', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready069@babyiel.com', 'pass100069', 'OTP WhatsApp', 'Profil 2', '1069', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1070', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready070@babyiel.com', 'pass100070', 'Email & Password', 'Profil 3', '1070', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1071', 'prod-disney', 'Disney+ Hotstar', 'disney.ready071@babyiel.com', 'pass100071', 'OTP WhatsApp', 'Profil 4', '1071', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1072', 'prod-youtube', 'YouTube Premium', 'youtube.ready072@babyiel.com', 'pass100072', 'Email & Password', 'Profil 1', '1072', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1073', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready073@babyiel.com', 'pass100073', 'OTP WhatsApp', 'Profil 2', '1073', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1074', 'prod-vidio', 'Vidio Platinum', 'vidio.ready074@babyiel.com', 'pass100074', 'Email & Password', 'Profil 3', '1074', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1075', 'prod-viu', 'Viu Premium', 'viu.ready075@babyiel.com', 'pass100075', 'OTP WhatsApp', 'Profil 4', '1075', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1076', 'prod-spotify', 'Spotify Premium', 'spotify.ready076@babyiel.com', 'pass100076', 'Email & Password', 'Profil 1', '1076', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1077', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready077@babyiel.com', 'pass100077', 'OTP WhatsApp', 'Profil 2', '1077', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1078', 'prod-netflix', 'Netflix Premium', 'netflix.ready078@babyiel.com', 'pass100078', 'Email & Password', 'Profil 3', '1078', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1079', 'prod-canva', 'Canva Pro', 'canva.ready079@babyiel.com', 'pass100079', 'OTP WhatsApp', 'Profil 4', '1079', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1080', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready080@babyiel.com', 'pass100080', 'Email & Password', 'Profil 1', '1080', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1081', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready081@babyiel.com', 'pass100081', 'OTP WhatsApp', 'Profil 2', '1081', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1082', 'prod-disney', 'Disney+ Hotstar', 'disney.ready082@babyiel.com', 'pass100082', 'Email & Password', 'Profil 3', '1082', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1083', 'prod-youtube', 'YouTube Premium', 'youtube.ready083@babyiel.com', 'pass100083', 'OTP WhatsApp', 'Profil 4', '1083', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1084', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready084@babyiel.com', 'pass100084', 'Email & Password', 'Profil 1', '1084', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1085', 'prod-vidio', 'Vidio Platinum', 'vidio.ready085@babyiel.com', 'pass100085', 'OTP WhatsApp', 'Profil 2', '1085', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1086', 'prod-viu', 'Viu Premium', 'viu.ready086@babyiel.com', 'pass100086', 'Email & Password', 'Profil 3', '1086', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1087', 'prod-spotify', 'Spotify Premium', 'spotify.ready087@babyiel.com', 'pass100087', 'OTP WhatsApp', 'Profil 4', '1087', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1088', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready088@babyiel.com', 'pass100088', 'Email & Password', 'Profil 1', '1088', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1089', 'prod-netflix', 'Netflix Premium', 'netflix.ready089@babyiel.com', 'pass100089', 'OTP WhatsApp', 'Profil 2', '1089', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1090', 'prod-canva', 'Canva Pro', 'canva.ready090@babyiel.com', 'pass100090', 'Email & Password', 'Profil 3', '1090', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1091', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.ready091@babyiel.com', 'pass100091', 'OTP WhatsApp', 'Profil 4', '1091', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1092', 'prod-getcontact', 'Getcontact Premium', 'getcontact.ready092@babyiel.com', 'pass100092', 'Email & Password', 'Profil 1', '1092', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1093', 'prod-disney', 'Disney+ Hotstar', 'disney.ready093@babyiel.com', 'pass100093', 'OTP WhatsApp', 'Profil 2', '1093', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1094', 'prod-youtube', 'YouTube Premium', 'youtube.ready094@babyiel.com', 'pass100094', 'Email & Password', 'Profil 3', '1094', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1095', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.ready095@babyiel.com', 'pass100095', 'OTP WhatsApp', 'Profil 4', '1095', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1096', 'prod-vidio', 'Vidio Platinum', 'vidio.ready096@babyiel.com', 'pass100096', 'Email & Password', 'Profil 1', '1096', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1097', 'prod-viu', 'Viu Premium', 'viu.ready097@babyiel.com', 'pass100097', 'OTP WhatsApp', 'Profil 2', '1097', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1098', 'prod-spotify', 'Spotify Premium', 'spotify.ready098@babyiel.com', 'pass100098', 'Email & Password', 'Profil 3', '1098', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1099', 'prod-amazon', 'Amazon Prime Video', 'amazon.ready099@babyiel.com', 'pass100099', 'OTP WhatsApp', 'Profil 4', '1099', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1100', 'prod-netflix', 'Netflix Premium', 'netflix.ready100@babyiel.com', 'pass100100', 'Email & Password', 'Profil 1', '1100', 'Garansi Resmi Full 100%', 'admin', NULL, NULL, NULL, 'READY', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1101', 'prod-netflix', 'Netflix Premium', 'netflix.assign01@babyiel.com', 'passassign1', 'Email & Password', 'Profil 2', '1121', 'Assigned ke Reseller @member1', 'member1', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1102', 'prod-canva', 'Canva Pro', 'canva.assign02@babyiel.com', 'passassign2', 'Email & Password', 'Profil 3', '1122', 'Assigned ke Reseller @member2', 'member2', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1103', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.assign03@babyiel.com', 'passassign3', 'Email & Password', 'Profil 4', '1123', 'Assigned ke Reseller @member3', 'member3', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1104', 'prod-getcontact', 'Getcontact Premium', 'getcontact.assign04@babyiel.com', 'passassign4', 'Email & Password', 'Profil 1', '1124', 'Assigned ke Reseller @member4', 'member4', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1105', 'prod-disney', 'Disney+ Hotstar', 'disney.assign05@babyiel.com', 'passassign5', 'Email & Password', 'Profil 2', '1125', 'Assigned ke Reseller @member1', 'member1', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1106', 'prod-youtube', 'YouTube Premium', 'youtube.assign06@babyiel.com', 'passassign6', 'Email & Password', 'Profil 3', '1126', 'Assigned ke Reseller @member2', 'member2', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1107', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.assign07@babyiel.com', 'passassign7', 'Email & Password', 'Profil 4', '1127', 'Assigned ke Reseller @member3', 'member3', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1108', 'prod-vidio', 'Vidio Platinum', 'vidio.assign08@babyiel.com', 'passassign8', 'Email & Password', 'Profil 1', '1128', 'Assigned ke Reseller @member4', 'member4', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1109', 'prod-viu', 'Viu Premium', 'viu.assign09@babyiel.com', 'passassign9', 'Email & Password', 'Profil 2', '1129', 'Assigned ke Reseller @member1', 'member1', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1110', 'prod-spotify', 'Spotify Premium', 'spotify.assign10@babyiel.com', 'passassign10', 'Email & Password', 'Profil 3', '11210', 'Assigned ke Reseller @member2', 'member2', NULL, NULL, NULL, 'ASSIGNED', NULL, NULL, NULL, '2026-08-06T10:47:22.611Z', '2026-08-06T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1111', 'prod-netflix', 'Netflix Premium', 'netflix.active01@babyiel.com', 'passactive1', 'Email & Password', 'Profil 1 (VIP)', '991', 'Terjual ke Andi Wijaya (081298765432)', 'member2', 'member2', 'Andi Wijaya', '081298765432', 'SEDANG BERLANGGANAN', '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z', '2026-09-03T10:47:22.611Z', '2026-08-05T10:47:22.611Z', '2026-08-05T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1112', 'prod-canva', 'Canva Pro', 'canva.active02@babyiel.com', 'passactive2', 'Email & Password', 'Profil 1 (VIP)', '992', 'Terjual ke Siti Rahma (085612345678)', 'admin', 'admin', 'Siti Rahma', '085612345678', 'SEDANG BERLANGGANAN', '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z', '2026-09-01T10:47:22.611Z', '2026-08-04T10:47:22.611Z', '2026-08-04T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1113', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.active03@babyiel.com', 'passactive3', 'Email & Password', 'Profil 1 (VIP)', '993', 'Terjual ke Rian Pratama (087811223344)', 'member4', 'member4', 'Rian Pratama', '087811223344', 'SEDANG BERLANGGANAN', '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z', '2026-08-30T10:47:22.611Z', '2026-08-03T10:47:22.611Z', '2026-08-03T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1114', 'prod-getcontact', 'Getcontact Premium', 'getcontact.active04@babyiel.com', 'passactive4', 'Email & Password', 'Profil 1 (VIP)', '994', 'Terjual ke Budi Santoso (081344556677)', 'admin', 'admin', 'Budi Santoso', '081344556677', 'SEDANG BERLANGGANAN', '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z', '2026-08-28T10:47:22.611Z', '2026-08-02T10:47:22.611Z', '2026-08-02T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1115', 'prod-disney', 'Disney+ Hotstar', 'disney.active05@babyiel.com', 'passactive5', 'Email & Password', 'Profil 1 (VIP)', '995', 'Terjual ke Dewi Lestari (089677889900)', 'member2', 'member2', 'Dewi Lestari', '089677889900', 'SEDANG BERLANGGANAN', '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z', '2026-08-26T10:47:22.611Z', '2026-08-01T10:47:22.611Z', '2026-08-01T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1116', 'prod-youtube', 'YouTube Premium', 'youtube.active06@babyiel.com', 'passactive6', 'Email & Password', 'Profil 1 (VIP)', '996', 'Terjual ke Eko Prasetyo (082199887766)', 'admin', 'admin', 'Eko Prasetyo', '082199887766', 'SEDANG BERLANGGANAN', '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z', '2026-08-24T10:47:22.611Z', '2026-07-31T10:47:22.611Z', '2026-07-31T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1117', 'prod-alightmotion', 'Alight Motion Premium', 'alightmotion.active07@babyiel.com', 'passactive7', 'Email & Password', 'Profil 1 (VIP)', '997', 'Terjual ke Fikri Haikal (083812344321)', 'member4', 'member4', 'Fikri Haikal', '083812344321', 'SEDANG BERLANGGANAN', '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z', '2026-08-22T10:47:22.611Z', '2026-07-30T10:47:22.611Z', '2026-07-30T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1118', 'prod-vidio', 'Vidio Platinum', 'vidio.active08@babyiel.com', 'passactive8', 'Email & Password', 'Profil 1 (VIP)', '998', 'Terjual ke Andi Wijaya (081298765432)', 'admin', 'admin', 'Andi Wijaya', '081298765432', 'SEDANG BERLANGGANAN', '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z', '2026-08-20T10:47:22.611Z', '2026-07-29T10:47:22.611Z', '2026-07-29T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1119', 'prod-viu', 'Viu Premium', 'viu.active09@babyiel.com', 'passactive9', 'Email & Password', 'Profil 1 (VIP)', '999', 'Terjual ke Siti Rahma (085612345678)', 'member2', 'member2', 'Siti Rahma', '085612345678', 'SEDANG BERLANGGANAN', '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z', '2026-08-18T10:47:22.611Z', '2026-07-28T10:47:22.611Z', '2026-07-28T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1120', 'prod-spotify', 'Spotify Premium', 'spotify.active10@babyiel.com', 'passactive10', 'Email & Password', 'Profil 1 (VIP)', '9910', 'Terjual ke Rian Pratama (087811223344)', 'admin', 'admin', 'Rian Pratama', '087811223344', 'SEDANG BERLANGGANAN', '2026-07-27T10:47:22.611Z', '2026-07-27T10:47:22.611Z', '2026-08-26T10:47:22.611Z', '2026-07-27T10:47:22.611Z', '2026-07-27T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1121', 'prod-amazon', 'Amazon Prime Video', 'amazon.active11@babyiel.com', 'passactive11', 'Email & Password', 'Profil 1 (VIP)', '9911', 'Terjual ke Budi Santoso (081344556677)', 'member4', 'member4', 'Budi Santoso', '081344556677', 'SEDANG BERLANGGANAN', '2026-07-26T10:47:22.611Z', '2026-07-26T10:47:22.611Z', '2026-08-24T10:47:22.611Z', '2026-07-26T10:47:22.611Z', '2026-07-26T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1122', 'prod-netflix', 'Netflix Premium', 'netflix.active12@babyiel.com', 'passactive12', 'Email & Password', 'Profil 1 (VIP)', '9912', 'Terjual ke Dewi Lestari (089677889900)', 'admin', 'admin', 'Dewi Lestari', '089677889900', 'SEDANG BERLANGGANAN', '2026-07-25T10:47:22.611Z', '2026-07-25T10:47:22.611Z', '2026-08-22T10:47:22.611Z', '2026-07-25T10:47:22.611Z', '2026-07-25T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1123', 'prod-canva', 'Canva Pro', 'canva.active13@babyiel.com', 'passactive13', 'Email & Password', 'Profil 1 (VIP)', '9913', 'Terjual ke Eko Prasetyo (082199887766)', 'member2', 'member2', 'Eko Prasetyo', '082199887766', 'SEDANG BERLANGGANAN', '2026-07-24T10:47:22.611Z', '2026-07-24T10:47:22.611Z', '2026-08-20T10:47:22.611Z', '2026-07-24T10:47:22.611Z', '2026-07-24T10:47:22.611Z');
INSERT IGNORE INTO stocks (id, product_id, product_name, email, password, login_by, profile, pin, note, assigned_to, sold_by, buyer_name, buyer_wa, status, purchased_at, activated_at, expires_at, created_at, updated_at) VALUES ('STK-1124', 'prod-chatgpt', 'ChatGPT Plus', 'chatgpt.active14@babyiel.com', 'passactive14', 'Email & Password', 'Profil 1 (VIP)', '9914', 'Terjual ke Fikri Haikal (083812344321)', 'admin', 'admin', 'Fikri Haikal', '083812344321', 'SEDANG BERLANGGANAN', '2026-07-23T10:47:22.611Z', '2026-07-23T10:47:22.611Z', '2026-08-18T10:47:22.611Z', '2026-07-23T10:47:22.611Z', '2026-07-23T10:47:22.611Z');
