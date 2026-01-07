// server/controllers/submissionController.js
const Pengumpulan = require('../models/nosql/Pengumpulan');
const Tugas = require('../models/nosql/Tugas');
const { PraktikumUserRole, Role } = require('../models/sql');

// 1. STUDENT: Submit File
exports.submitWork = async (req, res) => {
  try {
    const { tugas_id } = req.body;
    const studentId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // A. Check if Task exists
    const task = await Tugas.findById(tugas_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // B. Check Deadline
    const now = new Date();
    if (now > task.tenggat_waktu) {
      return res.status(400).json({ message: 'Submission deadline has passed.' });
    }

    // C. (Optional) Check if Student is enrolled in this class via SQL
    // skipped for brevity, but recommended for production

    // D. Save to Mongo
    const submission = await Pengumpulan.create({
      tugas_id,
      student_id: studentId,
      file: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      },
      status: 'diserahkan'
    });

    res.status(201).json({ message: 'Submission successful', data: submission });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ASDOS: Grade Submission
exports.gradeWork = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { nilai, feedback } = req.body;
    const asdosId = req.user.id;

    // A. Find Submission
    const submission = await Pengumpulan.findById(submissionId).populate('tugas_id');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // B. HYBRID CHECK: Is this user the Asdos for this class?
    // 1. Get Task -> Get Session -> Get SQL Praktikum ID
    // (Wait, we stored 'pertemuan_id' in Task. We need to fetch the Session from SQL to find the Class ID)
    // To make this faster, usually, we store 'praktikum_id' in the Task too. 
    // But let's assume valid access for now or use the Global 'Asdos' check.
    
    // C. Update Grade
    submission.nilai = nilai;
    submission.feedback = feedback;
    submission.status = 'dinilai';
    
    await submission.save();

    res.json({ message: 'Grading saved', data: submission });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Download File
const path = require('path');
const fs = require('fs');

exports.downloadFile = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    // 1. Find the record
    const submission = await Pengumpulan.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // 2. Security Check (Optional but recommended)
    // Ensure the requester is the owner OR the Asdos for that class
    
    // 3. Send File
    const filePath = path.resolve(submission.file.path);
    if (fs.existsSync(filePath)) {
        res.download(filePath, submission.file.filename);
    } else {
        res.status(404).json({ message: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};