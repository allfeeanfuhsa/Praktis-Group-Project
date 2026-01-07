// server/models/sql/PresensiStatus.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.sql');

const PresensiStatus = sequelize.define('PresensiStatus', {
  id_status: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.STRING(20), // 'Hadir', 'Sakit', 'Izin', 'Alpha'
    allowNull: false
  }
}, {
  tableName: 'presensi_status',
  timestamps: false
});

module.exports = PresensiStatus;