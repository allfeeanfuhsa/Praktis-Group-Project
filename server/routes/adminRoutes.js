// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const { User, Role } = require('../models/sql');

// Route: GET /api/admin/users
// Protection: 1. Must have Token (verifyToken)
//             2. Must be 'admin' (checkRole)
router.get('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id_user', 'nama', 'email', 'prodi'], // Don't send passwords!
      include: [{
        model: Role,
        attributes: ['deskripsi'],
        through: { attributes: [] }
      }]
    });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;