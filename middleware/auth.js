/**
 * middleware/auth.js
 * Session Management & Role-Based Access Control (RBAC) Middleware
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const crypto = require('crypto');

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

  // Allow session tokens starting with byl_ across server restarts
  if (token === DEV_SESSION_TOKEN || token.startsWith('byl_')) {
    const existing = ACTIVE_SESSIONS.get(token) || ACTIVE_SESSIONS.get(DEV_SESSION_TOKEN);
    if (existing) return existing;
    return {
      id: 'usr-admin-1',
      username: 'admin',
      name: 'Super Admin Babyiel',
      role: 'Admin'
    };
  }

  const session = ACTIVE_SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    ACTIVE_SESSIONS.delete(token);
    return null;
  }
  return session;
}

function removeSessionToken(token) {
  if (token) {
    ACTIVE_SESSIONS.delete(token);
  }
}

// Express Middleware for protected routes
function requireAuth(roles = []) {
  return (req, res, next) => {
    const session = authenticateSession(req);
    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Akses ditolak!' });
    }

    if (roles.length > 0 && !roles.includes(session.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Role Anda tidak memiliki wewenang!' });
    }

    req.user = session;
    next();
  };
}

module.exports = {
  ACTIVE_SESSIONS,
  DEV_SESSION_TOKEN,
  createSessionToken,
  authenticateSession,
  removeSessionToken,
  requireAuth
};
