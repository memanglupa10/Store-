-- MySQL Database Schema for Babyiel Store Digital SaaS & QRIS Payment System

CREATE DATABASE IF NOT EXISTS `babyiel_store` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `babyiel_store`;

-- 1. Users Table (Admin & Reseller Management)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('Admin', 'Member') DEFAULT 'Member',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'fa-box',
  `image_url` VARCHAR(255) DEFAULT '',
  `color` VARCHAR(20) DEFAULT '#06b6d4',
  `duration` VARCHAR(50) DEFAULT '1 Bulan',
  `garansi` VARCHAR(100) DEFAULT '✅ Full Garansi Sesuai S&K',
  `prices_json` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Stocks Table (Digital Account Inventory)
CREATE TABLE IF NOT EXISTS `stocks` (
  `id` VARCHAR(50) PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `login_by` VARCHAR(50) DEFAULT 'Email & Password',
  `profile` VARCHAR(100) DEFAULT 'Profil 1',
  `pin` VARCHAR(50) DEFAULT '-',
  `note` TEXT,
  `status` ENUM('AVAILABLE', 'SOLD', 'RESERVED') DEFAULT 'AVAILABLE',
  `assigned_order_id` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product_status` (`product_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table (Checkout & QRIS Transactions)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(100) NOT NULL,
  `whatsapp` VARCHAR(30) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `price_category` VARCHAR(50) DEFAULT 'Standard',
  `amount` INT NOT NULL,
  `payment_ref` VARCHAR(100) UNIQUE,
  `payment_method` VARCHAR(50) DEFAULT 'QRIS',
  `qris_data` TEXT,
  `status` ENUM('PENDING', 'PAID', 'EXPIRED', 'CANCELLED') DEFAULT 'PENDING',
  `allocated_stock_id` VARCHAR(50) DEFAULT NULL,
  `account_email` VARCHAR(150) DEFAULT NULL,
  `account_password` VARCHAR(255) DEFAULT NULL,
  `account_pin` VARCHAR(50) DEFAULT NULL,
  `account_profile` VARCHAR(100) DEFAULT NULL,
  `account_login_by` VARCHAR(50) DEFAULT NULL,
  `account_note` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `paid_at` DATETIME DEFAULT NULL,
  INDEX `idx_order_status` (`status`),
  INDEX `idx_payment_ref` (`payment_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Webhook Logs Table (Idempotency Audit Log)
CREATE TABLE IF NOT EXISTS `webhook_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) DEFAULT 'QRIS_PAYMENT',
  `payment_ref` VARCHAR(100) NOT NULL,
  `payload_json` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'PROCESSED',
  `received_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_webhook_ref` (`payment_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Admin Users
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`) VALUES
('usr-admin-1', 'admin', '123', 'Super Admin Babyiel', 'Admin')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Seed Default Settings
INSERT INTO `settings` (`key`, `value`) VALUES
('store_title', 'Babyiel Store'),
('support_phone', '085775335453'),
('qris_merchant_name', 'BABYIEL STORE OFFICIAL'),
('qris_merchant_id', 'ID1029384756')
ON DUPLICATE KEY UPDATE `value`=`value`;
