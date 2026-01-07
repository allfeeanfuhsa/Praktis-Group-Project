// server/models/sql/Pertemuan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.sql');

const Pertemuan = sequelize.define('Pertemuan', {
  id_pertemuan: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  id_praktikum: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: 'praktikum', key: 'id_praktikum' }
  },
  sesi_ke: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY, // SQL 'DATE' maps to DATEONLY in Sequelize
    allowNull: false
  },
  waktu_mulai: {
    type: DataTypes.TIME,
    allowNull: false
  },
  waktu_selesai: {
    type: DataTypes.TIME,
    allowNull: false
  },
  ruangan: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'pertemuan_praktikum',
  timestamps: false
});

module.exports = Pertemuan;