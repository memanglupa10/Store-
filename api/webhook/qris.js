const handleRequest = require('../../server');

module.exports = async (req, res) => {
  try {
    req.url = '/api/webhook/qris';
    return await handleRequest(req, res);
  } catch (err) {
    console.error('[SERVERLESS ERROR webhook/qris.js]:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ success: false, message: err.message || 'Internal Server Error' }));
  }
};
