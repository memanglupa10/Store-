const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const secretKey = process.env.XENDIT_SECRET_KEY;

async function testXendit() {
  const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
  const payload = JSON.stringify({
    external_id: 'BYL-TEST-' + Date.now(),
    type: 'DYNAMIC',
    callback_url: 'https://babyielstore.my.id/api/webhook/qris',
    amount: 10000,
    currency: 'IDR'
  });

  try {
    const res = await fetch('https://api.xendit.co/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: payload
    });

    const data = await res.json();
    console.log('Xendit API Response Status:', res.status);
    console.log('Xendit QR Code Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error calling Xendit API:', err);
  }
}

testXendit();
