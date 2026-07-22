// server/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Middlewares
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const createUploader = require('../middleware/uploadMiddleware');
const validateMimeType = require('../middleware/validateMimeType'); // 2.7

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
  uploadSubmission.single('file'),
  validateMimeType,                 // 2.7: Magic bytes check after upload
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

router.get('/me/:taskId', submissionController.getMySubmission);

router.post('/me/bulk-check', submissionController.getMySubmissionsForTasks);

// Security fix (SV-7): Both download paths now require authentication.
// The /:submissionId/download path is handled above (line 47) under router.use(verifyToken).
// This duplicate path was missing verifyToken — fixed by adding it explicitly.
router.get('/download/:submissionId', verifyToken, submissionController.downloadFile);

// Security fix: Comment endpoint now requires authentication
router.post('/:submissionId/comment', verifyToken, submissionController.addComment);

module.exports = router;