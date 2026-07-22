// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rbacMiddleware');
const bcrypt = require('bcryptjs'); // Needed for creating users

// 1. Import Models
const { User, Role, PraktikumUserRole, Praktikum, UserRole, Pertemuan } = require('../models/sql');
const Materi = require('../models/nosql/Materi');
const Tugas = require('../models/nosql/Tugas');
const Pengumpulan = require('../models/nosql/Pengumpulan');
const BannedIP = require('../models/nosql/BannedIP');
const UserSession = require('../models/nosql/UserSession');
const { extractClientIP } = require('../middleware/ipBanMiddleware');

// ==========================================
// FEATURE 1: DASHBOARD STATS
// ==========================================
router.get('/stats', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // 1. Total Asdos (Contextual)
    const totalAsdos = await PraktikumUserRole.count({
      distinct: true,
      col: 'id_user',
      include: [{
        model: Role,
        where: { deskripsi: 'asdos' }
      }]
    });

    // 2. Total Students
    // Count all distinct users who have the role "mahasiswa" (Global or Contextual)
    const mhsUsers = await User.findAll({
      include: [{ model: Role, attributes: ['deskripsi'] }],
    });
    // Filter to only true students (no admin, no global asdos)
    const trueStudents = mhsUsers.filter(u => {
      const isAdmin = u.Roles?.some(r => r.deskripsi === 'admin');
      const isAsdos = u.Roles?.some(r => r.deskripsi === 'asdos');
      return !isAdmin && !isAsdos;
    });
    const totalStudents = trueStudents.length;

    // 3. Program Studi Distribution
    const prodiDistribution = {};
    trueStudents.forEach(student => {
        const prodi = student.prodi || 'Tidak Diketahui';
        prodiDistribution[prodi] = (prodiDistribution[prodi] || 0) + 1;
    });
    const prodiData = Object.keys(prodiDistribution).map(key => ({
        name: key,
        value: prodiDistribution[key]
    }));

    // 4. Classes Needing Attention
    const allClasses = await Praktikum.findAll({
      include: [{
        model: PraktikumUserRole,
        include: [{ model: Role }]
      }]
    });
    const totalClasses = allClasses.length;

    const classesNeedingAttention = [];
    allClasses.forEach(cls => {
        let asdosCount = 0;
        let studentCount = 0;
        if (cls.PraktikumUserRoles) {
            cls.PraktikumUserRoles.forEach(pur => {
                if (pur.Role?.deskripsi === 'asdos') asdosCount++;
                if (pur.Role?.deskripsi === 'mahasiswa') studentCount++;
            });
        }
        if (asdosCount === 0 || studentCount === 0) {
            classesNeedingAttention.push({
                id_praktikum: cls.id_praktikum,
                mata_kuliah: cls.mata_kuliah,
                kode_kelas: cls.kode_kelas,
                asdosCount,
                studentCount
            });
        }
    });

    // 5. Session Dates (for calendar)
    const sessions = await Pertemuan.findAll({
      attributes: ['tanggal', 'sesi_ke'],
      include: [{
          model: Praktikum,
          attributes: ['kode_kelas', 'mata_kuliah']
      }]
    });
    const sessionDates = sessions.map(s => ({
        tanggal: s.tanggal,
        sesi_ke: s.sesi_ke,
        mata_kuliah: s.Praktikum?.mata_kuliah,
        kode_kelas: s.Praktikum?.kode_kelas
    }));

    res.json({
      totalAsdos,
      totalClasses,
      totalStudents,
      prodiDistribution: prodiData,
      classesNeedingAttention,
      sessionDates
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Server Error fetching stats' });
  }
});

// ==========================================
// FEATURE 1.5: STORAGE STATS & FILE EXPLORER
// ==========================================

// Helper function to safely calculate disk folder size if needed
const getFolderSize = (dirPath) => {
  let size = 0;
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        size += stat.size;
      } else if (stat.isDirectory()) {
        size += getFolderSize(filePath);
      }
    });
  }
  return size;
};

