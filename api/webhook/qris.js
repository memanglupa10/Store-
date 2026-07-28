const handleRequest = require('../../server');

module.exports = async (req, res) => {
  req.url = '/api/webhook/qris';
  return handleRequest(req, res);
};
