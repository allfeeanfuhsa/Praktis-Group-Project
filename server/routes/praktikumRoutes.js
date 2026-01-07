// server/routes/praktikumRoutes.js
const express = require('express');
const router = express.Router();
const praktikumController = require('../controllers/praktikumController');
const sessionController = require('../controllers/sessionController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');

// PROTECT ALL ROUTES BELOW
router.use(verifyToken);

// GET /api/praktikum (Admins see all, we'll fix logic for students later)
router.get('/', praktikumController.getAllPraktikums);

// POST /api/praktikum (Only Admin can create classes)
router.post('/', checkRole(['admin']), praktikumController.createPraktikum);

// POST /api/praktikum/:id_praktikum/enroll (Only Admin can enroll people)
router.post('/:id_praktikum/enroll', checkRole(['admin']), praktikumController.enrollUser);

// NEW: Create Session (Asdos only)
// Notice we don't force checkRole(['asdos']) globally because the Controller checks the SPECIFIC class ownership
// But checking for 'asdos' or 'admin' generally is a good first line of defense.
router.post('/session', checkRole(['asdos', 'admin']), sessionController.createSession);

// Get sessions for a class
router.get('/:id_praktikum/sessions', sessionController.getSessionsByClass);

module.exports = router;