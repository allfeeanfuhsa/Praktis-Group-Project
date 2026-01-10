// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, PraktikumUserRole } = require('../models/sql');
const env = require('../config/env');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User & Global Roles
    const user = await User.findOne({ 
        where: { email },
        include: [{
            model: Role,
            through: { attributes: [] }
        }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    // 2. Get Global Roles (e.g., ['mahasiswa'])
    let roles = user.Roles.map(r => r.deskripsi); 

    // 3. CHECK FOR CONTEXT ROLES (The Fix!)
    // Check if this user is an Asdos in ANY active Praktikum
    const isAsdos = await PraktikumUserRole.findOne({
      where: { id_user: user.id_user },
      include: [{ model: Role, where: { deskripsi: 'asdos' } }]
    });

    // If they are found in the Praktikum table as 'asdos', ADD it to their roles
    if (isAsdos && !roles.includes('asdos')) {
      roles.push('asdos');
    }

    // 4. Generate Token with the combined roles
    const token = jwt.sign(
      { id: user.id_user, roles: roles }, 
      env.jwtSecret, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id_user,
        nama: user.nama,
        email: user.email,
        roles: roles
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = (req, res) => {
    res.json(req.user);
};