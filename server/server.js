// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger'); // Winston logger (2.10)

// Configs
const env = require('./config/env');
const sequelize = require('./config/db.sql');
const connectMongo = require('./config/db.mongo');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contentRoutes = require('./routes/contentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes'); // 2.8

const errorHandler = require('./middleware/errorHandler');

// Initialize App
const app = express();

// Security fix: Use explicit origin allowlist instead of reflecting any origin.
// Set ALLOWED_ORIGINS in .env as a comma-separated list of trusted origins.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 2.2: Global rate limiter — applied to all API routes.
// More permissive than the login limiter; prevents endpoint scanning/DoS.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                // 1000 requests per IP per 15 min (increased for smooth SPA navigation)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' }
});

const { ipBanMiddleware } = require('./middleware/ipBanMiddleware');
const { apiLoggerMiddleware } = require('./middleware/apiLoggerMiddleware');

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Parse cookies for HttpOnly JWT (2.1)
app.use('/api', ipBanMiddleware); // Enforce IP ban checks on all API endpoints
app.use('/api', apiLoggerMiddleware); // Log API requests & bandwidth metrics
app.use('/api', globalLimiter); // Apply global rate limit to all /api/* routes

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes); // 2.8: Attendance feature

app.use(errorHandler)

// START SERVER
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectMongo();

    // 2. Connect to SQL (Authenticate)
    await sequelize.authenticate();
    logger.info('✅ MySQL (MariaDB) Connected via Sequelize');

    // Import the models logic
    const { sequelize: sqlDB } = require('./models/sql/index');

    // await sqlDB.sync({ alter: true });
    await sqlDB.authenticate();
    logger.info('✅ SQL Database Connected (Schema validation skipped)');

    // 3. Start Listening
    app.listen(env.port, () => {
      logger.info(`🚀 Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });

  } catch (error) {
    logger.error('❌ Server startup failed:', { error: error.message });
    process.exit(1);
  }
};

startServer();