// 1. Get Storage Stats (Capacity & Usage Breakdown)
router.get('/storage-stats', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const maxStorageMB = parseInt(process.env.MAX_STORAGE_LIMIT_MB) || 5000; // Default 5 GB
    const maxStorageBytes = maxStorageMB * 1024 * 1024;

    // Fetch DB documents
    const [materis, tugass, pengumpulans] = await Promise.all([
      Materi.find({}),
      Tugas.find({}),
      Pengumpulan.find({})
    ]);

    let materiBytes = 0;
    let materiCount = 0;
    materis.forEach(m => {
      if (m.attachments) {
        m.attachments.forEach(att => {
          materiBytes += (att.size || 0);
          materiCount++;
        });
      }
    });

    let tugasBytes = 0;
    let tugasCount = 0;
    tugass.forEach(t => {
      if (t.attachments) {
        t.attachments.forEach(att => {
          tugasBytes += (att.size || 0);
          tugasCount++;
        });
      }
    });

    let pengumpulanBytes = 0;
    let pengumpulanCount = 0;
    pengumpulans.forEach(p => {
      if (p.file) {
        pengumpulanBytes += (p.file.size || 0);
        pengumpulanCount++;
      }
    });

    // Also verify disk folder usage
    const uploadsDir = path.join(__dirname, '../uploads');
    const diskTotalBytes = getFolderSize(uploadsDir);
    const dbTotalBytes = materiBytes + tugasBytes + pengumpulanBytes;

    // Use whichever is higher (disk or calculated DB bytes) to prevent overflow hiding
    const totalUsedBytes = Math.max(diskTotalBytes, dbTotalBytes);
    const totalUsedMB = parseFloat((totalUsedBytes / (1024 * 1024)).toFixed(2));
    const usedPercentage = parseFloat(((totalUsedBytes / maxStorageBytes) * 100).toFixed(1));

    res.json({
      maxStorageMB,
      maxStorageBytes,
      totalUsedBytes,
      totalUsedMB,
      usedPercentage,
      totalFiles: materiCount + tugasCount + pengumpulanCount,
      categories: {
        materi: {
          bytes: materiBytes,
          mb: parseFloat((materiBytes / (1024 * 1024)).toFixed(2)),
          count: materiCount
        },
        tugas: {
          bytes: tugasBytes,
          mb: parseFloat((tugasBytes / (1024 * 1024)).toFixed(2)),
          count: tugasCount
        },
        pengumpulan: {
          bytes: pengumpulanBytes,
          mb: parseFloat((pengumpulanBytes / (1024 * 1024)).toFixed(2)),
          count: pengumpulanCount
        }
      }
    });
  } catch (error) {
    console.error("Storage Stats Error:", error);
    res.status(500).json({ message: 'Error fetching storage statistics' });
  }
});

