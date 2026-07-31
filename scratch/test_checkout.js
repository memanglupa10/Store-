const http = require('http');

async function testCheckout() {
  const postData = JSON.stringify({
    product_id: 'prod-netflix',
    package_label: '1 Bulan Ultra HD (1 Screen)',
    customer_name: 'Budi Test Mayar',
    customer_wa: '081299998888',
    customer_email: 'budi@gmail.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/checkout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', data);
        resolve(data);
      });
    });

    req.on('error', (e) => resolve('Server not running on port 3000: ' + e.message));
    req.write(postData);
    req.end();
  });
}

testCheckout();
