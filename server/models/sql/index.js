// server/models/sql/index.js (UPDATED)
const sequelize = require('../../config/db.sql');

// Import All Models
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');
const Praktikum = require('./Praktikum');
const PraktikumUserRole = require('./PraktikumUserRole');
const Pertemuan = require('./Pertemuan');

// --- NEW IMPORTS ---
const Presensi = require('./Presensi');
const PresensiStatus = require('./PresensiStatus');

// 1. Global User Roles
User.belongsToMany(Role, { through: UserRole, foreignKey: 'id_user', otherKey: 'id_role' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'id_role', otherKey: 'id_user' });

// 2. Class Enrollment
User.belongsToMany(Praktikum, { through: PraktikumUserRole, foreignKey: 'id_user', otherKey: 'id_praktikum' });
Praktikum.belongsToMany(User, { through: PraktikumUserRole, foreignKey: 'id_praktikum', otherKey: 'id_user' });
PraktikumUserRole.belongsTo(Role, { foreignKey: 'id_role' });
PraktikumUserRole.belongsTo(User, { foreignKey: 'id_user' });

// 3. Sessions
Praktikum.hasMany(Pertemuan, { foreignKey: 'id_praktikum' });
Pertemuan.belongsTo(Praktikum, { foreignKey: 'id_praktikum' });

// --- NEW ASSOCIATIONS (ATTENDANCE) ---
// A Session has many Attendance records
Pertemuan.hasMany(Presensi, { foreignKey: 'id_pertemuan' });
Presensi.belongsTo(Pertemuan, { foreignKey: 'id_pertemuan' });

// A User has many Attendance records
User.hasMany(Presensi, { foreignKey: 'id_user' });
Presensi.belongsTo(User, { foreignKey: 'id_user' });

// A Status (Hadir/Alpha) has many records
PresensiStatus.hasMany(Presensi, { foreignKey: 'id_status' });
Presensi.belongsTo(PresensiStatus, { foreignKey: 'id_status' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Praktikum,
  PraktikumUserRole,
  Pertemuan,
  // Export new models
  Presensi,
  PresensiStatus
};