// 2. Get All Files (Unified File Explorer List)
router.get('/files', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const [materis, tugass, pengumpulans] = await Promise.all([
      Materi.find({}).sort({ created_at: -1 }),
      Tugas.find({}).sort({ created_at: -1 }),
      Pengumpulan.find({}).sort({ submitted_at: -1 })
    ]);

    // Gather session IDs & user IDs for SQL bulk lookup
    const sessionIds = new Set();
    const userIds = new Set();

    materis.forEach(m => {
      if (m.pertemuan_id) sessionIds.add(m.pertemuan_id);
      if (m.created_by) userIds.add(m.created_by);
    });

    tugass.forEach(t => {
      if (t.pertemuan_id) sessionIds.add(t.pertemuan_id);
      if (t.created_by) userIds.add(t.created_by);
    });

    pengumpulans.forEach(p => {
      if (p.student_id) userIds.add(p.student_id);
    });

    // Lookup SQL Sessions and Users
    const sessions = await Pertemuan.findAll({
      where: { id_pertemuan: Array.from(sessionIds) },
      include: [{ model: Praktikum, attributes: ['id_praktikum', 'kode_kelas', 'mata_kuliah'] }]
    });

    const users = await User.findAll({
      where: { id_user: Array.from(userIds) },
      attributes: ['id_user', 'nama', 'nim', 'email']
    });

    const sessionMap = {};
    sessions.forEach(s => { sessionMap[s.id_pertemuan] = s; });

    const userMap = {};
    users.forEach(u => { userMap[u.id_user] = u; });

    // Map Tugas by ObjectId to resolve Pengumpulan session
    const tugasMap = {};
    tugass.forEach(t => { tugasMap[t._id.toString()] = t; });

    const fileList = [];

    // Map Materials
    materis.forEach(m => {
      const session = sessionMap[m.pertemuan_id];
      const uploader = userMap[m.created_by];

      if (m.attachments && m.attachments.length > 0) {
        m.attachments.forEach((att, idx) => {
          fileList.push({
            id: m._id,
            fileIndex: idx,
            category: 'materi',
            filename: att.filename,
            path: att.path,
            mimetype: att.mimetype,
            size: att.size || 0,
            title: m.judul,
            pertemuan_id: m.pertemuan_id,
            sesi_ke: session?.sesi_ke,
            kode_kelas: session?.Praktikum?.kode_kelas || 'N/A',
            mata_kuliah: session?.Praktikum?.mata_kuliah || 'N/A',
            uploadedBy: uploader ? uploader.nama : 'System/Unknown',
            uploaderNim: uploader?.nim || '-',
            createdAt: m.created_at || m.createdAt
          });
        });
      }
    });

    // Map Tasks
    tugass.forEach(t => {
      const session = sessionMap[t.pertemuan_id];
      const uploader = userMap[t.created_by];

      if (t.attachments && t.attachments.length > 0) {
        t.attachments.forEach((att, idx) => {
          fileList.push({
            id: t._id,
            fileIndex: idx,
            category: 'tugas',
            filename: att.filename,
            path: att.path,
            mimetype: att.mimetype,
            size: att.size || 0,
            title: t.judul,
            pertemuan_id: t.pertemuan_id,
            sesi_ke: session?.sesi_ke,
            kode_kelas: session?.Praktikum?.kode_kelas || 'N/A',
            mata_kuliah: session?.Praktikum?.mata_kuliah || 'N/A',
            uploadedBy: uploader ? uploader.nama : 'System/Unknown',
            uploaderNim: uploader?.nim || '-',
            createdAt: t.created_at || t.createdAt
          });
        });
      }
    });

    // Map Student Submissions
    pengumpulans.forEach(p => {
      const parentTask = tugasMap[p.tugas_id?.toString()];
      const session = parentTask ? sessionMap[parentTask.pertemuan_id] : null;
      const student = userMap[p.student_id];

      if (p.file && p.file.filename) {
        fileList.push({
          id: p._id,
          fileIndex: 0,
          category: 'pengumpulan',
          filename: p.file.filename,
          path: p.file.path,
          mimetype: p.file.mimetype,
          size: p.file.size || 0,
          title: parentTask ? `Tugas: ${parentTask.judul}` : 'Submission',
          pertemuan_id: parentTask?.pertemuan_id,
          sesi_ke: session?.sesi_ke,
          kode_kelas: session?.Praktikum?.kode_kelas || 'N/A',
          mata_kuliah: session?.Praktikum?.mata_kuliah || 'N/A',
          uploadedBy: student ? student.nama : 'Mahasiswa',
          uploaderNim: student?.nim || '-',
          createdAt: p.submitted_at || p.created_at
        });
      }
    });

    // Sort by Date Descending
    fileList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ files: fileList });

  } catch (error) {
    console.error("Files Explorer Error:", error);
    res.status(500).json({ message: 'Error fetching files list' });
  }
});

