// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const verifyToken = (req, res, next) => {
  // 1. Get token from header (Format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get the part after "Bearer"

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    // 2. Verify token
    const verified = jwt.verify(token, env.jwtSecret);
    
    // 3. Attach user info to request object so controllers can use it
    req.user = verified; 
    
    next(); // Pass control to the next handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;