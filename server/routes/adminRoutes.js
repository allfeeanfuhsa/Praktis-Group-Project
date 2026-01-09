// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
// Import PraktikumUserRole here
const { User, Role, PraktikumUserRole } = require('../models/sql');

router.get('/stats', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // 1. Count Total Asdos (Context Specific)
    // We count rows in 'praktikum_user_role' where the role is 'asdos'
    // distinct: true ensures if User A is asdos in 2 labs, they count as 1 person.
    const totalAsdos = await PraktikumUserRole.count({
      distinct: true, 
      col: 'id_user',
      include: [{
        model: Role,
        where: { deskripsi: 'asdos' } 
      }]
    });

    // 2. Count Pending Verification
    // ISSUE: Your database does NOT have a 'status' column yet.
    // For now, we return 0 to prevent the crash.
    // To fix this later, you need to ALTER TABLE praktikum_user_role ADD COLUMN status VARCHAR(20) DEFAULT 'approved';
    const pendingAsdos = 0; 

    res.json({
      totalAsdos: totalAsdos,
      pendingVerifikasi: pendingAsdos
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Server Error fetching stats' });
  }
});

module.exports = router;

// --- EXISTING ROUTE: Get All Users ---
router.get('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id_user', 'nama', 'email', 'prodi'], 
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