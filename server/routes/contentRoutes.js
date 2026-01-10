// server/routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const submissionController = require('../controllers/submissionController');

// Middlewares
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const createUploader = require('../middleware/uploadMiddleware');

// Uploaders
const uploadMaterial = createUploader('materials');
const uploadTask = createUploader('tasks'); 

router.use(verifyToken);

// =========================================================================
// 1. SESSION ROUTES (SQL: Pertemuan)
// =========================================================================

// Create
router.post('/session', 
  checkRole(['asdos', 'admin']), 
  contentController.createSession
);

// Read (List)
router.get('/session/list/:id_praktikum', 
  contentController.getSessionsByClass
);

// NEW: Update (Reschedule)
router.put('/session/:id', 
  checkRole(['asdos', 'admin']), 
  contentController.updateSession
);

// Delete
router.delete('/session/:id', 
  checkRole(['asdos', 'admin']), 
  contentController.deleteSession
);

// =========================================================================
// 2. CONTENT ROUTES (NoSQL: Materi & Tugas)
// =========================================================================

// Upload Material
router.post('/materi',
  checkRole(['asdos', 'admin']),
  uploadMaterial.array('files', 5),
  contentController.createMaterial
);

// Create Task
router.post('/tugas', 
  checkRole(['asdos', 'admin']),
  uploadTask.array('files', 5), 
  contentController.createTask
);

// Get Content (Used by Session Detail page later)
router.get('/materi/session/:pertemuan_id', contentController.getMaterialsBySession);
router.get('/tugas/session/:pertemuan_id', contentController.getTasksBySession);

// Download Material File
router.get('/materi/:materiId/download/:fileIndex', contentController.downloadMaterialFile);

router.get('/tugas/:id', contentController.getTaskById);

router.get('/me/:taskId', submissionController.getMySubmission);

router.get('/session/:id', contentController.getSessionById);

module.exports = router;