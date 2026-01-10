// server/controllers/userController.js
const { User } = require('../models/sql');
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