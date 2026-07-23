// server/middleware/uploadRateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Anti-Abuse Rate Limiter for File Upload Endpoints
 * Limits client IPs to a maximum of 10 uploads per 15-minute window.
 */
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Batas percobaan unggah terlampaui. Maksimal 10 unggahan per 15 menit. Silakan tunggu beberapa saat.'
  }
});

module.exports = uploadRateLimiter;
