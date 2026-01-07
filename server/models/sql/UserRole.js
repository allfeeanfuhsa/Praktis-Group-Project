// server/models/sql/UserRole.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.sql');

const UserRole = sequelize.define('UserRole', {
  id_user: {
    type: DataTypes.BIGINT.UNSIGNED, // Must match User.id_user
    primaryKey: true, // Composite PK in Sequelize definitions
    references: {
      model: 'user',
      key: 'id_user'
    }
  },
  id_role: {
    type: DataTypes.TINYINT.UNSIGNED, // Must match Role.id_role
    primaryKey: true,
    references: {
      model: 'role',
      key: 'id_role'
    }
  }
}, {
  tableName: 'user_role',
  timestamps: false
});

module.exports = UserRole;