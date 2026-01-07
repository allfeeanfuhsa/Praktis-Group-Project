// server/models/sql/PraktikumUserRole.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.sql');

const PraktikumUserRole = sequelize.define('PraktikumUserRole', {
  id_user: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    references: { model: 'user', key: 'id_user' }
  },
  id_praktikum: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    references: { model: 'praktikum', key: 'id_praktikum' }
  },
  id_role: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true,
    references: { model: 'role', key: 'id_role' }
  }
}, {
  tableName: 'praktikum_user_role',
  timestamps: false
});

module.exports = PraktikumUserRole;