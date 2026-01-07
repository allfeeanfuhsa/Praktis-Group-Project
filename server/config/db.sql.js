// server/config/db.sql.js
const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
  env.sql.database,
  env.sql.user,
  env.sql.password,
  {
    host: env.sql.host,
    dialect: env.sql.dialect,
    logging: false, // Set to console.log to see raw SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;