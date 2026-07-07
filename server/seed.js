require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, UserRole, PresensiStatus, Praktikum, PraktikumUserRole, Pertemuan } = require('./models/sql');
const connectMongo = require('./config/db.mongo');
const Materi = require('./models/nosql/Materi');
const Tugas = require('./models/nosql/Tugas');
const Pengumpulan = require('./models/nosql/Pengumpulan');

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB and cleaning collections...');
    await connectMongo();
    await Materi.deleteMany({});
    await Tugas.deleteMany({});
    await Pengumpulan.deleteMany({});
    console.log('✅ MongoDB collections cleaned.');

    console.log('⏳ Starting SQL database sync...');
    // Sync all tables (force: true drops existing tables and recreates them cleanly)
    await sequelize.sync({ force: true });
    console.log('✅ Tables synced successfully.');

    console.log('⏳ Seeding Roles...');
    const roles = ['admin', 'asdos', 'mahasiswa'];
    for (const roleDesc of roles) {
      await Role.findOrCreate({ where: { deskripsi: roleDesc } });
    }
    console.log('✅ Roles seeded.');

    console.log('⏳ Seeding Attendance Statuses...');
    const statuses = ['Hadir', 'Izin', 'Sakit', 'Alfa'];
    for (const status of statuses) {
      await PresensiStatus.findOrCreate({ where: { status: status } });
    }
    console.log('✅ Attendance Statuses seeded.');

    console.log('⏳ Seeding Users (Admin, Asdos, Mahasiswa)...');
    const defaultPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const usersToCreate = [
      { nama: 'Super Admin', email: 'admin@admin.com', password: hashedPassword, nim: '0000000000', roleName: 'admin' },
      { nama: 'Budi Asdos', email: 'asdos@asdos.com', password: hashedPassword, nim: '1111111111', roleName: 'asdos' },
      { nama: 'Siti Mahasiswa', email: 'mhs@mhs.com', password: hashedPassword, nim: '2222222222', roleName: 'mahasiswa' }
    ];

    const createdUsers = {};
    for (const u of usersToCreate) {
      let user = await User.findOne({ where: { email: u.email } });
      if (!user) {
        user = await User.create({ nama: u.nama, email: u.email, password: u.password, nim: u.nim });
        console.log(`✅ User created! Email: ${u.email} | Password: ${defaultPassword} | Role: ${u.roleName}`);
      } else {
        console.log(`✅ User ${u.email} already exists.`);
      }
      createdUsers[u.roleName] = user;

      // Assign global role
      const role = await Role.findOne({ where: { deskripsi: u.roleName } });
      if (role && user) {
        await UserRole.findOrCreate({ where: { id_user: user.id_user, id_role: role.id_role } });
        console.log(`✅ Role '${u.roleName}' assigned to ${u.email}.`);
      }
    }

    console.log('⏳ Seeding Praktikum, Enrollment, and Pertemuan...');
    const praktikum = await Praktikum.create({
      mata_kuliah: 'Pemrograman Web',
      kode_kelas: 'WEB-A',
      tahun_pelajaran: '2025/2026',
      jadwal: 'Senin, 08:00 - 10:00',
      ruangan: 'Lab Komputer 1',
      sks: 3,
      semester: 6
    });
    console.log('✅ Dummy Praktikum created.');

    // Enroll asdos
    const asdosRole = await Role.findOne({ where: { deskripsi: 'asdos' } });
    await PraktikumUserRole.create({
      id_user: createdUsers['asdos'].id_user,
      id_role: asdosRole.id_role,
      id_praktikum: praktikum.id_praktikum
    });
    
    // Enroll mahasiswa
    const mhsRole = await Role.findOne({ where: { deskripsi: 'mahasiswa' } });
    await PraktikumUserRole.create({
      id_user: createdUsers['mahasiswa'].id_user,
      id_role: mhsRole.id_role,
      id_praktikum: praktikum.id_praktikum
    });
    console.log('✅ Asdos & Mahasiswa enrolled to Praktikum.');

    // Create 1 Pertemuan
    await Pertemuan.create({
      id_praktikum: praktikum.id_praktikum,
      sesi_ke: 1,
      judul_pertemuan: 'Pertemuan 1: Pengenalan HTML & CSS',
      tanggal: new Date(),
      waktu_mulai: '08:00:00',
      waktu_selesai: '10:00:00'
    });
    console.log('✅ Dummy Pertemuan created.');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Start seeding
seed();
