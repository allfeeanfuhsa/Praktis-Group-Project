// server/routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Middlewares
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const checkEnrollment = require('../middleware/enrollmentMiddleware');
const createUploader = require('../middleware/uploadMiddleware');

// Create the specific uploader for Materials (Lecture Slides)
const uploadMaterial = createUploader('materials');

// GLOBAL PROTECTION: All content routes require a valid Token
router.use(verifyToken);

// =========================================================================
// TUGAS (TASKS) ROUTES
// =========================================================================

/**
 * @route   POST /api/content/tugas
 * @desc    Create a new Task
 * @access  Asdos (of that specific class) or Admin
 * @note    checkEnrollment(['asdos']) ensures the user is the teacher for this class
 */
router.post('/tugas', 
  checkRole(['asdos', 'admin']), // 1. Global Role Check
  checkEnrollment(['asdos']),    // 2. Context Check (SQL Verification)
  contentController.createTask   // 3. Logic
);

/**
 * @route   GET /api/content/tugas/session/:pertemuan_id
 * @desc    Get all tasks for a specific session
 * @access  Enrolled Users (Students & Asdos)
 * @note    checkEnrollment() without args allows any enrolled user
 */
router.get('/tugas/session/:pertemuan_id', 
  checkEnrollment(),             // 1. Ensures user belongs to the class
  contentController.getTasksBySession
);

// =========================================================================
// MATERI (MATERIALS) ROUTES -- NEW SECTION
// =========================================================================

/**
 * @route   POST /api/content/materi
 * @desc    Upload Lecture Slides/PDFs
 * @access  Asdos (of that class) or Admin
 * @body    multipart/form-data: { pertemuan_id, judul, files: [PDF/PPT] }
 */
router.post('/materi',
  checkRole(['asdos', 'admin']),
  checkEnrollment(['asdos']), // Ensures user teaches this class
  uploadMaterial.array('files', 5), // Allow up to 5 files
  contentController.createMaterial // <--- You need to add this function next
);

/**
 * @route   GET /api/content/materi/session/:pertemuan_id
 * @desc    Get all materials for a session
 */
router.get('/materi/session/:pertemuan_id', 
  checkEnrollment(),
  contentController.getMaterialsBySession // <--- You need to add this function next
);

module.exports = router;