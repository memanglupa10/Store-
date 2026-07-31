const http = require('http');

async function testMayarWebhook(orderId) {
  const postData = JSON.stringify({
    event: 'payment.received',
    data: {
      id: 'MYR-PAY-' + Date.now(),
      status: 'PAID',
      amount: 15000,
      description: `Pembayaran Order ${orderId}`,
      transactionId: 'TX-MAYAR-' + Math.floor(Math.random()*100000)
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook/mayar',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mayar-token': 'babyiel-mayar-webhook-secret-99',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Webhook Response Status:', res.statusCode);
        console.log('Webhook Response Body:', data);
        resolve(data);
      });
    });

    req.on('error', (e) => resolve('Server error: ' + e.message));
    req.write(postData);
    req.end();
  });
}

// First create checkout order, then simulate webhook
async function runFullFlow() {
  const checkoutData = JSON.stringify({
    product_id: 'prod-netflix',
    package_label: '1 Bulan Ultra HD (1 Screen)',
    customer_name: 'Budi Test Flow',
    customer_wa: '081299998888',
    customer_email: 'budi@gmail.com'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/checkout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(checkoutData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const parsed = JSON.parse(data);
      console.log('1. Checkout Created successfully!');
      console.log('   Order ID:', parsed.order.id);
      console.log('   Merchant:', parsed.order.merchant_name);
      console.log('2. Simulating Mayar Webhook payment receipt...');
      await testMayarWebhook(parsed.order.id);
    });
  });

  req.write(checkoutData);
  req.end();
}

runFullFlow();
