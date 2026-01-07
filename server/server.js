// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Configs
const env = require('./config/env');
const sequelize = require('./config/db.sql');
const connectMongo = require('./config/db.mongo');

// Initialize App
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// START SERVER
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectMongo();

    // 2. Connect to SQL (Authenticate)
    await sequelize.authenticate();
    console.log('✅ MySQL (MariaDB) Connected via Sequelize');

    // Import the models logic
    const { sequelize: sqlDB } = require('./models/sql/index');

    // await sqlDB.sync({ alter: true });
    await sqlDB.authenticate(); 
    console.log('✅ SQL Database Connected (Schema validation skipped)');

    // 3. Start Listening
    app.listen(env.port, () => {
      console.log(`🚀 Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();