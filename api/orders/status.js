const handleRequest = require('../../server');

module.exports = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const id = parsedUrl.searchParams.get('id') || req.query?.id;
  if (id) {
    req.url = `/api/orders/${id}/status`;
  }
  return handleRequest(req, res);
};
