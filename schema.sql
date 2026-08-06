-- =========================================================
-- Babyiel Store - Enterprise Inventory & QRIS Database Schema
-- Compatible with PostgreSQL (Supabase Cloud) & MySQL
-- =========================================================

-- ---------------------------------------------------------
-- 1. USERS TABLE (Authentication & Role Access)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'Member', -- 'Admin' or 'Member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. PRODUCTS TABLE (Catalog Products & Price Tiers)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'fa-box',
  image_url TEXT DEFAULT '',
  color VARCHAR(20) DEFAULT '#A76CF5',
  duration VARCHAR(50) DEFAULT '1 Bulan',
  garansi VARCHAR(100) DEFAULT '✅ Full Garansi Resmi 30 Hari',
  prices_json TEXT,
  template TEXT,
  is_active_catalog BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  status VARCHAR(30) DEFAULT 'AVAILABLE', -- 'AVAILABLE' (READY), 'SOLD', 'RESERVED', 'SEDANG BERLANGGANAN'
  assigned_to VARCHAR(100) DEFAULT NULL,
  buyer_name VARCHAR(100) DEFAULT NULL,
  buyer_wa VARCHAR(30) DEFAULT NULL,
  purchased_at TIMESTAMP NULL DEFAULT NULL,
  activated_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stocks_product_status ON stocks (product_id, status);
CREATE INDEX IF NOT EXISTS idx_stocks_status ON stocks (status);

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
  status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED'
  allocated_stock_id VARCHAR(50) DEFAULT NULL,
  account_email VARCHAR(150) DEFAULT NULL,
  account_password VARCHAR(255) DEFAULT NULL,
  account_pin VARCHAR(50) DEFAULT NULL,
  account_profile VARCHAR(100) DEFAULT NULL,
  account_login_by VARCHAR(50) DEFAULT NULL,
  account_note TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_ref ON orders (payment_ref);

-- ---------------------------------------------------------
-- 5. WEBHOOK_LOGS TABLE (Idempotent QRIS Webhook Audit)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) DEFAULT 'QRIS_PAYMENT',
  payment_ref VARCHAR(100) NOT NULL,
  payload_json TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PROCESSED',
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_ref ON webhook_logs (payment_ref);

-- ---------------------------------------------------------
-- 6. ACTIVITY_LOGS TABLE (System Audit Trail)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) DEFAULT 'info',
  activity TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 7. SETTINGS TABLE (Store Metadata & Configuration)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

-- =========================================================
-- INITIAL SEED DATA
-- =========================================================

-- Default Users
INSERT INTO users (id, username, password, name, role) VALUES
  ('usr-admin-1', 'admin', '123', 'Super Admin Babyiel', 'Admin'),
  ('usr-member-1', 'member1', '123', 'Budi Santoso', 'Member')
ON CONFLICT (id) DO NOTHING;

-- Default Store Settings
INSERT INTO settings (key, value) VALUES
  ('store_title', 'Babyiel Store'),
  ('support_phone', '085775335453'),
  ('store_subtitle', 'Akun Digital Premium • Terpercaya & Bergaransi 🛡️'),
  ('ticker_text', '⚡ PROMO SPESIAL HARI INI: PROSES CEPAT 1-5 MENIT • FULL GARANSI RESMI • READY AKUN PREMIUM POPULER ⚡ DISKON RESELLER UP TO 50% ⚡'),
  ('qris_merchant_name', 'BABYIEL STORE OFFICIAL'),
  ('qris_merchant_id', 'ID1029384756')
ON CONFLICT (key) DO NOTHING;
