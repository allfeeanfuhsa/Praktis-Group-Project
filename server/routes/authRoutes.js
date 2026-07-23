// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Security fix (SV-4): Rate limit login to 5 attempts per IP per 15 minutes.
// This prevents brute-force attacks on user accounts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
});

// POST /api/auth/login
router.post('/login', loginLimiter, authController.login);

// POST /api/auth/logout — clears the HttpOnly cookie (2.1)
router.post('/logout', authController.logout);

// GET /api/auth/me (Protected Route to test token)
router.get('/me', verifyToken, authController.me);

module.exports = router;