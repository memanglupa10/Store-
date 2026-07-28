const handleRequest = require('../server');

module.exports = async (req, res) => {
  try {
    if (req.headers && req.headers['x-forwarded-url']) {
      req.url = req.headers['x-forwarded-url'];
    }
    return await handleRequest(req, res);
  } catch (err) {
    console.error('[SERVERLESS ERROR index.js]:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ success: false, message: err.message || 'Internal Server Error' }));
  }
};
