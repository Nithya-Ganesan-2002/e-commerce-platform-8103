const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { ok, created, badRequest } = require('../utils/apiResponse');

class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res, next) {
    /** Registers a user. Body: {email,password,name}. Returns token and user. */
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return badRequest(res, 'Validation error', errors.array());
      const { email, password, name } = req.body;
      const result = await authService.register({ email, password, name });
      return created(res, result);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res, next) {
    /** Logs a user in. Body: {email,password}. Returns token and user. */
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return badRequest(res, 'Validation error', errors.array());
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Returns current user's token payload information (from JWT). */
    return ok(res, { user: req.user });
  }
}

module.exports = new AuthController();
