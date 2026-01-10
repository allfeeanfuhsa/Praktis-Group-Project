// server/controllers/contentController.js
const Tugas = require('../models/nosql/Tugas');
const Materi = require('../models/nosql/Materi');
// Import SQL Models
const { Pertemuan, PraktikumUserRole, Role } = require('../models/sql'); 

// ==========================================
// A. SESSION MANAGEMENT (SQL: Pertemuan)
// ==========================================

// 1. Create a Session (Schedule)
exports.createSession = async (req, res, next) => {
  try {
    const { id_praktikum, sesi_ke, tanggal, waktu_mulai, waktu_selesai, ruangan } = req.body;
    const userId = req.user.id;

    // Security Check: Is this user the Asdos for this class?
    // (Or is it an Admin?)
    const isAdmin = req.user.roles.includes('admin');
    let isAuthorized = isAdmin;

    if (!isAdmin) {
        const isAsdos = await PraktikumUserRole.findOne({
            where: { id_praktikum, id_user: userId },
            include: [{ model: Role, where: { deskripsi: 'asdos' } }]
        });
        if (isAsdos) isAuthorized = true;
    }

    if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: You are not the Asdos for this class.' });
    }

    // Create the session in SQL
    const newSession = await Pertemuan.create({
      id_praktikum,
      sesi_ke,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      ruangan
    });

    res.status(201).json({ message: 'Session created', data: newSession });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Sessions (Timeline)
exports.getSessionsByClass = async (req, res, next) => {
  try {
    const { id_praktikum } = req.params;
    const sessions = await Pertemuan.findAll({
      where: { id_praktikum },
      order: [['sesi_ke', 'ASC']]
    });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// 3. Delete Session
exports.deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Pertemuan.destroy({ where: { id_pertemuan: id } });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// B. CONTENT MANAGEMENT (NoSQL)
// ==========================================

// 4. Create Task (Tugas)
exports.createTask = async (req, res, next) => {
  try {
    const { pertemuan_id, judul, deskripsi, tenggat_waktu } = req.body;
    
    // Validate
    if (!pertemuan_id || !judul || !tenggat_waktu) return res.status(400).json({ message: 'Missing fields' });

    const deadline = new Date(tenggat_waktu);
    if (isNaN(deadline.getTime())) return res.status(400).json({ message: 'Invalid deadline' });

    // Handle Attachments
    const files = req.files || [];
    const attachments = files.map(f => ({
      filename: f.filename, path: f.path, mimetype: f.mimetype, size: f.size
    }));

    const newTask = await Tugas.create({
      pertemuan_id, judul, deskripsi, tenggat_waktu: deadline,
      created_by: req.user.id, attachments 
    });

    res.status(201).json({ message: 'Task created', data: newTask });
  } catch (error) { next(error); }
};

// 5. Create Material (Materi)
exports.createMaterial = async (req, res, next) => {
  try {
    const { pertemuan_id, judul, deskripsi } = req.body;
    const files = req.files || [];

    const attachments = files.map(f => ({
      filename: f.filename, path: f.path, mimetype: f.mimetype, size: f.size
    }));

    const newMaterial = await Materi.create({
      pertemuan_id, judul, deskripsi, attachments,
      created_by: req.user.id
    });

    res.status(201).json({ message: 'Material uploaded', data: newMaterial });
  } catch (error) { next(error); }
};

// 6. Getters
exports.getTasksBySession = async (req, res, next) => {
    try {
        const { pertemuan_id } = req.params;
        const tasks = await Tugas.find({ pertemuan_id });
        res.json(tasks);
    } catch (error) { next(error); }
};

exports.getMaterialsBySession = async (req, res, next) => {
  try {
    const { pertemuan_id } = req.params;
    const materials = await Materi.find({ pertemuan_id });
    res.json(materials);
  } catch (error) { next(error); }
};

// 7. Download Material File
exports.downloadMaterialFile = async (req, res, next) => {
  try {
    const { materiId, fileIndex } = req.params;
    const material = await Materi.findById(materiId);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const file = material.attachments[parseInt(fileIndex)];
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set proper headers for file download
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Length', file.size);

    // Stream the file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(file.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ message: 'Error downloading file' });
    });
  } catch (error) { next(error); }
};