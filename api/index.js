const handleRequest = require('../server');

module.exports = async (req, res) => {
  if (req.headers && req.headers['x-forwarded-url']) {
    req.url = req.headers['x-forwarded-url'];
  }
  return handleRequest(req, res);
};
