const handleRequest = require('../server');

module.exports = async (req, res) => {
  req.url = '/api/checkout';
  return handleRequest(req, res);
};
