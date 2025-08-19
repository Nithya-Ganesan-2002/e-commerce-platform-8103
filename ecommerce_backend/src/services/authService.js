const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

class AuthService {
  // PUBLIC_INTERFACE
  async register({ email, password, name }) {
    /** Registers a new user with hashed password and returns token and profile. */
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 400;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    // Initialize empty cart
    await prisma.cart.create({ data: { userId: user.id } });
    const token = this._signToken(user);
    return { token, user };
  }

  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /** Logs in a user by verifying password and returns token and profile. */
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }
    const basic = { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
    const token = this._signToken(basic);
    return { token, user: basic };
  }

  _signToken(user) {
    return jwt.sign(
      { sub: user.id, id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

module.exports = new AuthService();
