// server/models/sql/index.js
const sequelize = require('../../config/db.sql');

const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');

// Define Associations
// The foreignKey types are inferred from the models, so they will now correctly be BIGINT and TINYINT
User.belongsToMany(Role, { 
  through: UserRole, 
  foreignKey: 'id_user', 
  otherKey: 'id_role' 
});

Role.belongsToMany(User, { 
  through: UserRole, 
  foreignKey: 'id_role', 
  otherKey: 'id_user' 
});

module.exports = {
  sequelize,
  User,
  Role,
  UserRole
};