/**
 * utils/payment.js
 * Payment Gateway Integration (Midtrans, Mayar, Xendit) & QRIS Helpers
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 */

const config = require('../config/env');

// Generate QRIS String & SVG Data URL
function generateQRISData(orderId, amount) {
  const qrString = `00020101021226670016COM.BABYIEL.WWW01189360091430000000000215ID10293847560303UMI5204581253033605802ID5920BABYIEL STORE OFFICIAL6013JAKARTA SELATAN61051211062070703A016304`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="220" height="220"><rect width="100%" height="100%" fill="#ffffff"/><path d="M20 20h50v50H20zM30 30v30h30V30zM40 40h10v10H40zM130 20h50v50h-50zM140 30v30h30V30zM150 40h10v10h-10zM20 130h50v50H20zM30 140v30h30v-30zM40 150h10v10H40zM80 20h20v20H80zM100 40h20v20h-20zM80 70h30v20H80zM130 80h20v30h-20zM80 110h40v20H80zM140 120h30v20h-30zM90 140h30v40H90zM140 150h40v30h-40z" fill="#0f172a"/><text x="100" y="105" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#7c3aed">QRIS BYL</text></svg>`;
  const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return {
    qr_string: qrString,
    qris_url: qrDataUrl,
    qris_image_url: qrDataUrl,
    merchant_name: 'BABYIEL STORE OFFICIAL',
    merchant_id: 'ID1029384756'
  };
}

// Mayar Official QRIS & Payment API Helper (3.5s Timeout Safeguard)
async function createMayarQRISCode(orderId, amount, customerInfo = {}) {
  const apiKey = config.payment.mayarApiKey;
  if (!apiKey) return null;

  const baseUrl = config.payment.mayarEnv === 'sandbox' 
    ? 'https://api.mayar.club/hl/v1' 
    : 'https://api.mayar.id/hl/v1';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const payload = JSON.stringify({
      name: customerInfo.name || 'Pelanggan Babyiel Store',
      email: customerInfo.email || 'customer@babyielstore.my.id',
      mobile: customerInfo.mobile || customerInfo.wa || '081234567890',
      amount: amount,
      description: `Pembayaran Order ${orderId}`,
      redirectUrl: `https://babyielstore.my.id/orders/status?order_id=${orderId}`
    });

    let response = await fetch(`${baseUrl}/qrcode/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: payload,
      signal: controller.signal
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${baseUrl}/invoice/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: payload,
        signal: controller.signal
      });
    }

    clearTimeout(timeout);

    const resData = await response.json();
    const data = resData.data || resData;

    if (data && (data.qrString || data.qrCodeUrl || data.link || data.id)) {
      let qrDataUrl = data.qrCodeUrl || data.qr_url;
      if (!qrDataUrl && data.qrString) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="220" height="220"><rect width="100%" height="100%" fill="#ffffff"/><path d="M20 20h50v50H20zM30 30v30h30V30zM40 40h10v10H40zM130 20h50v50h-50zM140 30v30h30V30zM150 40h10v10h-10zM20 130h50v50H20zM30 140v30h30v-30zM40 150h10v10H40zM80 20h20v20H80zM100 40h20v20h-20zM80 70h30v20H80zM130 80h20v30h-20zM80 110h40v20H80zM140 120h30v20h-30zM90 140h30v40H90zM140 150h40v30h-40z" fill="#0f172a"/><text x="100" y="105" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#00C853">MAYAR QRIS</text></svg>`;
        qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      }

      return {
        qr_string: data.qrString || data.qr_string || '',
        qris_url: qrDataUrl || data.link || '',
        payment_url: data.link || data.url || '',
        mayar_id: data.id,
        merchant_name: 'BABYIEL STORE OFFICIAL (MAYAR)'
      };
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('[MAYAR ERROR] Failed to create QR Code via Mayar API:', err.message);
  }
  return null;
}

// Xendit Official QRIS Charge API Helper (3.5s Timeout Safeguard)
async function createXenditQRISCode(orderId, amount) {
  const secretKey = config.payment.xenditSecretKey;
  if (!secretKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
    const payload = JSON.stringify({
      external_id: orderId,
      type: 'DYNAMIC',
      callback_url: 'https://babyielstore.my.id/api/webhook/qris',
      amount: amount,
      currency: 'IDR'
    });

    const response = await fetch('https://api.xendit.co/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: payload,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (data && (data.qr_string || data.id)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="220" height="220"><rect width="100%" height="100%" fill="#ffffff"/><path d="M20 20h50v50H20zM30 30v30h30V30zM40 40h10v10H40zM130 20h50v50h-50zM140 30v30h30V30zM150 40h10v10h-10zM20 130h50v50H20zM30 140v30h30v-30zM40 150h10v10H40zM80 20h20v20H80zM100 40h20v20h-20zM80 70h30v20H80zM130 80h20v30h-20zM80 110h40v20H80zM140 120h30v20h-30zM90 140h30v40H90zM140 150h40v30h-40z" fill="#0f172a"/><text x="100" y="105" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#0066FF">XENDIT QRIS</text></svg>`;
      const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      return {
        qr_string: data.qr_string || '',
        qris_url: qrDataUrl,
        xendit_id: data.id,
        merchant_name: 'BABYIEL STORE OFFICIAL (XENDIT)'
      };
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('[XENDIT ERROR] Failed to create QR Code via Xendit API:', err.message);
  }
  return null;
}

// Midtrans Dynamic QRIS Charge API Helper (3.5s Timeout Safeguard)
async function createMidtransQRISCode(orderId, amount, customerInfo = {}) {
  const serverKey = config.payment.midtransServerKey;
  if (!serverKey) return null;

  const isProduction = config.payment.midtransIsProduction;
  const baseUrl = isProduction 
    ? 'https://api.midtrans.com/v2/charge' 
    : 'https://api.sandbox.midtrans.com/v2/charge';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
    const payload = JSON.stringify({
      payment_type: 'qris',
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount)
      },
      qris: {
        acquirer: 'gopay'
      },
      customer_details: {
        first_name: customerInfo.name || 'Customer',
        email: customerInfo.email || 'customer@babyielstore.my.id',
        phone: customerInfo.wa || '085775335453'
      }
    });

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Override-Notification-Url': 'https://babyielstore.my.id/api/webhook/midtrans'
      },
      body: payload,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (data && (data.qr_string || (data.actions && data.actions.length > 0))) {
      let qrCodeUrl = '';
      if (data.actions) {
        const qrAction = data.actions.find(a => a.name === 'generate-qr-code') || data.actions[0];
        if (qrAction) qrCodeUrl = qrAction.url;
      }
      
      const qrString = data.qr_string || '';
      const realQrImageUrl = qrString ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}` : qrCodeUrl;

      return {
        qr_string: qrString,
        qris_url: realQrImageUrl,
        qris_image_url: qrCodeUrl || realQrImageUrl,
        midtrans_id: data.transaction_id || orderId,
        merchant_name: 'BABYIEL STORE OFFICIAL (MIDTRANS)'
      };
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('[MIDTRANS ERROR] Failed to create QR Code via Midtrans API:', err.message);
  }
  return null;
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
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
}

module.exports = {
  generateQRISData,
  createMayarQRISCode,
  createXenditQRISCode,
  createMidtransQRISCode,
  calculateExpiryDate,
};
