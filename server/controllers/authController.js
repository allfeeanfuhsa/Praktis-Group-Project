// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole } = require('../models/sql');
const env = require('../config/env');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ 
        where: { email },
        // IMPORTANT: We need to load the roles too!
        include: [{
            model: Role,
            through: { attributes: [] } // Don't include the junction table data
        }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check Password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // 3. Generate Token
    // We put the User ID and their Roles into the token
    const roles = user.Roles.map(r => r.deskripsi); // ['admin']
    
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

// Simple check to see if token works
exports.me = (req, res) => {
    res.json(req.user); // Returns the decoded token data
};