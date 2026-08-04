require('dotenv').config();

async function testMidtrans() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error('MIDTRANS_SERVER_KEY is missing in .env');
    return;
  }

  console.log('Testing Midtrans Server Key from .env...');
  const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
  const payload = JSON.stringify({
    payment_type: 'qris',
    transaction_details: {
      order_id: 'BYL-TEST-' + Date.now(),
      gross_amount: 10000
    },
    qris: {
      acquirer: 'gopay'
    }
  });

  try {
    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: payload
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testMidtrans();
