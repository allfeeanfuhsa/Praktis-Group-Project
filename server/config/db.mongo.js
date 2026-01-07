// server/config/db.mongo.js
const mongoose = require('mongoose');
const env = require('./env');

const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(env.mongo.uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1); // Stop app if Mongo fails
  }
};

module.exports = connectMongo;