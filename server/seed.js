// server/seed.js
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, UserRole } = require('./models/sql/index');

const seedDatabase = async () => {
  try {
    // 1. Connect
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    // 2. Create Roles (if they don't exist)
    const rolesData = [
      { deskripsi: 'admin' },
      { deskripsi: 'asdos' },
      { deskripsi: 'mahasiswa' }
    ];

    // Bulk create ignores duplicates if your model has unique: true
    for (const role of rolesData) {
      // findOrCreate is safer than bulkCreate for re-running seeds
      await Role.findOrCreate({
        where: { deskripsi: role.deskripsi },
        defaults: role
      });
    }
    console.log('✅ Roles "admin", "asdos", "mahasiswa" verified/created');

    // 3. Create Admin User
    const adminEmail = 'admin@university.ac.id';
    const adminPassword = 'password123'; // Change this if you want
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [adminUser, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        nama: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        // Admin might not have these, but we set them to null or generic values
        nim: null, 
        prodi: 'System Administrator',
        angkatan: 2024
      }
    });

    if (created) {
      console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // 4. Assign "admin" Role to User
    // First, find the role ID for 'admin'
    const adminRole = await Role.findOne({ where: { deskripsi: 'admin' } });
    
    // Check if link exists
    const hasRole = await UserRole.findOne({
      where: {
        id_user: adminUser.id_user,
        id_role: adminRole.id_role
      }
    });

    if (!hasRole) {
      await UserRole.create({
        id_user: adminUser.id_user,
        id_role: adminRole.id_role
      });
      console.log('✅ Assigned "admin" role to user');
    } else {
      console.log('ℹ️  User already has admin role');
    }

    console.log('🎉 Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();