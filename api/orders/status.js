const handleRequest = require('../../server');

module.exports = async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const id = parsedUrl.searchParams.get('id') || req.query?.id;
    if (id) {
      req.url = `/api/orders/${id}/status`;
    }
    return await handleRequest(req, res);
  } catch (err) {
    console.error('[SERVERLESS ERROR orders/status.js]:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ success: false, message: err.message || 'Internal Server Error' }));
  }
};
