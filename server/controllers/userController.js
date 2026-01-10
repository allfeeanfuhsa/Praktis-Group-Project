// server/controllers/userController.js
const { User, Praktikum, PraktikumUserRole, Role } = require('../models/sql');
const bcrypt = require('bcryptjs');
const response = require('../utils/responseHelper');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    response.success(res, 200, 'Profile retrieved', user);
  } catch (error) {
    response.error(res, 500, error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (nama) user.nama = nama;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    response.success(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    response.error(res, 500, error.message);
  }
};

// =========================================================
// ASDOS DASHBOARD
// =========================================================
exports.getAsdosDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const assignments = await PraktikumUserRole.findAll({
      where: { id_user: userId },
      include: [
        { 
            model: Praktikum,
            // CORRECTION: Using 'mata_kuliah' and 'kode_kelas' based on your Praktikum.js
            attributes: ['id_praktikum', 'mata_kuliah', 'kode_kelas', 'tahun_pelajaran', 'jadwal', 'ruangan'] 
        },
        { 
            model: Role, 
            // CORRECTION: Using 'deskripsi' based on your Role.js
            where: { deskripsi: 'asdos' } 
        }
      ]
    });

    // Format data
    const teachingClasses = assignments.map(a => {
        if (!a.Praktikum) return null;
        return {
            id_praktikum: a.Praktikum.id_praktikum,
            nama_praktikum: a.Praktikum.mata_kuliah, // We map 'mata_kuliah' to 'nama_praktikum' for frontend consistency
            kode: a.Praktikum.kode_kelas,
            jadwal: a.Praktikum.jadwal,
            ruangan: a.Praktikum.ruangan,
            tahun_pelajaran: a.Praktikum.tahun_pelajaran
        };
    }).filter(item => item !== null);

    res.json({
        stats: { totalClasses: teachingClasses.length },
        classes: teachingClasses
    });

  } catch (error) {
    console.error("Asdos Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

// =========================================================
// MAHASISWA DASHBOARD
// =========================================================
exports.getMahasiswaDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await PraktikumUserRole.findAll({
      where: { id_user: userId },
      include: [
        { 
            model: Praktikum,
            attributes: ['id_praktikum', 'mata_kuliah', 'kode_kelas', 'jadwal'] 
        },
        { 
            model: Role, 
            // CORRECTION: Using 'deskripsi' based on your Role.js
            where: { deskripsi: 'mahasiswa' } 
        }
      ]
    });

    // Format for Frontend
    const enrolledClasses = enrollments.map(e => {
        if (!e.Praktikum) return null;
        return {
            id_praktikum: e.Praktikum.id_praktikum,
            nama_praktikum: e.Praktikum.mata_kuliah, // Map DB 'mata_kuliah' -> Frontend 'nama_praktikum'
            kode: e.Praktikum.kode_kelas,
            jadwal: e.Praktikum.jadwal
        };
    }).filter(item => item !== null);

    res.json({
        stats: { activeClasses: enrolledClasses.length },
        enrolledClasses: enrolledClasses // Matches SidebarMhs.jsx
    });

  } catch (error) {
    console.error("Mhs Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};