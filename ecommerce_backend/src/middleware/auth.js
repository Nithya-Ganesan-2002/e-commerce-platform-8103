const jwt = require('jsonwebtoken');
const { unauthorized } = require('../utils/apiResponse');

// PUBLIC_INTERFACE
function authRequired(req, res, next) {
  /** Middleware that enforces a valid Bearer JWT in Authorization header. */
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;
  if (!token) return unauthorized(res, 'Missing token');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid token');
  }
}

module.exports = { authRequired };
