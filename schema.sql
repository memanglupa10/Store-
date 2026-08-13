-- =========================================================
-- Babyiel Store - Enterprise Relational SQL Database Schema & Seed Data
-- Database Engine: MySQL / PostgreSQL / cPanel phpMyAdmin
-- Primary Keys & Foreign Keys Configured for Reporting & Analytics
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

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
  note TEXT,
  prices_json TEXT,
  template TEXT,
  is_active_catalog BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 3. STOCKS TABLE (Digital Account Inventory with Foreign Keys)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  package_name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  login_by VARCHAR(50) DEFAULT 'Email & Password',
  profile VARCHAR(100) DEFAULT 'Profil 1',
  pin VARCHAR(50) DEFAULT '-',
  notes TEXT,
  status VARCHAR(30) DEFAULT 'READY',
  assigned_to VARCHAR(100) DEFAULT 'admin',
  sold_by VARCHAR(100) DEFAULT NULL,
  buyer_name VARCHAR(100) DEFAULT NULL,
  buyer_wa VARCHAR(30) DEFAULT NULL,
  order_id VARCHAR(50) DEFAULT NULL,
  purchased_at TIMESTAMP NULL DEFAULT NULL,
  activated_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stocks_product_status (product_id, status),
  INDEX idx_stocks_status (status),
  CONSTRAINT fk_stocks_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 4. ORDERS TABLE (Automated QRIS Checkout & Transactions with Foreign Keys)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_wa VARCHAR(30) NOT NULL,
  customer_email VARCHAR(150) DEFAULT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  package_name VARCHAR(100) DEFAULT 'Standard',
  original_price INT DEFAULT 0,
  price INT NOT NULL,
  payment_status VARCHAR(30) DEFAULT 'PENDING',
  order_status VARCHAR(30) DEFAULT 'PENDING_PAYMENT',
  payment_reference VARCHAR(100) UNIQUE,
  payment_method VARCHAR(50) DEFAULT 'QRIS',
  qris_string TEXT,
  qris_url TEXT,
  qris_image_url TEXT,
  merchant_name VARCHAR(100) DEFAULT 'BABYIEL STORE',
  stock_id VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_orders_status (payment_status),
  INDEX idx_orders_ref (payment_reference),
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_stock FOREIGN KEY (stock_id) REFERENCES stocks (id) ON DELETE SET NULL
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
-- SEED DATA (PRODUCTS, STOCKS, USERS, SETTINGS)
-- =========================================================

-- 1. Default Users
INSERT IGNORE INTO users (id, username, password, name, role) VALUES
  ('usr-admin-1', 'admin', '123', 'Super Admin Babyiel', 'Admin'),
  ('usr-admin-2', 'admin2', '123', 'Admin Operasional', 'Admin'),
  ('usr-m1', 'member1', '123', 'Reseller Budi', 'Member'),
  ('usr-m2', 'member2', '123', 'Reseller Siti', 'Member'),
  ('usr-m3', 'member3', '123', 'Reseller Dewi', 'Member'),
  ('usr-m4', 'member4', '123', 'Reseller Ahmad', 'Member');

-- 2. Store Settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES
  ('store_title', 'Babyiel Store'),
  ('support_phone', '085775335453'),
  ('store_name', 'Babyiel Store'),
  ('admin_username', 'admin');

