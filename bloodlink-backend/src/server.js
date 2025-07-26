require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const donorRoutes = require('./routes/donors');
const healthCenterRoutes = require('./routes/healthCenters');
const bloodRequestRoutes = require('./routes/bloodRequests');
const telegramRoutes = require('./routes/telegram');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100), // Much higher limit in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use('/api', limiter);

// More strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // More lenient in development
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Bloodlink API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/health-centers', healthCenterRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/telegram', telegramRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Bloodlink Blood Donor Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        'forgot-password': 'POST /api/auth/forgot-password',
        'reset-password': 'POST /api/auth/reset-password'
      },
      users: {
        profile: 'GET /api/users/profile',
        'update-profile': 'PUT /api/users/profile',
        'change-password': 'PUT /api/users/change-password'
      },
      donors: {
        list: 'GET /api/donors',
        profile: 'GET /api/donors/profile',
        'update-availability': 'PUT /api/donors/availability'
      },
      healthCenters: {
        list: 'GET /api/health-centers',
        profile: 'GET /api/health-centers/profile',
        'update-profile': 'PUT /api/health-centers/profile'
      },
      bloodRequests: {
        create: 'POST /api/blood-requests',
        list: 'GET /api/blood-requests',
        get: 'GET /api/blood-requests/:id',
        update: 'PUT /api/blood-requests/:id',
        cancel: 'DELETE /api/blood-requests/:id'
      },
      telegram: {
        link: 'POST /api/telegram/link-telegram',
        deepLink: 'GET /api/telegram/deep-link/:userId',
        testBroadcast: 'GET /api/telegram/test-broadcast',
        notifyBloodRequest: 'POST /api/telegram/notify-blood-request'
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(`
🩸 Bloodlink Blood Donor Platform API
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📡 Health check: http://localhost:${PORT}/health
📚 API docs: http://localhost:${PORT}/api
  `);
});

module.exports = app; 