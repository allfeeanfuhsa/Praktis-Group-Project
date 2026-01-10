// server/routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

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

// Create Session (The one you are trying to hit!)
router.post('/session', 
  checkRole(['asdos', 'admin']), 
  contentController.createSession
);

// Get Session List (Timeline)
router.get('/session/list/:id_praktikum', 
  contentController.getSessionsByClass
);

// Delete Session
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

module.exports = router;