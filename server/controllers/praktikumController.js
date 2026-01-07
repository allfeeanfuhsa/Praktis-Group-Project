// server/controllers/praktikumController.js
const { Praktikum, User, PraktikumUserRole, Role } = require('../models/sql');

// 1. Create a new Class (Admin Only)
exports.createPraktikum = async (req, res) => {
  try {
    const { mata_kuliah, tahun_pelajaran, sks, semester, jadwal, ruangan } = req.body;
    
    const newClass = await Praktikum.create({
      mata_kuliah,
      tahun_pelajaran,
      sks,
      semester,
      jadwal,
      ruangan
    });

    res.status(201).json({ message: 'Class created successfully', data: newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Classes (Visible to Admin, later filtered for students)
exports.getAllPraktikums = async (req, res) => {
  try {
    const classes = await Praktikum.findAll();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Enroll a User into a Class (Admin Only)
exports.enrollUser = async (req, res) => {
  try {
    const { id_praktikum } = req.params;
    const { id_user, role_name } = req.body; // e.g. role_name: 'asdos' or 'mahasiswa'

    // Find the Role ID based on string name
    const role = await Role.findOne({ where: { deskripsi: role_name } });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    // Check if user exists
    const user = await User.findByPk(id_user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add to junction table
    await PraktikumUserRole.create({
      id_praktikum,
      id_user,
      id_role: role.id_role
    });

    res.json({ message: `User enrolled as ${role_name} successfully` });
  } catch (error) {
    // Handle duplicate entry error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'User is already enrolled in this class' });
    }
    res.status(500).json({ message: error.message });
  }
};