-- 3. Products
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-netflix', 'Netflix Premium', 'fa-film', 'assets/icons/netflix.svg', '#ef4444', '1 Hari - 1 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Hari (Sharing UL)","price":6000,"category":"⚡ Sharing UL"},{"label":"3 Hari (Sharing UL)","price":12000,"category":"⚡ Sharing UL"},{"label":"7 Hari (Sharing UL)","price":17000,"category":"⚡ Sharing UL"},{"label":"1 Hari (Sharing 1P1U)","price":6000,"category":"💎 Sharing 1P1U"},{"label":"7 Hari (Sharing 1P1U)","price":12000,"category":"💎 Sharing 1P1U"},{"label":"14 Hari (Sharing 1P1U)","price":18000,"category":"💎 Sharing 1P1U"},{"label":"1 Bulan (Sharing 1P1U)","price":40000,"category":"💎 Sharing 1P1U"},{"label":"1 Bulan PROMO (Sharing 1P1U)","price":55000,"category":"🔥 Promo"},{"label":"1 Hari (Sharing 1P2U)","price":5000,"category":"👥 Sharing 1P2U"},{"label":"7 Hari (Sharing 1P2U)","price":12000,"category":"👥 Sharing 1P2U"},{"label":"1 Bulan (Sharing 1P2U)","price":30000,"category":"👥 Sharing 1P2U"},{"label":"1 Bulan (Semi Private)","price":55000,"category":"👑 Semi Private"}]', '✨ NETFLIX PREMIUM 4K UHD ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-viu', 'VIU Premium', 'fa-play', 'assets/icons/viu.svg', '#f59e0b', '1 Bulan - 1 Tahun', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Private Basic)","price":10000,"category":"👑 Private Basic"},{"label":"2 Bulan (Private Basic)","price":20000,"category":"👑 Private Basic"},{"label":"1 Bulan (Anti Limit)","price":15000,"category":"🛡️ Anti Limit"},{"label":"2 Bulan (Anti Limit)","price":25000,"category":"🛡️ Anti Limit"},{"label":"6 Bulan (Anti Limit)","price":40000,"category":"🛡️ Anti Limit"},{"label":"1 Tahun (Anti Limit)","price":45000,"category":"🛡️ Anti Limit"}]', '✨ VIU PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-wetv', 'WeTV VIP', 'fa-circle-play', 'assets/icons/wetv.svg', '#f97316', '1 Bulan - 1 Tahun', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":15000,"category":"💎 Sharing"},{"label":"3 Bulan (Sharing)","price":26000,"category":"💎 Sharing"},{"label":"1 Tahun (Sharing)","price":42000,"category":"💎 Sharing"},{"label":"1 Bulan (Anti Limit)","price":25000,"category":"🛡️ Anti Limit"},{"label":"1 Bulan (Private)","price":38000,"category":"👑 Private"}]', '✨ WETV VIP ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-youtube', 'YouTube Premium', 'fa-play-circle', 'assets/icons/youtube.svg', '#ff0000', '1 Bulan - 3 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":24000,"category":"💎 Sharing"},{"label":"3 Bulan (Invite Family)","price":32000,"category":"📩 Invite Family"},{"label":"1 Bulan (Private Mobile)","price":27000,"category":"📱 Private Mobile"},{"label":"1 Bulan (Private All Device)","price":43000,"category":"💻 Private All Device"}]', '✨ YOUTUBE PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-iqiyi', 'iQIYI VIP', 'fa-tv', 'assets/icons/iqiyi.svg', '#10b981', '1 Bulan - 3 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing Standard)","price":15000,"category":"💎 Sharing Standard"},{"label":"3 Bulan (Sharing Standard)","price":25000,"category":"💎 Sharing Standard"}]', '✨ iQIYI VIP ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-canva', 'Canva Pro', 'fa-palette', 'assets/icons/canva.svg', '#06b6d4', '1 Bulan - 1 Tahun', '✅ Full Garansi Sesuai S&K', '✨ Designer +Rp2.000', '[{"label":"1 Bulan","price":10000,"category":"💎 Member"},{"label":"2 Bulan","price":14000,"category":"💎 Member"},{"label":"3 Bulan","price":17000,"category":"💎 Member"},{"label":"4 Bulan","price":20000,"category":"💎 Member"},{"label":"6 Bulan","price":25000,"category":"💎 Member"},{"label":"1 Tahun","price":35000,"category":"💎 Member"}]', '✨ CANVA PRO DESIGNER TEAM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-capcut', 'CapCut Pro', 'fa-scissors', 'assets/icons/capcut.svg', '#0f172a', '7 Hari', '✅ Full Garansi Sesuai S&K', '', '[{"label":"7 Hari (Standard)","price":20000,"category":"👑 Private"},{"label":"7 Hari (Pro)","price":25000,"category":"👑 Private"}]', '✨ CAPCUT PRO PRIVATE ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-picsart', 'Picsart Gold', 'fa-paint-brush', 'assets/icons/picsart.svg', '#ec4899', '1 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":15000,"category":"💎 Sharing"},{"label":"1 Bulan (Private)","price":25000,"category":"👑 Private"}]', '✨ PICSART GOLD ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-ibispaint', 'ibis Paint X Pro', 'fa-pen-nib', 'assets/icons/ibispaint.svg', '#3b82f6', '1 Tahun', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Tahun (Sharing)","price":35000,"category":"💎 Sharing"}]', '✨ IBIS PAINT X PRO ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-meitu', 'Meitu VIP', 'fa-wand-magic-sparkles', 'assets/icons/meitu.svg', '#f43f5e', '7 Hari', '✅ Full Garansi Sesuai S&K', '', '[{"label":"7 Hari","price":17000,"category":"👑 VIP"}]', '✨ MEITU VIP ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-alightmotion', 'Alight Motion Premium', 'fa-video', 'assets/icons/alightmotion.svg', '#10b981', '1 Bulan - 1 Tahun', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":12000,"category":"💎 Sharing"},{"label":"1 Tahun (Sharing)","price":25000,"category":"💎 Sharing"},{"label":"1 Bulan (Private)","price":30000,"category":"👑 Private"},{"label":"1 Tahun (Private)","price":45000,"category":"👑 Private"}]', '✨ ALIGHT MOTION PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-beautyplus', 'BeautyPlus Premium', 'fa-camera', 'assets/icons/beautyplus.svg', '#fb7185', '1 Tahun', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Tahun (Sharing)","price":35000,"category":"💎 Sharing"}]', '✨ BEAUTYPLUS PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-applemusic', 'Apple Music', 'fa-music', 'assets/icons/applemusic.svg', '#fa233b', '1 Bulan - 3 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan","price":23000,"category":"👑 Individual"},{"label":"2 Bulan","price":30000,"category":"👑 Individual"},{"label":"3 Bulan","price":40000,"category":"👑 Individual"}]', '✨ APPLE MUSIC PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-spotify', 'Spotify Premium', 'fa-spotify', 'assets/icons/spotify.svg', '#1db954', '1 Bulan - 2 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":25000,"category":"💎 Sharing"},{"label":"2 Bulan (Sharing)","price":40000,"category":"💎 Sharing"},{"label":"1 Bulan (Family)","price":29000,"category":"👨‍👩‍👧 Family Plan"}]', '✨ SPOTIFY PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-scribd', 'Scribd VIP', 'fa-book-open', 'assets/icons/scribd.svg', '#1e3a8a', '1 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":12000,"category":"💎 Sharing"},{"label":"1 Bulan (Private)","price":23000,"category":"👑 Private"}]', '✨ SCRIBD VIP PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-chatgpt', 'ChatGPT Plus & AI', 'fa-robot', 'assets/icons/chatgpt.svg', '#10b981', '1 Bulan', '✅ Full Garansi GPT-4o', '', '[{"label":"1 Bulan (Sharing)","price":38000,"category":"💎 Sharing"},{"label":"1 Bulan (Invite Email Pribadi)","price":45000,"category":"📩 Invite Email"}]', '✨ CHATGPT PLUS GPT-4o ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-ms365', 'Microsoft 365', 'fa-windows', 'assets/icons/ms365.svg', '#0284c7', '1 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (via Invite)","price":15000,"category":"📩 Invite"}]', '✨ MICROSOFT 365 INVITE ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-camscanner', 'CamScanner Premium', 'fa-file-contract', 'assets/icons/camscanner.svg', '#059669', '1 Tahun', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Tahun (Sharing)","price":25000,"category":"💎 Sharing"}]', '✨ CAMSCANNER PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-duolingo', 'Duolingo Super', 'fa-graduation-cap', 'assets/icons/duolingo.svg', '#58cc02', '1 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing)","price":17000,"category":"💎 Sharing"}]', '✨ DUOLINGO SUPER ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-gemini', 'Gemini Advanced AI', 'fa-brain', 'assets/icons/gemini.svg', '#8b5cf6', '1 Bulan - 3 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Sharing Invite)","price":20000,"category":"📩 Invite"},{"label":"3 Bulan (Sharing Invite)","price":32000,"category":"📩 Invite"}]', '✨ GEMINI ADVANCED AI ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);
INSERT INTO products (id, name, icon, image_url, color, duration, garansi, note, prices_json, template) VALUES ('prod-getcontact', 'Getcontact Premium', 'fa-address-book', 'assets/icons/getcontact.svg', '#3b82f6', '1 Bulan', '✅ Full Garansi Sesuai S&K', '', '[{"label":"1 Bulan (Private)","price":18000,"category":"👑 Private"},{"label":"1 Bulan (Semi Private)","price":10000,"category":"👑 Semi Private"},{"label":"Jasa Cek Nomor GTC (Per Nomor)","price":1000,"category":"⚡ Jasa Cek"}]', '✨ GETCONTACT PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})') ON DUPLICATE KEY UPDATE name=VALUES(name), prices_json=VALUES(prices_json), image_url=VALUES(image_url);