// 3. Delete File (Admin Purge Action)
const deleteFileHandler = async (req, res) => {
  try {
    const { category, id, fileIndex } = req.params;
    const idx = parseInt(fileIndex || 0);

    if (category === 'materi') {
      const materi = await Materi.findById(id);
      if (!materi) return res.status(404).json({ message: 'Materi not found' });

      if (materi.attachments && materi.attachments[idx]) {
        const filePath = path.join(__dirname, '..', materi.attachments[idx].path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        materi.attachments.splice(idx, 1);
        if (materi.attachments.length === 0) {
          await Materi.findByIdAndDelete(id);
        } else {
          await materi.save();
        }
      }
    } else if (category === 'tugas') {
      const tugas = await Tugas.findById(id);
      if (!tugas) return res.status(404).json({ message: 'Tugas not found' });

      if (tugas.attachments && tugas.attachments[idx]) {
        const filePath = path.join(__dirname, '..', tugas.attachments[idx].path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        tugas.attachments.splice(idx, 1);
        await tugas.save();
      }
    } else if (category === 'pengumpulan') {
      const submission = await Pengumpulan.findById(id);
      if (!submission) return res.status(404).json({ message: 'Submission not found' });

      if (submission.file && submission.file.path) {
        const filePath = path.join(__dirname, '..', submission.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await Pengumpulan.findByIdAndDelete(id);
    } else {
      return res.status(400).json({ message: 'Invalid category' });
    }

    res.json({ message: 'Berkas berhasil dihapus dari sistem.' });

  } catch (error) {
    console.error("Delete File Error:", error);
    res.status(500).json({ message: 'Gagal menghapus berkas' });
  }
};

router.delete('/files/:category/:id/:fileIndex', verifyToken, checkRole(['admin']), deleteFileHandler);
router.delete('/files/:category/:id', verifyToken, checkRole(['admin']), deleteFileHandler);

// ==========================================
// FEATURE 1.6: ACTIVE IP SESSIONS & IP BAN MANAGEMENT
// ==========================================

// 1. Get Active Sessions (Last active within 60 mins)
router.get('/active-sessions', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const sixtyMinsAgo = new Date(Date.now() - 60 * 60 * 1000);
    const sessions = await UserSession.find({ last_active: { $gte: sixtyMinsAgo } }).sort({ last_active: -1 });
    const bannedIps = await BannedIP.find({});
    const bannedIpSet = new Set(bannedIps.map(b => b.ip_address));

    // Enrich with SQL User info
    const userIds = Array.from(new Set(sessions.map(s => s.user_id).filter(Boolean)));
    const users = await User.findAll({
      where: { id_user: userIds },
      attributes: ['id_user', 'nama', 'email', 'nim']
    });
    const userMap = {};
    users.forEach(u => { userMap[u.id_user] = u; });

    const activeList = sessions.map(s => {
      const u = userMap[s.user_id];
      return {
        id: s._id,
        ip_address: s.ip_address,
        user_id: s.user_id,
        user_name: u ? u.nama : (s.user_name || 'Tamu / Guest'),
        user_email: u ? u.email : (s.user_email || '-'),
        user_nim: u ? u.nim : '-',
        user_roles: s.user_roles || [],
        user_agent: s.user_agent || 'Unknown',
        last_active: s.last_active,
        is_banned: bannedIpSet.has(s.ip_address)
      };
    });

    res.json({ activeSessions: activeList });
  } catch (error) {
    console.error("Active Sessions Error:", error);
    res.status(500).json({ message: 'Error fetching active sessions' });
  }
});

// 2. Get Banned IPs List
router.get('/banned-ips', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const bannedIps = await BannedIP.find({}).sort({ banned_at: -1 });
    res.json({ bannedIps });
  } catch (error) {
    console.error("Banned IPs Error:", error);
    res.status(500).json({ message: 'Error fetching banned IPs' });
  }
});

