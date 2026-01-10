// server/controllers/submissionController.js
const Pengumpulan = require('../models/nosql/Pengumpulan');
const Tugas = require('../models/nosql/Tugas');
const { PraktikumUserRole, Role, Pertemuan, User } = require('../models/sql');

// 1. STUDENT: Submit File (Smart Update)
exports.submitWork = async (req, res) => {
  try {
    const { tugas_id } = req.body;
    const studentId = req.user.id;
    const file = req.file;

    // A. Basic Validation
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    if (!tugas_id) return res.status(400).json({ message: 'Task ID is required' });

    // B. Check Task & Deadline
    const task = await Tugas.findById(tugas_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const now = new Date();
    const deadline = new Date(task.tenggat_waktu);

    // Optional: Allow late submissions but mark them? 
    // Or block strictly? Your previous code blocked strictly.
    // Let's implement "Mark as Late" instead of blocking, which is friendlier.
    const status = now > deadline ? 'terlambat' : 'diserahkan';

    // C. Enrollment Check (Keep your existing robust logic!)
    const session = await Pertemuan.findByPk(task.pertemuan_id);
    if (session) {
      const enrollment = await PraktikumUserRole.findOne({
        where: { id_user: studentId, id_praktikum: session.id_praktikum },
        include: [{ model: Role }]
      });

      if (!enrollment || enrollment.Role.deskripsi !== 'mahasiswa') {
        return res.status(403).json({ message: 'You are not enrolled in this class.' });
      }
    }

    // D. The "Smart Save" (Update if exists, Create if new)
    const fileData = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
    };

    const submission = await Pengumpulan.findOneAndUpdate(
        { tugas_id: tugas_id, student_id: studentId }, // Find by composite key
        {
            $set: {
                file: fileData,
                status: status,
                submitted_at: now,
                // We do NOT reset 'nilai' or 'feedback' here to preserve history if needed,
                // or you can clear them if you want a fresh start.
            }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ 
        message: status === 'terlambat' ? 'Tugas dikumpulkan terlambat.' : 'Tugas berhasil dikumpulkan.', 
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
// controllers/contentController.js (or submissionController.js)

const path = require('path');
const fs = require('fs');

exports.downloadFile = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    // 1. Find the Submission (Pengumpulan), NOT Materi
    const submission = await Pengumpulan.findById(submissionId);
    
    if (!submission || !submission.file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = submission.file; // In Pengumpulan.js, 'file' is a single object, not an array

    // =========================================================
    // FIX FOR PATH RESOLUTION
    // =========================================================
    
    // A. Normalize path separators (Fixes Windows backslashes from DB)
    const normalizedDbPath = file.path.replace(/\\/g, '/');

    // B. Resolve Path Relative to THIS controller file
    // __dirname = .../server/controllers
    // '..'      = .../server
    // normalizedDbPath = uploads/submissions/filename.pdf
    const filePath = path.join(__dirname, '..', normalizedDbPath); 
    
    // =========================================================

    // Debugging
    console.log("Looking for submission at:", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set Headers
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Length', file.size);

    // Stream
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    next(error);
  }
};

exports.getSubmissionsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // 1. Get the Task metadata
    const task = await Tugas.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // 2. Get all submissions from MongoDB
    const submissions = await Pengumpulan.find({ tugas_id: taskId });

    // 3. Enrich with SQL User Data
    const enrichedSubmissions = await Promise.all(submissions.map(async (sub) => {
      // FIX 2: Change 'sub.user_id' to 'sub.student_id'
      // The Mongo model uses 'student_id', not 'user_id'
      const student = await User.findByPk(sub.student_id, {
        attributes: ['nama', 'nim']
      });

      return {
        ...sub.toObject(),
        student_name: student ? student.nama : 'Unknown',
        student_nim: student ? student.nim : 'Unknown'
      };
    }));

    res.json({
      task_title: task.judul,
      submissions: enrichedSubmissions
    });

  } catch (error) {
    next(error);
  }
};
