// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const bcrypt = require('bcryptjs'); // Needed for creating users

// 1. Import Models (Added 'Praktikum' to the list)
const { User, Role, PraktikumUserRole, Praktikum, UserRole, Pertemuan } = require('../models/sql');

// ==========================================
// FEATURE 1: DASHBOARD STATS
// ==========================================
router.get('/stats', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // 1. Count Total Asdos (No status check anymore)
    const totalAsdos = await PraktikumUserRole.count({
      distinct: true, 
      col: 'id_user',
      include: [{
        model: Role,
        where: { deskripsi: 'asdos' } 
      }]
    });

    // 2. Count Total Classes (Replaces the old "pending" logic)
    // ❌ REMOVED: where: { status: 'pending' } <-- This was causing the crash
    const totalClasses = await Praktikum.count();

    res.json({
      totalAsdos: totalAsdos,
      totalClasses: totalClasses
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Server Error fetching stats' });
  }
});

// ==========================================
// FEATURE 2: MANAJEMEN ASDOS (Direct Assignment)
// ==========================================

// 1. Get Asdos List for a specific Class
router.get('/asdos', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_praktikum } = req.query;
    
    // Find users with 'asdos' role for this class
    const asdosList = await PraktikumUserRole.findAll({
      where: { id_praktikum: id_praktikum },
      include: [
        { model: User, attributes: ['id_user', 'nama', 'nim', 'email'] },
        { model: Role, where: { deskripsi: 'asdos' } } // Ensure we only fetch Asdos, not students
      ]
    });

    res.json(asdosList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching asdos list' });
  }
});

// 2. Assign Student as Asdos (Create)
router.post('/asdos', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;

    // A. Find Asdos Role ID
    const asdosRole = await Role.findOne({ where: { deskripsi: 'asdos' } });
    if (!asdosRole) return res.status(500).json({ message: 'Role Asdos not found' });

    // B. Check if already assigned
    const existing = await PraktikumUserRole.findOne({
      where: { id_user, id_praktikum, id_role: asdosRole.id_role }
    });

    if (existing) {
      return res.status(400).json({ message: 'User already assigned to this class' });
    }

    // C. Create Assignment (No status needed!)
    await PraktikumUserRole.create({
      id_user,
      id_praktikum,
      id_role: asdosRole.id_role
    });

    res.json({ message: 'Asdos assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning asdos' });
  }
});

// 3. Remove Asdos (Delete)
router.delete('/asdos', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;
    const asdosRole = await Role.findOne({ where: { deskripsi: 'asdos' } });

    await PraktikumUserRole.destroy({
      where: { 
        id_user, 
        id_praktikum, 
        id_role: asdosRole.id_role 
      }
    });

    res.json({ message: 'Asdos removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing asdos' });
  }
});

// ==========================================
// FEATURE 3: USER CRUD
// ==========================================

// Get All Users
router.get('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id_user', 'nama', 'email', 'nim', 'prodi'],
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

// Create New User
router.post('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { nama, nim, email, password, role } = req.body;

    // 1. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Create User
    const newUser = await User.create({
      nama, nim, email, password: hashedPassword
    });

    // 3. Assign Global Role (default 'mahasiswa' or 'admin')
    // Note: 'asdos' is usually a context role, but we can allow assigning global roles here
    const roleRecord = await Role.findOne({ where: { deskripsi: role || 'mahasiswa' } });

    if (roleRecord) {
      // Manually create the UserRole entry
      await UserRole.create({
        id_user: newUser.id_user,
        id_role: roleRecord.id_role
      });
    }

    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Delete User
router.delete('/users/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    await User.destroy({ where: { id_user: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ==========================================
// FEATURE 3: MANAJEMEN PRAKTIKUM (Master Data)
// ==========================================

// 1. Get All Praktikum
router.get('/praktikum', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // Order by newest year first
    const labs = await Praktikum.findAll({
      order: [['tahun_pelajaran', 'DESC'], ['semester', 'ASC']]
    });
    res.json(labs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching labs' });
  }
});

// 2. Create New Praktikum
// POST Create Class + AUTO-GENERATE 10 SESSIONS
router.post('/praktikum', async (req, res) => {
    try {
        // 1. Get Data from Body
        // Admin MUST send 'tanggal_mulai', 'waktu_mulai', 'waktu_selesai' now!
        const { 
            mata_kuliah, kode_kelas, tahun_pelajaran, 
            sks, semester, ruangan,
            tanggal_mulai, waktu_mulai, waktu_selesai 
        } = req.body;

        // Validation
        if (!tanggal_mulai || !waktu_mulai || !waktu_selesai) {
            return res.status(400).json({ 
                message: 'Start Date (tanggal_mulai) and Times (waktu_mulai/selesai) are required to generate sessions.' 
            });
        }

        // 2. Create the Class (Praktikum)
        // We construct a descriptive string for 'jadwal' based on the input
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const startObj = new Date(tanggal_mulai);
        const dayName = days[startObj.getDay()];
        const jadwalStr = `${dayName}, ${waktu_mulai} - ${waktu_selesai}`;

        const newClass = await Praktikum.create({
            mata_kuliah,
            kode_kelas,
            tahun_pelajaran,
            sks,
            semester,
            ruangan,
            jadwal: jadwalStr
        });

        // 3. AUTO-GENERATE 10 SESSIONS (Pertemuan)
        const sessions = [];
        for (let i = 0; i < 10; i++) {
            // Calculate date: Start Date + (Week * 7 days)
            const sessionDate = new Date(tanggal_mulai);
            sessionDate.setDate(sessionDate.getDate() + (i * 7));

            sessions.push({
                id_praktikum: newClass.id_praktikum,
                sesi_ke: i + 1,
                tanggal: sessionDate,       // YYYY-MM-DD
                waktu_mulai: waktu_mulai,   // HH:MM
                waktu_selesai: waktu_selesai, // HH:MM
                ruangan: ruangan
            });
        }

        // Bulk insert for performance
        await Pertemuan.bulkCreate(sessions);

        res.status(201).json({ 
            message: 'Class and 10 Sessions created successfully!', 
            data: newClass 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating class: ' + err.message });
    }
});

// 3. Delete Praktikum
router.delete('/praktikum/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Check if Asdos are assigned before deleting to prevent orphan data
    // For now, we just delete it.
    await Praktikum.destroy({ where: { id_praktikum: id } });
    
    res.json({ message: 'Praktikum deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting praktikum' });
  }
});

module.exports = router;