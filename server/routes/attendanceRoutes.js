// server/routes/attendanceRoutes.js
// 2.8: Attendance (Presensi) routes — activates the dormant Presensi feature.
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const attendanceController = require('../controllers/attendanceController');

// All routes require authentication
router.use(verifyToken);

// =============================================
// ASDOS ROUTES
// =============================================

// Get attendance sheet for a session (list of students + their current status)
// GET /api/attendance/session/:id_pertemuan
router.get('/session/:id_pertemuan', checkRole(['asdos', 'admin']), attendanceController.getSessionAttendance);

// Submit / bulk-update attendance for a session
// POST /api/attendance/session/:id_pertemuan
// Body: { records: [{ id_user, id_status }, ...] }
router.post('/session/:id_pertemuan', checkRole(['asdos', 'admin']), attendanceController.submitAttendance);

// =============================================
// MAHASISWA ROUTES
// =============================================

// Get own attendance across all sessions of a class
// GET /api/attendance/my/:id_praktikum
router.get('/my/:id_praktikum', attendanceController.getMyAttendance);

// =============================================
// SHARED UTILITY ROUTES
// =============================================

// Get all attendance status options (for dropdowns)
// GET /api/attendance/statuses
router.get('/statuses', attendanceController.getStatuses);

module.exports = router;
