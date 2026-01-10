// server/controllers/praktikumController.js
const { Praktikum, User, PraktikumUserRole, Role } = require('../models/sql');
const response = require('../utils/responseHelper');

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

    response.success(res, 201, 'Class created successfully', newClass);
  } catch (error) {
    response.error(res, 500, error.message);
  }
};

// 2. Get All Classes (Visible to Admin, later filtered for students)
exports.getAllPraktikums = async (req, res) => {
  try {
    const classes = await Praktikum.findAll();
    response.success(res, 200, 'Classes retrieved', classes);
  } catch (error) {
    response.error(res, 500, error.message);
  }
};

// 3. Enroll a User into a Class (Admin Only)
exports.enrollUser = async (req, res) => {
  try {
    const { id_praktikum } = req.params;
    const { id_user, role_name } = req.body;

    const role = await Role.findOne({ where: { deskripsi: role_name } });
    if (!role) return response.error(res, 404, 'Role not found');

    const user = await User.findByPk(id_user);
    if (!user) return response.error(res, 404, 'User not found');

    await PraktikumUserRole.create({
      id_praktikum,
      id_user,
      id_role: role.id_role
    });

    response.success(res, 201, `User enrolled as ${role_name} successfully`);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return response.error(res, 400, 'User is already enrolled in this class');
    }
    response.error(res, 500, error.message);
  }
};