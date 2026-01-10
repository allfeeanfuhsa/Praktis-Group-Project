// server/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Middlewares
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const createUploader = require('../middleware/uploadMiddleware'); // Import Factory

// Setup specific uploader for Submissions
const uploadSubmission = createUploader('submissions');

// GLOBAL PROTECTION
router.use(verifyToken);

// =========================================================================
// SUBMISSION ROUTES
// =========================================================================

/**
 * @route   POST /api/submission
 * @desc    Student submits a file for a Task
 * @access  Authenticated Users (Logic inside controller checks deadline)
 * @body    form-data: { tugas_id: "...", file: [PDF/Doc] }
 */
router.post('/', 
  uploadSubmission.single('file'), // Handle File Upload first
  submissionController.submitWork
);

/**
 * @route   PUT /api/submission/:submissionId/grade
 * @desc    Asdos grades a submission
 * @access  Asdos or Admin
 */
router.put('/:submissionId/grade', 
  checkRole(['asdos', 'admin']), 
  submissionController.gradeWork
);

/**
 * @route   GET /api/submission/:submissionId/download
 * @desc    Download the submitted file
 * @access  Authenticated Users (Controller checks ownership)
 */
router.get('/:submissionId/download', 
  submissionController.downloadFile
);

// NEW: Get all submissions for a specific task
router.get('/task/:taskId', 
  checkRole(['asdos', 'admin']), 
  submissionController.getSubmissionsByTask
);

router.get('/download/:submissionId', submissionController.downloadFile);

module.exports = router;