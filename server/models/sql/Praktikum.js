// server/models/sql/Praktikum.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.sql');

const Praktikum = sequelize.define('Praktikum', {
  id_praktikum: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  mata_kuliah: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tahun_pelajaran: {
    type: DataTypes.STRING(9), // e.g., "2023/2024"
    allowNull: false
  },
  jadwal: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ruangan: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sks: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false
  },
  semester: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'praktikum',
  timestamps: false // SQL dump doesn't show created_at for this table
});

module.exports = Praktikum;