-- 4. Ready Stocks Inventory (128 Items)
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1harishari-01', 'prod-netflix', 'Netflix Premium', '1 Hari (Sharing UL)', 'netflix.1harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Hari (Sharing UL))', '1201', 'Stock Ready Paket 1 Hari (Sharing UL) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1harishari-02', 'prod-netflix', 'Netflix Premium', '1 Hari (Sharing UL)', 'netflix.1harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Hari (Sharing UL))', '1202', 'Stock Ready Paket 1 Hari (Sharing UL) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-3harishari-01', 'prod-netflix', 'Netflix Premium', '3 Hari (Sharing UL)', 'netflix.3harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Hari (Sharing UL))', '1201', 'Stock Ready Paket 3 Hari (Sharing UL) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-3harishari-02', 'prod-netflix', 'Netflix Premium', '3 Hari (Sharing UL)', 'netflix.3harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Hari (Sharing UL))', '1202', 'Stock Ready Paket 3 Hari (Sharing UL) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-7harishari-01', 'prod-netflix', 'Netflix Premium', '7 Hari (Sharing UL)', 'netflix.7harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (7 Hari (Sharing UL))', '1201', 'Stock Ready Paket 7 Hari (Sharing UL) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-7harishari-02', 'prod-netflix', 'Netflix Premium', '7 Hari (Sharing UL)', 'netflix.7harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (7 Hari (Sharing UL))', '1202', 'Stock Ready Paket 7 Hari (Sharing UL) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1harishari-01', 'prod-netflix', 'Netflix Premium', '1 Hari (Sharing 1P1U)', 'netflix.1harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Hari (Sharing 1P1U))', '1201', 'Stock Ready Paket 1 Hari (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1harishari-02', 'prod-netflix', 'Netflix Premium', '1 Hari (Sharing 1P1U)', 'netflix.1harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Hari (Sharing 1P1U))', '1202', 'Stock Ready Paket 1 Hari (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-7harishari-01', 'prod-netflix', 'Netflix Premium', '7 Hari (Sharing 1P1U)', 'netflix.7harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (7 Hari (Sharing 1P1U))', '1201', 'Stock Ready Paket 7 Hari (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-7harishari-02', 'prod-netflix', 'Netflix Premium', '7 Hari (Sharing 1P1U)', 'netflix.7harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (7 Hari (Sharing 1P1U))', '1202', 'Stock Ready Paket 7 Hari (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-14harishar-01', 'prod-netflix', 'Netflix Premium', '14 Hari (Sharing 1P1U)', 'netflix.14harishar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (14 Hari (Sharing 1P1U))', '1201', 'Stock Ready Paket 14 Hari (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-14harishar-02', 'prod-netflix', 'Netflix Premium', '14 Hari (Sharing 1P1U)', 'netflix.14harishar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (14 Hari (Sharing 1P1U))', '1202', 'Stock Ready Paket 14 Hari (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulanshar-01', 'prod-netflix', 'Netflix Premium', '1 Bulan (Sharing 1P1U)', 'netflix.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing 1P1U))', '1201', 'Stock Ready Paket 1 Bulan (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulanshar-02', 'prod-netflix', 'Netflix Premium', '1 Bulan (Sharing 1P1U)', 'netflix.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing 1P1U))', '1202', 'Stock Ready Paket 1 Bulan (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulanprom-01', 'prod-netflix', 'Netflix Premium', '1 Bulan PROMO (Sharing 1P1U)', 'netflix.1bulanprom01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan PROMO (Sharing 1P1U))', '1201', 'Stock Ready Paket 1 Bulan PROMO (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulanprom-02', 'prod-netflix', 'Netflix Premium', '1 Bulan PROMO (Sharing 1P1U)', 'netflix.1bulanprom02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan PROMO (Sharing 1P1U))', '1202', 'Stock Ready Paket 1 Bulan PROMO (Sharing 1P1U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1harishari-01', 'prod-netflix', 'Netflix Premium', '1 Hari (Sharing 1P2U)', 'netflix.1harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Hari (Sharing 1P2U))', '1201', 'Stock Ready Paket 1 Hari (Sharing 1P2U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1harishari-02', 'prod-netflix', 'Netflix Premium', '1 Hari (Sharing 1P2U)', 'netflix.1harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Hari (Sharing 1P2U))', '1202', 'Stock Ready Paket 1 Hari (Sharing 1P2U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-7harishari-01', 'prod-netflix', 'Netflix Premium', '7 Hari (Sharing 1P2U)', 'netflix.7harishari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (7 Hari (Sharing 1P2U))', '1201', 'Stock Ready Paket 7 Hari (Sharing 1P2U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-7harishari-02', 'prod-netflix', 'Netflix Premium', '7 Hari (Sharing 1P2U)', 'netflix.7harishari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (7 Hari (Sharing 1P2U))', '1202', 'Stock Ready Paket 7 Hari (Sharing 1P2U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulanshar-01', 'prod-netflix', 'Netflix Premium', '1 Bulan (Sharing 1P2U)', 'netflix.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing 1P2U))', '1201', 'Stock Ready Paket 1 Bulan (Sharing 1P2U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulanshar-02', 'prod-netflix', 'Netflix Premium', '1 Bulan (Sharing 1P2U)', 'netflix.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing 1P2U))', '1202', 'Stock Ready Paket 1 Bulan (Sharing 1P2U) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulansemi-01', 'prod-netflix', 'Netflix Premium', '1 Bulan (Semi Private)', 'netflix.1bulansemi01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Semi Private))', '1201', 'Stock Ready Paket 1 Bulan (Semi Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-netflix-1bulansemi-02', 'prod-netflix', 'Netflix Premium', '1 Bulan (Semi Private)', 'netflix.1bulansemi02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Semi Private))', '1202', 'Stock Ready Paket 1 Bulan (Semi Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-1bulanpriv-01', 'prod-viu', 'VIU Premium', '1 Bulan (Private Basic)', 'viu.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private Basic))', '1201', 'Stock Ready Paket 1 Bulan (Private Basic) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-1bulanpriv-02', 'prod-viu', 'VIU Premium', '1 Bulan (Private Basic)', 'viu.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private Basic))', '1202', 'Stock Ready Paket 1 Bulan (Private Basic) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-2bulanpriv-01', 'prod-viu', 'VIU Premium', '2 Bulan (Private Basic)', 'viu.2bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (2 Bulan (Private Basic))', '1201', 'Stock Ready Paket 2 Bulan (Private Basic) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-2bulanpriv-02', 'prod-viu', 'VIU Premium', '2 Bulan (Private Basic)', 'viu.2bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (2 Bulan (Private Basic))', '1202', 'Stock Ready Paket 2 Bulan (Private Basic) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-1bulananti-01', 'prod-viu', 'VIU Premium', '1 Bulan (Anti Limit)', 'viu.1bulananti01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Anti Limit))', '1201', 'Stock Ready Paket 1 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-1bulananti-02', 'prod-viu', 'VIU Premium', '1 Bulan (Anti Limit)', 'viu.1bulananti02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Anti Limit))', '1202', 'Stock Ready Paket 1 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-2bulananti-01', 'prod-viu', 'VIU Premium', '2 Bulan (Anti Limit)', 'viu.2bulananti01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (2 Bulan (Anti Limit))', '1201', 'Stock Ready Paket 2 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-2bulananti-02', 'prod-viu', 'VIU Premium', '2 Bulan (Anti Limit)', 'viu.2bulananti02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (2 Bulan (Anti Limit))', '1202', 'Stock Ready Paket 2 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-6bulananti-01', 'prod-viu', 'VIU Premium', '6 Bulan (Anti Limit)', 'viu.6bulananti01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (6 Bulan (Anti Limit))', '1201', 'Stock Ready Paket 6 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-6bulananti-02', 'prod-viu', 'VIU Premium', '6 Bulan (Anti Limit)', 'viu.6bulananti02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (6 Bulan (Anti Limit))', '1202', 'Stock Ready Paket 6 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-1tahunanti-01', 'prod-viu', 'VIU Premium', '1 Tahun (Anti Limit)', 'viu.1tahunanti01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Anti Limit))', '1201', 'Stock Ready Paket 1 Tahun (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-viu-1tahunanti-02', 'prod-viu', 'VIU Premium', '1 Tahun (Anti Limit)', 'viu.1tahunanti02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Anti Limit))', '1202', 'Stock Ready Paket 1 Tahun (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1bulanshar-01', 'prod-wetv', 'WeTV VIP', '1 Bulan (Sharing)', 'wetv.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1bulanshar-02', 'prod-wetv', 'WeTV VIP', '1 Bulan (Sharing)', 'wetv.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-3bulanshar-01', 'prod-wetv', 'WeTV VIP', '3 Bulan (Sharing)', 'wetv.3bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Bulan (Sharing))', '1201', 'Stock Ready Paket 3 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-3bulanshar-02', 'prod-wetv', 'WeTV VIP', '3 Bulan (Sharing)', 'wetv.3bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Bulan (Sharing))', '1202', 'Stock Ready Paket 3 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1tahunshar-01', 'prod-wetv', 'WeTV VIP', '1 Tahun (Sharing)', 'wetv.1tahunshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Sharing))', '1201', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1tahunshar-02', 'prod-wetv', 'WeTV VIP', '1 Tahun (Sharing)', 'wetv.1tahunshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Sharing))', '1202', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1bulananti-01', 'prod-wetv', 'WeTV VIP', '1 Bulan (Anti Limit)', 'wetv.1bulananti01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Anti Limit))', '1201', 'Stock Ready Paket 1 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1bulananti-02', 'prod-wetv', 'WeTV VIP', '1 Bulan (Anti Limit)', 'wetv.1bulananti02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Anti Limit))', '1202', 'Stock Ready Paket 1 Bulan (Anti Limit) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1bulanpriv-01', 'prod-wetv', 'WeTV VIP', '1 Bulan (Private)', 'wetv.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private))', '1201', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-wetv-1bulanpriv-02', 'prod-wetv', 'WeTV VIP', '1 Bulan (Private)', 'wetv.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private))', '1202', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-1bulanshar-01', 'prod-youtube', 'YouTube Premium', '1 Bulan (Sharing)', 'youtube.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-1bulanshar-02', 'prod-youtube', 'YouTube Premium', '1 Bulan (Sharing)', 'youtube.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-3bulaninvi-01', 'prod-youtube', 'YouTube Premium', '3 Bulan (Invite Family)', 'youtube.3bulaninvi01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Bulan (Invite Family))', '1201', 'Stock Ready Paket 3 Bulan (Invite Family) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-3bulaninvi-02', 'prod-youtube', 'YouTube Premium', '3 Bulan (Invite Family)', 'youtube.3bulaninvi02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Bulan (Invite Family))', '1202', 'Stock Ready Paket 3 Bulan (Invite Family) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-1bulanpriv-01', 'prod-youtube', 'YouTube Premium', '1 Bulan (Private Mobile)', 'youtube.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private Mobile))', '1201', 'Stock Ready Paket 1 Bulan (Private Mobile) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-1bulanpriv-02', 'prod-youtube', 'YouTube Premium', '1 Bulan (Private Mobile)', 'youtube.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private Mobile))', '1202', 'Stock Ready Paket 1 Bulan (Private Mobile) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-1bulanpriv-01', 'prod-youtube', 'YouTube Premium', '1 Bulan (Private All Device)', 'youtube.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private All Device))', '1201', 'Stock Ready Paket 1 Bulan (Private All Device) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-youtube-1bulanpriv-02', 'prod-youtube', 'YouTube Premium', '1 Bulan (Private All Device)', 'youtube.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private All Device))', '1202', 'Stock Ready Paket 1 Bulan (Private All Device) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-iqiyi-1bulanshar-01', 'prod-iqiyi', 'iQIYI VIP', '1 Bulan (Sharing Standard)', 'iqiyi.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing Standard))', '1201', 'Stock Ready Paket 1 Bulan (Sharing Standard) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-iqiyi-1bulanshar-02', 'prod-iqiyi', 'iQIYI VIP', '1 Bulan (Sharing Standard)', 'iqiyi.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing Standard))', '1202', 'Stock Ready Paket 1 Bulan (Sharing Standard) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-iqiyi-3bulanshar-01', 'prod-iqiyi', 'iQIYI VIP', '3 Bulan (Sharing Standard)', 'iqiyi.3bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Bulan (Sharing Standard))', '1201', 'Stock Ready Paket 3 Bulan (Sharing Standard) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-iqiyi-3bulanshar-02', 'prod-iqiyi', 'iQIYI VIP', '3 Bulan (Sharing Standard)', 'iqiyi.3bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Bulan (Sharing Standard))', '1202', 'Stock Ready Paket 3 Bulan (Sharing Standard) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-1bulan-01', 'prod-canva', 'Canva Pro', '1 Bulan', 'canva.1bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan)', '1201', 'Stock Ready Paket 1 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-1bulan-02', 'prod-canva', 'Canva Pro', '1 Bulan', 'canva.1bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan)', '1202', 'Stock Ready Paket 1 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-2bulan-01', 'prod-canva', 'Canva Pro', '2 Bulan', 'canva.2bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (2 Bulan)', '1201', 'Stock Ready Paket 2 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-2bulan-02', 'prod-canva', 'Canva Pro', '2 Bulan', 'canva.2bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (2 Bulan)', '1202', 'Stock Ready Paket 2 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-3bulan-01', 'prod-canva', 'Canva Pro', '3 Bulan', 'canva.3bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Bulan)', '1201', 'Stock Ready Paket 3 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-3bulan-02', 'prod-canva', 'Canva Pro', '3 Bulan', 'canva.3bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Bulan)', '1202', 'Stock Ready Paket 3 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-4bulan-01', 'prod-canva', 'Canva Pro', '4 Bulan', 'canva.4bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (4 Bulan)', '1201', 'Stock Ready Paket 4 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-4bulan-02', 'prod-canva', 'Canva Pro', '4 Bulan', 'canva.4bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (4 Bulan)', '1202', 'Stock Ready Paket 4 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-6bulan-01', 'prod-canva', 'Canva Pro', '6 Bulan', 'canva.6bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (6 Bulan)', '1201', 'Stock Ready Paket 6 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-6bulan-02', 'prod-canva', 'Canva Pro', '6 Bulan', 'canva.6bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (6 Bulan)', '1202', 'Stock Ready Paket 6 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-1tahun-01', 'prod-canva', 'Canva Pro', '1 Tahun', 'canva.1tahun01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun)', '1201', 'Stock Ready Paket 1 Tahun - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-canva-1tahun-02', 'prod-canva', 'Canva Pro', '1 Tahun', 'canva.1tahun02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun)', '1202', 'Stock Ready Paket 1 Tahun - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-capcut-7haristand-01', 'prod-capcut', 'CapCut Pro', '7 Hari (Standard)', 'capcut.7haristand01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (7 Hari (Standard))', '1201', 'Stock Ready Paket 7 Hari (Standard) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-capcut-7haristand-02', 'prod-capcut', 'CapCut Pro', '7 Hari (Standard)', 'capcut.7haristand02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (7 Hari (Standard))', '1202', 'Stock Ready Paket 7 Hari (Standard) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-capcut-7haripro-01', 'prod-capcut', 'CapCut Pro', '7 Hari (Pro)', 'capcut.7haripro01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (7 Hari (Pro))', '1201', 'Stock Ready Paket 7 Hari (Pro) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-capcut-7haripro-02', 'prod-capcut', 'CapCut Pro', '7 Hari (Pro)', 'capcut.7haripro02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (7 Hari (Pro))', '1202', 'Stock Ready Paket 7 Hari (Pro) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-picsart-1bulanshar-01', 'prod-picsart', 'Picsart Gold', '1 Bulan (Sharing)', 'picsart.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-picsart-1bulanshar-02', 'prod-picsart', 'Picsart Gold', '1 Bulan (Sharing)', 'picsart.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-picsart-1bulanpriv-01', 'prod-picsart', 'Picsart Gold', '1 Bulan (Private)', 'picsart.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private))', '1201', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-picsart-1bulanpriv-02', 'prod-picsart', 'Picsart Gold', '1 Bulan (Private)', 'picsart.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private))', '1202', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-ibispaint-1tahunshar-01', 'prod-ibispaint', 'ibis Paint X Pro', '1 Tahun (Sharing)', 'ibispaint.1tahunshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Sharing))', '1201', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-ibispaint-1tahunshar-02', 'prod-ibispaint', 'ibis Paint X Pro', '1 Tahun (Sharing)', 'ibispaint.1tahunshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Sharing))', '1202', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-meitu-7hari-01', 'prod-meitu', 'Meitu VIP', '7 Hari', 'meitu.7hari01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (7 Hari)', '1201', 'Stock Ready Paket 7 Hari - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-meitu-7hari-02', 'prod-meitu', 'Meitu VIP', '7 Hari', 'meitu.7hari02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (7 Hari)', '1202', 'Stock Ready Paket 7 Hari - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1bulanshar-01', 'prod-alightmotion', 'Alight Motion Premium', '1 Bulan (Sharing)', 'alight.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1bulanshar-02', 'prod-alightmotion', 'Alight Motion Premium', '1 Bulan (Sharing)', 'alight.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1tahunshar-01', 'prod-alightmotion', 'Alight Motion Premium', '1 Tahun (Sharing)', 'alight.1tahunshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Sharing))', '1201', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1tahunshar-02', 'prod-alightmotion', 'Alight Motion Premium', '1 Tahun (Sharing)', 'alight.1tahunshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Sharing))', '1202', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1bulanpriv-01', 'prod-alightmotion', 'Alight Motion Premium', '1 Bulan (Private)', 'alight.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private))', '1201', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1bulanpriv-02', 'prod-alightmotion', 'Alight Motion Premium', '1 Bulan (Private)', 'alight.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private))', '1202', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1tahunpriv-01', 'prod-alightmotion', 'Alight Motion Premium', '1 Tahun (Private)', 'alight.1tahunpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Private))', '1201', 'Stock Ready Paket 1 Tahun (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-alight-1tahunpriv-02', 'prod-alightmotion', 'Alight Motion Premium', '1 Tahun (Private)', 'alight.1tahunpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Private))', '1202', 'Stock Ready Paket 1 Tahun (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-beautyplus-1tahunshar-01', 'prod-beautyplus', 'BeautyPlus Premium', '1 Tahun (Sharing)', 'beautyplus.1tahunshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Sharing))', '1201', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-beautyplus-1tahunshar-02', 'prod-beautyplus', 'BeautyPlus Premium', '1 Tahun (Sharing)', 'beautyplus.1tahunshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Sharing))', '1202', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-applemusic-1bulan-01', 'prod-applemusic', 'Apple Music', '1 Bulan', 'applemusic.1bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan)', '1201', 'Stock Ready Paket 1 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-applemusic-1bulan-02', 'prod-applemusic', 'Apple Music', '1 Bulan', 'applemusic.1bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan)', '1202', 'Stock Ready Paket 1 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-applemusic-2bulan-01', 'prod-applemusic', 'Apple Music', '2 Bulan', 'applemusic.2bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (2 Bulan)', '1201', 'Stock Ready Paket 2 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-applemusic-2bulan-02', 'prod-applemusic', 'Apple Music', '2 Bulan', 'applemusic.2bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (2 Bulan)', '1202', 'Stock Ready Paket 2 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-applemusic-3bulan-01', 'prod-applemusic', 'Apple Music', '3 Bulan', 'applemusic.3bulan01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Bulan)', '1201', 'Stock Ready Paket 3 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-applemusic-3bulan-02', 'prod-applemusic', 'Apple Music', '3 Bulan', 'applemusic.3bulan02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Bulan)', '1202', 'Stock Ready Paket 3 Bulan - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-spotify-1bulanshar-01', 'prod-spotify', 'Spotify Premium', '1 Bulan (Sharing)', 'spotify.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-spotify-1bulanshar-02', 'prod-spotify', 'Spotify Premium', '1 Bulan (Sharing)', 'spotify.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-spotify-2bulanshar-01', 'prod-spotify', 'Spotify Premium', '2 Bulan (Sharing)', 'spotify.2bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (2 Bulan (Sharing))', '1201', 'Stock Ready Paket 2 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-spotify-2bulanshar-02', 'prod-spotify', 'Spotify Premium', '2 Bulan (Sharing)', 'spotify.2bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (2 Bulan (Sharing))', '1202', 'Stock Ready Paket 2 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-spotify-1bulanfami-01', 'prod-spotify', 'Spotify Premium', '1 Bulan (Family)', 'spotify.1bulanfami01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Family))', '1201', 'Stock Ready Paket 1 Bulan (Family) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-spotify-1bulanfami-02', 'prod-spotify', 'Spotify Premium', '1 Bulan (Family)', 'spotify.1bulanfami02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Family))', '1202', 'Stock Ready Paket 1 Bulan (Family) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-scribd-1bulanshar-01', 'prod-scribd', 'Scribd VIP', '1 Bulan (Sharing)', 'scribd.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-scribd-1bulanshar-02', 'prod-scribd', 'Scribd VIP', '1 Bulan (Sharing)', 'scribd.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-scribd-1bulanpriv-01', 'prod-scribd', 'Scribd VIP', '1 Bulan (Private)', 'scribd.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private))', '1201', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-scribd-1bulanpriv-02', 'prod-scribd', 'Scribd VIP', '1 Bulan (Private)', 'scribd.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private))', '1202', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-chatgpt-1bulanshar-01', 'prod-chatgpt', 'ChatGPT Plus & AI', '1 Bulan (Sharing)', 'chatgpt.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-chatgpt-1bulanshar-02', 'prod-chatgpt', 'ChatGPT Plus & AI', '1 Bulan (Sharing)', 'chatgpt.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-chatgpt-1bulaninvi-01', 'prod-chatgpt', 'ChatGPT Plus & AI', '1 Bulan (Invite Email Pribadi)', 'chatgpt.1bulaninvi01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Invite Email Pribadi))', '1201', 'Stock Ready Paket 1 Bulan (Invite Email Pribadi) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-chatgpt-1bulaninvi-02', 'prod-chatgpt', 'ChatGPT Plus & AI', '1 Bulan (Invite Email Pribadi)', 'chatgpt.1bulaninvi02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Invite Email Pribadi))', '1202', 'Stock Ready Paket 1 Bulan (Invite Email Pribadi) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-ms365-1bulanviai-01', 'prod-ms365', 'Microsoft 365', '1 Bulan (via Invite)', 'ms365.1bulanviai01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (via Invite))', '1201', 'Stock Ready Paket 1 Bulan (via Invite) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-ms365-1bulanviai-02', 'prod-ms365', 'Microsoft 365', '1 Bulan (via Invite)', 'ms365.1bulanviai02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (via Invite))', '1202', 'Stock Ready Paket 1 Bulan (via Invite) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-camscanner-1tahunshar-01', 'prod-camscanner', 'CamScanner Premium', '1 Tahun (Sharing)', 'camscanner.1tahunshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Tahun (Sharing))', '1201', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-camscanner-1tahunshar-02', 'prod-camscanner', 'CamScanner Premium', '1 Tahun (Sharing)', 'camscanner.1tahunshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Tahun (Sharing))', '1202', 'Stock Ready Paket 1 Tahun (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-duolingo-1bulanshar-01', 'prod-duolingo', 'Duolingo Super', '1 Bulan (Sharing)', 'duolingo.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing))', '1201', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-duolingo-1bulanshar-02', 'prod-duolingo', 'Duolingo Super', '1 Bulan (Sharing)', 'duolingo.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing))', '1202', 'Stock Ready Paket 1 Bulan (Sharing) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-gemini-1bulanshar-01', 'prod-gemini', 'Gemini Advanced AI', '1 Bulan (Sharing Invite)', 'gemini.1bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Sharing Invite))', '1201', 'Stock Ready Paket 1 Bulan (Sharing Invite) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-gemini-1bulanshar-02', 'prod-gemini', 'Gemini Advanced AI', '1 Bulan (Sharing Invite)', 'gemini.1bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Sharing Invite))', '1202', 'Stock Ready Paket 1 Bulan (Sharing Invite) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-gemini-3bulanshar-01', 'prod-gemini', 'Gemini Advanced AI', '3 Bulan (Sharing Invite)', 'gemini.3bulanshar01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (3 Bulan (Sharing Invite))', '1201', 'Stock Ready Paket 3 Bulan (Sharing Invite) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-gemini-3bulanshar-02', 'prod-gemini', 'Gemini Advanced AI', '3 Bulan (Sharing Invite)', 'gemini.3bulanshar02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (3 Bulan (Sharing Invite))', '1202', 'Stock Ready Paket 3 Bulan (Sharing Invite) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-getcontact-1bulanpriv-01', 'prod-getcontact', 'Getcontact Premium', '1 Bulan (Private)', 'getcontact.1bulanpriv01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Private))', '1201', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-getcontact-1bulanpriv-02', 'prod-getcontact', 'Getcontact Premium', '1 Bulan (Private)', 'getcontact.1bulanpriv02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Private))', '1202', 'Stock Ready Paket 1 Bulan (Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-getcontact-1bulansemi-01', 'prod-getcontact', 'Getcontact Premium', '1 Bulan (Semi Private)', 'getcontact.1bulansemi01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (1 Bulan (Semi Private))', '1201', 'Stock Ready Paket 1 Bulan (Semi Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-getcontact-1bulansemi-02', 'prod-getcontact', 'Getcontact Premium', '1 Bulan (Semi Private)', 'getcontact.1bulansemi02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (1 Bulan (Semi Private))', '1202', 'Stock Ready Paket 1 Bulan (Semi Private) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-getcontact-jasaceknom-01', 'prod-getcontact', 'Getcontact Premium', 'Jasa Cek Nomor GTC (Per Nomor)', 'getcontact.jasaceknom01@babyiel.com', 'BabyielPass01!', 'Email & Password', 'Profil 1 (Jasa Cek Nomor GTC (Per Nomor))', '1201', 'Stock Ready Paket Jasa Cek Nomor GTC (Per Nomor) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO stocks (id, product_id, product_name, package_name, email, password, login_by, profile, pin, notes, status, assigned_to) VALUES ('stk-getcontact-jasaceknom-02', 'prod-getcontact', 'Getcontact Premium', 'Jasa Cek Nomor GTC (Per Nomor)', 'getcontact.jasaceknom02@babyiel.com', 'BabyielPass02!', 'Email & Password', 'Profil 2 (Jasa Cek Nomor GTC (Per Nomor))', '1202', 'Stock Ready Paket Jasa Cek Nomor GTC (Per Nomor) - Full Garansi', 'READY', 'admin') ON DUPLICATE KEY UPDATE status=VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;