// 3. Ban IP Address
router.post('/ban-ip', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { ip_address, reason, durationMinutes, is_permanent } = req.body;
    if (!ip_address) return res.status(400).json({ message: 'Alamat IP wajib diisi.' });

    const adminIP = extractClientIP(req);

    // Self-ban protection: prevent admin from banning their own IP or localhost
    if (ip_address === adminIP || ip_address === '127.0.0.1' || ip_address === '::1' || ip_address === '::ffff:127.0.0.1') {
      return res.status(400).json({ 
        message: 'Perlindungan Sistem: Anda tidak dapat memblokir IP aktif Anda sendiri atau IP loopback (localhost).' 
      });
    }

    const adminUser = await User.findByPk(req.user.id);
    const adminName = adminUser ? adminUser.nama : 'Administrator';

    let expiresAt = null;
    if (!is_permanent && durationMinutes) {
      expiresAt = new Date(Date.now() + parseInt(durationMinutes) * 60 * 1000);
    }

    const bannedRecord = await BannedIP.findOneAndUpdate(
      { ip_address },
      {
        ip_address,
        reason: reason || 'Dilarang oleh Administrator',
        banned_by: req.user.id,
        banned_by_name: adminName,
        banned_at: new Date(),
        expires_at: expiresAt,
        is_permanent: !!is_permanent
      },
      { upsert: true, new: true }
    );

    res.json({ message: `Alamat IP ${ip_address} berhasil diblokir.`, bannedRecord });

  } catch (error) {
    console.error("Ban IP Error:", error);
    res.status(500).json({ message: 'Gagal memblokir alamat IP.' });
  }
});

// 4. Unban IP Address
router.post('/unban-ip', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { ip_address } = req.body;
    if (!ip_address) return res.status(400).json({ message: 'Alamat IP wajib diisi.' });

    await BannedIP.deleteOne({ ip_address });
    res.json({ message: `Alamat IP ${ip_address} berhasil dibuka pemblokirannya (unbanned).` });

  } catch (error) {
    console.error("Unban IP Error:", error);
    res.status(500).json({ message: 'Gagal membuka pemblokiran IP.' });
  }
});

// ==========================================
// FEATURE 2: MANAJEMEN ASDOS (Direct Assignment)
// ==========================================

// 1. Get Asdos List for a specific Class
router.get('/asdos', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_praktikum } = req.query;

    // Find users with 'asdos' role for this class
    const asdosList = await PraktikumUserRole.findAll({
      where: { id_praktikum: id_praktikum },
      include: [
        { model: User, attributes: ['id_user', 'nama', 'nim', 'email'] },
        { model: Role, where: { deskripsi: 'asdos' } } // Ensure we only fetch Asdos, not students
      ]
    });

    res.json(asdosList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching asdos list' });
  }
});

// 2. Assign Student as Asdos (Create)
router.post('/asdos', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;

    // A. Find Asdos Role ID
    const asdosRole = await Role.findOne({ where: { deskripsi: 'asdos' } });
    if (!asdosRole) return res.status(500).json({ message: 'Role Asdos not found' });

    // B. Check if already assigned
    const existing = await PraktikumUserRole.findOne({
      where: { id_user, id_praktikum, id_role: asdosRole.id_role }
    });

    if (existing) {
      return res.status(400).json({ message: 'User already assigned to this class' });
    }

    // C. Create Assignment (No status needed!)
    await PraktikumUserRole.create({
      id_user,
      id_praktikum,
      id_role: asdosRole.id_role
    });

    res.json({ message: 'Asdos assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning asdos' });
  }
});

// 3. Remove Asdos (Delete)
router.delete('/asdos', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;
    const asdosRole = await Role.findOne({ where: { deskripsi: 'asdos' } });

    await PraktikumUserRole.destroy({
      where: {
        id_user,
        id_praktikum,
        id_role: asdosRole.id_role
      }
    });

    res.json({ message: 'Asdos removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing asdos' });
  }
});

// ==========================================
// FEATURE 2.5: MANAJEMEN MAHASISWA PRAKTIKUM
// ==========================================

// 1. Assign Student to Praktikum (Create)
router.post('/mahasiswa_praktikum', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;

    const mhsRole = await Role.findOne({ where: { deskripsi: 'mahasiswa' } });
    if (!mhsRole) return res.status(500).json({ message: 'Role Mahasiswa not found' });

    const existing = await PraktikumUserRole.findOne({
      where: { id_user, id_praktikum, id_role: mhsRole.id_role }
    });

    if (existing) {
      return res.status(400).json({ message: 'User already enrolled in this class' });
    }

    await PraktikumUserRole.create({
      id_user,
      id_praktikum,
      id_role: mhsRole.id_role
    });

    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error enrolling student' });
  }
});

