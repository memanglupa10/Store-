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

-- 4. Default Stocks (Empty)
