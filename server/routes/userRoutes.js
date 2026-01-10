// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// === FIX IS HERE ===
// Remove the { } brackets. Import it directly.
const verifyToken = require('../middleware/authMiddleware'); 

// Debugging: This should print "[Function: verifyToken]"
console.log('VerifyToken Check:', verifyToken); 

// Apply Auth Middleware
router.use(verifyToken);

// 1. Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// 2. Dashboards
router.get('/asdos-dashboard', userController.getAsdosDashboard);
router.get('/mahasiswa-dashboard', userController.getMahasiswaDashboard);

// === ADMIN ROUTES ===
// Get User Details
router.get('/admin/users/:id', 
  verifyToken, 
  // checkRole(['admin']), // Ensure only admin can access
  userController.getUserById
);

router.put('/admin/users/:id', verifyToken, userController.updateUserByAdmin);

// Assign Class
router.post('/admin/enroll', 
  verifyToken, 
  // checkRole(['admin']), 
  userController.assignUserToClass
);

// Remove Class
router.post('/admin/unenroll', 
  verifyToken, 
  // checkRole(['admin']), 
  userController.removeUserFromClass
);

module.exports = router;