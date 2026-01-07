// server/config/env.js
require('dotenv').config();

// Simple validation to ensure critical vars exist
const requiredVars = ['MONGO_URI', 'MYSQL_HOST'];
requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`⚠️  Missing required environment variable: ${key}`);
  }
});

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  sql: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB_NAME,
    dialect: process.env.MYSQL_DIALECT || 'mysql',
  },
  
  mongo: {
    uri: process.env.MONGO_URI,
  },
};

module.exports = env;