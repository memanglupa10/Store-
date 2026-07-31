const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.MAYAR_API_KEY;
const env = (process.env.MAYAR_ENV || 'production').toLowerCase();
const baseUrl = env === 'sandbox' ? 'https://api.mayar.club/hl/v1' : 'https://api.mayar.id/hl/v1';

async function testMayar() {
  console.log('--- Testing Mayar Payment Integration ---');
  console.log('Environment:', env);
  console.log('Base URL:', baseUrl);
  console.log('API Key Provided:', apiKey ? 'YES' : 'NO (Set MAYAR_API_KEY in .env)');

  if (!apiKey) {
    console.log('Skipping live API call because MAYAR_API_KEY is not set yet in .env');
    return;
  }

  const orderId = 'BYL-TEST-' + Date.now();
  const payload = JSON.stringify({
    name: 'Customer Test',
    email: 'test@babyielstore.my.id',
    mobile: '081234567890',
    amount: 15000,
    description: `Pembayaran Order ${orderId}`,
    redirectUrl: `https://babyielstore.my.id/orders/status?order_id=${orderId}`
  });

  try {
    console.log(`Sending POST request to ${baseUrl}/qrcode/create...`);
    let res = await fetch(`${baseUrl}/qrcode/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: payload
    });

    if (!res.ok && res.status === 404) {
      console.log(`Fallback endpoint ${baseUrl}/invoice/create...`);
      res = await fetch(`${baseUrl}/invoice/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: payload
      });
    }

    const data = await res.json();
    console.log('Mayar API Response Status:', res.status);
    console.log('Mayar Response Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error calling Mayar API:', err);
  }
}

testMayar();
