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

    // 1. Check if file was uploaded
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 2. Check if task exists
    const task = await Tugas.findById(tugas_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 3. Check if student already submitted
    const existingSubmission = await Pengumpulan.findOne({ 
      tugas_id, 
      student_id: studentId 
    });
    
    if (existingSubmission) {
      return res.status(400).json({ 
        message: 'You have already submitted this task. Please contact your instructor if you need to resubmit.' 
      });
    }

    // 4. Check deadline (improved with timezone handling)
    const now = new Date();
    const deadline = new Date(task.tenggat_waktu);
    
    if (now > deadline) {
      return res.status(400).json({ 
        message: `Submission deadline has passed. Deadline was ${deadline.toLocaleString('id-ID', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}.` 
      });
    }

    // 5. Optional: Verify student is enrolled in this class
    const { Pertemuan, PraktikumUserRole, Role } = require('../models/sql');
    const session = await Pertemuan.findByPk(task.pertemuan_id);
    
    if (session) {
      const enrollment = await PraktikumUserRole.findOne({
        where: { 
          id_user: studentId, 
          id_praktikum: session.id_praktikum 
        },
        include: [{ model: Role }]
      });

      if (!enrollment || enrollment.Role.deskripsi !== 'mahasiswa') {
        return res.status(403).json({ 
          message: 'You are not enrolled in this class as a student' 
        });
      }
    }

    // 6. Create submission
    const submission = await Pengumpulan.create({
      tugas_id,
      student_id: studentId,
      file: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      },
      status: 'diserahkan',
      submitted_at: new Date()
    });

    res.status(201).json({ 
      message: 'Submission successful', 
      data: submission 
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 2. ASDOS: Grade Submission
exports.gradeWork = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { nilai, feedback } = req.body;
    const asdosId = req.user.id;

    // 1. Validate input
    if (nilai === undefined || nilai === null) {
      return res.status(400).json({ message: 'Nilai (score) is required' });
    }

    // Validate score range (adjust based on your grading system)
    if (nilai < 0 || nilai > 100) {
      return res.status(400).json({ message: 'Nilai must be between 0 and 100' });
    }

    // 2. Find submission
    const submission = await Pengumpulan.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 3. Get task details
    const task = await Tugas.findById(submission.tugas_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 4. Get session to find praktikum_id
    const { Pertemuan, PraktikumUserRole, Role } = require('../models/sql');
    const session = await Pertemuan.findByPk(task.pertemuan_id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // 5. Verify authorization: User must be asdos of this class OR admin
    const isAdmin = req.user.roles.includes('admin');
    
    if (!isAdmin) {
      const enrollment = await PraktikumUserRole.findOne({
        where: { 
          id_user: asdosId, 
          id_praktikum: session.id_praktikum 
        },
        include: [{ model: Role }]
      });

      if (!enrollment || enrollment.Role.deskripsi !== 'asdos') {
        return res.status(403).json({ 
          message: 'You are not authorized to grade this submission. Only the instructor of this class can grade.' 
        });
      }
    }

    // 6. Update the grade
    submission.nilai = nilai;
    submission.feedback = feedback || '';
    submission.status = 'dinilai';
    submission.graded_by = asdosId;
    submission.graded_at = new Date();
    
    await submission.save();

    res.json({ 
      message: 'Grading saved successfully', 
      data: submission 
    });

  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Download File
const path = require('path');
const fs = require('fs');

exports.downloadFile = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    // 1. Find the submission
    const submission = await Pengumpulan.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 2. Get the task to find pertemuan_id
    const task = await Tugas.findById(submission.tugas_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 3. Get session to find praktikum_id
    const { Pertemuan, PraktikumUserRole, Role } = require('../models/sql');
    const session = await Pertemuan.findByPk(task.pertemuan_id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // 4. Authorization Check
    const userId = req.user.id;
    const isOwner = submission.student_id === userId;
    const isAdmin = req.user.roles.includes('admin');

    // Check if user is the asdos of this class
    let isAsdos = false;
    if (!isOwner && !isAdmin) {
      const enrollment = await PraktikumUserRole.findOne({
        where: { 
          id_user: userId, 
          id_praktikum: session.id_praktikum 
        },
        include: [{ model: Role }]
      });
      
      isAsdos = enrollment && enrollment.Role.deskripsi === 'asdos';
    }

    // Deny access if not authorized
    if (!isOwner && !isAsdos && !isAdmin) {
      return res.status(403).json({ 
        message: 'You are not authorized to download this file' 
      });
    }

    // 5. Send the file
    const filePath = path.resolve(submission.file.path);
    if (fs.existsSync(filePath)) {
      res.download(filePath, submission.file.filename);
    } else {
      res.status(404).json({ message: 'File not found on server' });
    }
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
};

