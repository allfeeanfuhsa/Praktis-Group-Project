// server/models/sql/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.sql');

const User = sequelize.define('User', {
  id_user: {
    type: DataTypes.BIGINT.UNSIGNED, // Matches SQL 'bigint(20) UNSIGNED'
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nim: {
    type: DataTypes.CHAR(10), // Matches SQL 'char(10)'
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  prodi: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  angkatan: {
    type: DataTypes.SMALLINT.UNSIGNED, // Matches SQL 'smallint(5) UNSIGNED'
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'user',
  timestamps: true,      // Enable timestamps
  underscored: true,     // ✅ This automatically maps 'createdAt' -> 'created_at'
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;