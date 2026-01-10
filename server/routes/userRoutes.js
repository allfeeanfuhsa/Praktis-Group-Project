const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// Imports for Dashboard
const { PraktikumUserRole, Praktikum, Role } = require('../models/sql'); 

router.use(verifyToken);

// 1. Profile Routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// 2. Dashboard Route (The Real Logic)
router.get('/asdos-dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch assigned classes
    const assignments = await PraktikumUserRole.findAll({
      where: { id_user: userId },
      include: [
        { 
            model: Praktikum,
            // ✅ USING 'kode_kelas' AS YOU REQUESTED
            attributes: ['id_praktikum', 'mata_kuliah', 'kode_kelas', 'tahun_pelajaran', 'jadwal', 'ruangan']
        },
        { 
            model: Role, 
            where: { deskripsi: 'asdos' } 
        }
      ]
    });

    // Extract just the class data
    const myClasses = assignments.map(a => a.Praktikum);

    // Calculate stats
    const stats = {
        totalClasses: myClasses.length,
        totalStudents: 0, // Placeholder
        pendingGrading: 0 // Placeholder
    };

    res.json({ stats, myClasses });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// ==========================================
// 3. MAHASISWA DASHBOARD
// ==========================================
router.get('/mahasiswa-dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch classes where the user is enrolled as 'mahasiswa'
    const enrollments = await PraktikumUserRole.findAll({
      where: { id_user: userId },
      include: [
        { 
            model: Praktikum,
            attributes: ['id_praktikum', 'mata_kuliah', 'kode_kelas', 'tahun_pelajaran', 'jadwal', 'ruangan']
        },
        { 
            model: Role, 
            where: { deskripsi: 'mahasiswa' } // <--- KEY DIFFERENCE
        }
      ]
    });

    const myClasses = enrollments.map(e => e.Praktikum);

    // Simple Stats
    const stats = {
        activeClasses: myClasses.length,
        assignmentsPending: 0, // Placeholder
        attendanceRate: '100%' // Placeholder
    };

    res.json({ stats, myClasses });

  } catch (error) {
    console.error("Mhs Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;