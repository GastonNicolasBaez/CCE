const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const config = require('../src/config');
const { sequelize } = require('../src/models');
const { errorHandler, notFoundHandler } = require('../src/middleware/errorHandler');
const { generalLimiter } = require('../src/middleware/rateLimiter');

// Import routes
const sociosRoutes = require('../src/routes/socios');
const pagosRoutes = require('../src/routes/pagos');

// Create Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.server.frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging
if (config.server.env === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('common'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Initialize database connection for serverless
const initDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database in production
    if (config.server.env === 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Initialize database on first request
let isInitialized = false;
app.use(async (req, res, next) => {
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Club Comandante Espora API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      socios: '/api/socios',
      pagos: '/api/pagos'
    }
  });
});

// API routes
app.use('/api/socios', sociosRoutes);
app.use('/api/pagos', pagosRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;