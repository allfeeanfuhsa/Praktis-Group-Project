// server/controllers/contentController.js
const Tugas = require('../models/nosql/Tugas');
const Materi = require('../models/nosql/Materi');

// 1. Create a Task
exports.createTask = async (req, res, next) => {
  try {
    const { pertemuan_id, judul, deskripsi, tenggat_waktu } = req.body;
    
    // 🔒 ADD THIS: Validate required fields
    if (!pertemuan_id || !judul || !tenggat_waktu) {
      return res.status(400).json({ 
        message: 'Missing required fields: pertemuan_id, judul, tenggat_waktu' 
      });
    }

    // 🔒 ADD THIS: Validate deadline is in the future
    const deadline = new Date(tenggat_waktu);
    if (isNaN(deadline.getTime())) {
      return res.status(400).json({ message: 'Invalid date format for tenggat_waktu' });
    }
    
    if (deadline < new Date()) {
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }

    const userId = req.user.id;
    const newTask = await Tugas.create({
      pertemuan_id,
      judul,
      deskripsi,
      tenggat_waktu: deadline,
      created_by: userId,
      attachments: [] 
    });

    res.status(201).json({ message: 'Task created', data: newTask });

  } catch (error) {
    next(error);
  }
};

// 2. Get Tasks for a specific Session
exports.getTasksBySession = async (req, res, next) => {
    try {
        const { pertemuan_id } = req.params;
        const tasks = await Tugas.find({ pertemuan_id });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

// 3. Create Material (Upload Slides)
exports.createMaterial = async (req, res, next) => {
  try {
    const { pertemuan_id, judul, deskripsi } = req.body;
    const userId = req.user.id;
    const files = req.files; // Array of files from multer

    // Convert multer files to our schema format
    const attachments = files ? files.map(f => ({
      filename: f.filename,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size
    })) : [];

    const newMaterial = await Materi.create({
      pertemuan_id,
      judul,
      deskripsi,
      attachments,
      created_by: userId
    });

    res.status(201).json({ message: 'Material uploaded', data: newMaterial });
  } catch (error) {
    next(error);
  }
};

// 4. Get Materials
exports.getMaterialsBySession = async (req, res, next) => {
  try {
    const { pertemuan_id } = req.params;
    const materials = await Materi.find({ pertemuan_id });
    res.json(materials);
  } catch (error) {
    next(error);
  }
};