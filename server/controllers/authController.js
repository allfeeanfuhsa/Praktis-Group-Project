// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, PraktikumUserRole } = require('../models/sql');
const env = require('../config/env');
const logger = require('../utils/logger');

// Cookie configuration — centralised so login and logout use the same settings
const COOKIE_NAME = 'auth_token';
const COOKIE_OPTIONS = {
  httpOnly: true,       // 2.1: HttpOnly prevents JS access — mitigates XSS token theft
  secure: process.env.NODE_ENV === 'production',   // HTTPS only in production
  sameSite: 'strict',  // CSRF mitigation
  maxAge: 24 * 60 * 60 * 1000  // 24 hours in ms
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User & Global Roles
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    if (!user) {
      // Security fix (BG-11): Return generic 401 to prevent user enumeration.
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Invalid credentials' });

    // 2. Get Global Roles (e.g., ['mahasiswa'])
    let roles = user.Roles.map(r => r.deskripsi);

    // 3. CHECK FOR CONTEXT ROLES
    const isAsdos = await PraktikumUserRole.findOne({
      where: { id_user: user.id_user },
      include: [{ model: Role, where: { deskripsi: 'asdos' } }]
    });
    if (isAsdos && !roles.includes('asdos')) {
      roles.push('asdos');
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user.id_user, roles: roles },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    // 5. 2.1: Set token as HttpOnly cookie (primary secure storage)
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    // Also return token in response body for backward compatibility
    // (clients using Authorization header still work; cookie-based clients ignore the body token)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id_user,
        nama: user.nama,
        email: user.email,
        roles: roles
      }
    });

  } catch (error) {
    logger.error('Login Error:', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// 2.1: Logout — clears the HttpOnly cookie server-side
exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
};

exports.me = (req, res) => {
  res.json(req.user);
};