// 2. Remove Student from Praktikum (Delete)
router.delete('/mahasiswa_praktikum', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id_user, id_praktikum } = req.body;
    const mhsRole = await Role.findOne({ where: { deskripsi: 'mahasiswa' } });

    await PraktikumUserRole.destroy({
      where: {
        id_user,
        id_praktikum,
        id_role: mhsRole.id_role
      }
    });

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing student' });
  }
});

// ==========================================
// FEATURE 3: USER CRUD
// ==========================================

// Get All Users (with pagination — 2.9)
router.get('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id_user', 'nama', 'email', 'nim', 'prodi', 'angkatan'],
      include: [
        {
          model: Role,
          attributes: ['deskripsi'],
          through: { attributes: [] }
        },
        {
          model: PraktikumUserRole,
          attributes: ['id_role', 'id_praktikum'],
          include: [{ model: Role, attributes: ['deskripsi'] }],
          required: false
        }
      ],
      limit,
      offset,
      distinct: true // Required for correct count with associations
    });

    const formattedUsers = users.map(u => {
      const user = u.toJSON();
      // If they are an asdos contextually, add it to their roles array for UI purposes
      const isContextualAsdos = user.PraktikumUserRoles?.some(pur => pur.Role?.deskripsi === 'asdos');
      if (isContextualAsdos && !user.Roles.some(r => r.deskripsi === 'asdos')) {
         user.Roles.push({ deskripsi: 'asdos' });
      }
      return user;
    });

    res.json({ total: count, page, limit, data: formattedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create New User
router.post('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { nama, nim, email, password, role, prodi, angkatan } = req.body;

    // 1. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Create User
    const newUser = await User.create({
      nama, 
      nim: nim || null, 
      email, 
      password: hashedPassword,
      prodi: prodi || null,
      angkatan: angkatan || null
    });

    // 3. Assign Global Role
    // Strictly enforce that global roles can only be 'admin' or 'mahasiswa'
    const allowedGlobalRoles = ['admin', 'mahasiswa'];
    const assignedRole = allowedGlobalRoles.includes(role) ? role : 'mahasiswa';
    const roleRecord = await Role.findOne({ where: { deskripsi: assignedRole } });

    if (roleRecord) {
      // Manually create the UserRole entry
      await UserRole.create({
        id_user: newUser.id_user,
        id_role: roleRecord.id_role
      });
    }

    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Delete User
router.delete('/users/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    await User.destroy({ where: { id_user: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ==========================================
// FEATURE 3: MANAJEMEN PRAKTIKUM (Master Data)
// ==========================================

// 1. Get All Praktikum (with pagination - 2.9)
router.get('/praktikum', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    const asdosRole = await Role.findOne({ where: { deskripsi: 'asdos' } });

    const { count, rows: labs } = await Praktikum.findAndCountAll({
      order: [['tahun_pelajaran', 'DESC'], ['semester', 'ASC']],
      include: [
        {
          model: PraktikumUserRole,
          required: false,
          include: [
            { model: User, attributes: ['id_user', 'nama', 'nim'] },
            { model: Role, attributes: ['deskripsi'] }
          ]
        }
      ],
      distinct: true,
      limit,
      offset
    });

    const formattedLabs = labs.map(lab => {
      const labJson = lab.toJSON();
      const asdosList = [];
      const studentList = [];
      
      if (labJson.PraktikumUserRoles) {
          labJson.PraktikumUserRoles.forEach(pur => {
              if (pur.Role?.deskripsi === 'asdos') asdosList.push(pur);
              if (pur.Role?.deskripsi === 'mahasiswa') studentList.push(pur);
          });
      }
      
      labJson.asdosCount = asdosList.length;
      labJson.studentCount = studentList.length;
      // Overwrite with only asdos to not break existing frontend logic that expects this
      labJson.PraktikumUserRoles = asdosList; 
      
      return labJson;
    });

    res.json({ total: count, page, limit, data: formattedLabs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching labs' });
  }
});

// 2. Create New Praktikum
// POST Create Class + AUTO-GENERATE 10 SESSIONS
router.post('/praktikum', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // 1. Get Data from Body
    // Admin MUST send 'tanggal_mulai', 'waktu_mulai', 'waktu_selesai' now!
    const {
      mata_kuliah, kode_kelas, tahun_pelajaran,
      sks, semester, ruangan,
      tanggal_mulai, waktu_mulai, waktu_selesai
    } = req.body;

    // Validation
    if (!tanggal_mulai || !waktu_mulai || !waktu_selesai) {
      return res.status(400).json({
        message: 'Start Date (tanggal_mulai) and Times (waktu_mulai/selesai) are required to generate sessions.'
      });
    }

    // 2. Create the Class (Praktikum)
    // We construct a descriptive string for 'jadwal' based on the input
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const startObj = new Date(tanggal_mulai);
    const dayName = days[startObj.getDay()];
    const jadwalStr = `${dayName}, ${waktu_mulai} - ${waktu_selesai}`;

    const newClass = await Praktikum.create({
      mata_kuliah,
      kode_kelas,
      tahun_pelajaran,
      sks,
      semester,
      ruangan,
      jadwal: jadwalStr
    });

    // 3. AUTO-GENERATE 10 SESSIONS (Pertemuan)
    const sessions = [];
    for (let i = 0; i < 10; i++) {
      // Calculate date: Start Date + (Week * 7 days)
      const sessionDate = new Date(tanggal_mulai);
      sessionDate.setDate(sessionDate.getDate() + (i * 7));

      sessions.push({
        id_praktikum: newClass.id_praktikum,
        sesi_ke: i + 1,
        tanggal: sessionDate,       // YYYY-MM-DD
        waktu_mulai: waktu_mulai,   // HH:MM
        waktu_selesai: waktu_selesai, // HH:MM
        ruangan: ruangan
      });
    }

    // Bulk insert for performance
    await Pertemuan.bulkCreate(sessions);

    res.status(201).json({
      message: 'Class and 10 Sessions created successfully!',
      data: newClass
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating class: ' + err.message });
  }
});

// 3. Update Praktikum (Fix BG-2: this route was missing)
// PUT /admin/praktikum/:id
router.put('/praktikum/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mata_kuliah, kode_kelas, tahun_pelajaran,
      sks, semester, ruangan
    } = req.body;

    // 2.3: Basic input validation
    if (!mata_kuliah || !tahun_pelajaran) {
      return res.status(400).json({ message: 'mata_kuliah and tahun_pelajaran are required.' });
    }
    if (sks && (isNaN(sks) || sks < 1 || sks > 6)) {
      return res.status(400).json({ message: 'sks must be a number between 1 and 6.' });
    }
    if (semester && (isNaN(semester) || semester < 1 || semester > 14)) {
      return res.status(400).json({ message: 'semester must be between 1 and 14.' });
    }

    const lab = await Praktikum.findByPk(id);
    if (!lab) return res.status(404).json({ message: 'Praktikum not found.' });

    // Only update provided fields
    if (mata_kuliah) lab.mata_kuliah = mata_kuliah;
    if (kode_kelas) lab.kode_kelas = kode_kelas;
    if (tahun_pelajaran) lab.tahun_pelajaran = tahun_pelajaran;
    if (sks) lab.sks = sks;
    if (semester) lab.semester = semester;
    if (ruangan) lab.ruangan = ruangan;

    await lab.save();
    res.json({ message: 'Praktikum updated successfully.', data: lab });
  } catch (error) {
    console.error('Update Praktikum Error:', error);
    res.status(500).json({ message: 'Error updating praktikum: ' + error.message });
  }
});

// 4. Delete Praktikum
router.delete('/praktikum/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Check if Asdos are assigned before deleting to prevent orphan data
    // For now, we just delete it.
    await Praktikum.destroy({ where: { id_praktikum: id } });

    res.json({ message: 'Praktikum deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting praktikum' });
  }
});

module.exports = router;