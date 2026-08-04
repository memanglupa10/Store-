require('dotenv').config();

async function testMidtransSimulatePay(orderId) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return;
  const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

  try {
    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${orderId}/status/b2c`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
    console.log('Status Code:', response.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Midtrans Simulation Error:', err);
  }
}

testMidtransSimulatePay('BYL-TEST');
