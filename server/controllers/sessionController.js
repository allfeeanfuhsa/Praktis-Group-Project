// server/controllers/sessionController.js
const { Pertemuan, PraktikumUserRole, Role } = require('../models/sql');
const { ROLES } = require('../utils/constants'); // We'll create this next

exports.createSession = async (req, res) => {
  try {
    const { id_praktikum, sesi_ke, tanggal, waktu_mulai, waktu_selesai, ruangan } = req.body;
    const userId = req.user.id; // From the Token

    // 1. SECURITY: Check if this user is an 'asdos' for this specific class
    // We check the 'PraktikumUserRole' table
    const isAsdos = await PraktikumUserRole.findOne({
      where: { 
        id_praktikum, 
        id_user: userId 
      },
      include: [{
        model: Role,
        where: { deskripsi: 'asdos' } // Must be Asdos role
      }]
    });

    // If they are Admin, we might allow it too, but let's stick to Asdos for now
    // Or you can check req.user.roles.includes('admin') to bypass
    const isAdmin = req.user.roles.includes('admin');

    if (!isAsdos && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not an Asdos for this class.' });
    }

    // 2. Create the Session
    const session = await Pertemuan.create({
      id_praktikum,
      sesi_ke,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      ruangan
    });

    res.status(201).json({ message: 'Session created', data: session });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSessionsByClass = async (req, res) => {
    try {
        const { id_praktikum } = req.params;
        const sessions = await Pertemuan.findAll({ where: { id_praktikum } });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};