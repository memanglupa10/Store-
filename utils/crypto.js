/**
 * utils/crypto.js
 * AES-256-CBC Encryption & Decryption Utilities for Credentials
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const crypto = require('crypto');
const config = require('../config/env');

const ENCRYPTION_SECRET = config.security.encryptionSecret;

function encryptCredential(text) {
  if (!text || text === '-' || (typeof text === 'string' && text.startsWith('enc:'))) {
    return text;
  }
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return 'enc:' + encrypted;
  } catch (err) {
    console.error('[CRYPTO ERROR] Encryption failed:', err.message);
    return text;
  }
}

function decryptCredential(text) {
  if (!text || typeof text !== 'string' || !text.startsWith('enc:')) {
    return text;
  }
  try {
    const encryptedHex = text.replace('enc:', '');
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[CRYPTO ERROR] Decryption failed:', err.message);
    return text;
  }
}

module.exports = {
  encryptCredential,
  decryptCredential,
};
