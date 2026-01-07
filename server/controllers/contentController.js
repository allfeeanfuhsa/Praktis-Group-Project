// server/controllers/contentController.js
const Tugas = require('../models/nosql/Tugas');
const Materi = require('../models/nosql/Materi');

// 1. Create a Task
exports.createTask = async (req, res, next) => { // Add 'next' for error handler
  try {
    const { pertemuan_id, judul, deskripsi, tenggat_waktu } = req.body;
    const userId = req.user.id;

    // --- DELETED: Manual Session Check ---
    // --- DELETED: Manual PraktikumUserRole Check ---
    // The middleware already guaranteed this user is the Asdos for this class!

    const newTask = await Tugas.create({
      pertemuan_id,
      judul,
      deskripsi,
      tenggat_waktu,
      created_by: userId,
      attachments: [] 
    });

    res.status(201).json({ message: 'Task created', data: newTask });

  } catch (error) {
    next(error); // Use the new global error handler
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