// server/controllers/userController.js
const { User, Praktikum, PraktikumUserRole, Role } = require('../models/sql');
const bcrypt = require('bcryptjs');
const response = require('../utils/responseHelper');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware

    // 1. Fetch User + Classes (Same logic as Admin view)
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: PraktikumUserRole,
          required: false, // Return user even if no classes
          include: [
            { model: Praktikum },
            { model: Role }
          ]
        }
      ]
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // 2. Format Classes List
    const rawRoles = user.PraktikumUserRoles || [];
    const classes = rawRoles.map(pur => ({
      id_praktikum: pur.id_praktikum,
      nama_praktikum: pur.Praktikum ? pur.Praktikum.mata_kuliah : 'Unknown',
      kode_kelas: pur.Praktikum ? pur.Praktikum.kode_kelas : '-',
      role: pur.Role ? pur.Role.deskripsi : 'member',
      tahun: pur.Praktikum ? pur.Praktikum.tahun_pelajaran : '-'
    }));

    // 3. Return exact structure expected by Profile.jsx
    // We use res.json directly to match the structure of getUserById
    res.json({
      user: {
        id_user: user.id_user,
        nama: user.nama,
        nim: user.nim,
        email: user.email,
        prodi: user.prodi,
        angkatan: user.angkatan,
        created_at: user.created_at
      },
      classes: classes
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // Extract all possible fields from the request body
    const { nama, email, nim, prodi, angkatan, password } = req.body;

    // 1. Fetch current user
    const user = await User.findByPk(userId);
    if (!user) {
        return response.error(res, 404, 'User not found');
    }

    // 2. CHECK UNIQUENESS (Prevent duplicate Email or NIM)
    // We only check if the user is actually CHANGING the email or nim
    if ((email && email !== user.email) || (nim && nim !== user.nim)) {
        const conflict = await User.findOne({
            where: {
                [Op.and]: [
                    { id_user: { [Op.ne]: userId } }, // Exclude current user (ID != myID)
                    {
                        [Op.or]: [
                            // Check if new email is taken (ignore if undefined)
                            email ? { email: email } : null,
                            // Check if new nim is taken (ignore if undefined)
                            nim ? { nim: nim } : null
                        ].filter(Boolean) // Remove nulls
                    }
                ]
            }
        });

        if (conflict) {
            return response.error(res, 400, 'Email atau NIM sudah digunakan oleh user lain.');
        }
    }

    // 3. Update Standard Fields
    if (nama) user.nama = nama;
    if (email) user.email = email;
    if (nim) user.nim = nim;
    if (prodi) user.prodi = prodi;
    if (angkatan) user.angkatan = angkatan;

    // 4. Update Password (HASH IT!)
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // 5. Save changes
    await user.save();

    // 6. Return response (excluding password)
    const userData = user.toJSON();
    delete userData.password;

    response.success(res, 200, 'Profil berhasil diperbarui', userData);

  } catch (error) {
    console.error("Update Profile Error:", error);
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

// =========================================================
// ADMIN: Get Specific User Details + Enrollments
// =========================================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: PraktikumUserRole,
          include: [
            { model: Praktikum },
            { model: Role }
          ]
        }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Format the classes for cleaner JSON
    const classes = user.PraktikumUserRoles.map(pur => ({
      id_praktikum: pur.id_praktikum,
      nama_praktikum: pur.Praktikum.mata_kuliah,
      kode_kelas: pur.Praktikum.kode_kelas,
      role: pur.Role.deskripsi,
      tahun: pur.Praktikum.tahun_pelajaran
    }));

    res.json({
      user: {
        id_user: user.id_user,
        nama: user.nama,
        nim: user.nim,
        email: user.email,
        prodi: user.prodi
      },
      classes: classes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, nim, prodi, angkatan } = req.body;
    
    // Simple update without complex checks for now
    await User.update(
      { nama, email, nim, prodi, angkatan },
      { where: { id_user: id } }
    );
    
    res.json({ message: 'User updated by Admin' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// =========================================================
// ADMIN: Assign User to Class
// =========================================================
exports.assignUserToClass = async (req, res) => {
  try {
    const { id_user, id_praktikum, role_name } = req.body;

    // 1. Find Role ID (Default to 'mahasiswa' if not provided)
    const roleDesc = role_name || 'mahasiswa';
    const role = await Role.findOne({ where: { deskripsi: roleDesc } });
    if (!role) return res.status(400).json({ message: 'Role not found' });

    // 2. Check if already enrolled
    const exists = await PraktikumUserRole.findOne({
      where: {
        id_user,
        id_praktikum,
        id_role: role.id_role
      }
    });

    if (exists) {
      return res.status(400).json({ message: 'User is already enrolled in this class with this role' });
    }

    // 3. Create Enrollment
    await PraktikumUserRole.create({
      id_user,
      id_praktikum,
      id_role: role.id_role
    });

    res.json({ message: 'User assigned successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning class' });
  }
};

// =========================================================
// ADMIN: Remove User from Class
// =========================================================
exports.removeUserFromClass = async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;

    await PraktikumUserRole.destroy({
      where: { id_user, id_praktikum }
    });

    res.json({ message: 'User removed from class' });

  } catch (error) {
    res.status(500).json({ message: 'Error removing user' });
  }
};

