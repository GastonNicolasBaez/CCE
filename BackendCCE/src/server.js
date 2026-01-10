const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const config = require('./config');
const { sequelize } = require('./models');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const cronService = require('./services/cronService');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const sociosRoutes = require('./routes/socios');
const actividadesRoutes = require('./routes/actividades');
const pagosRoutes = require('./routes/pagos');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: { allow: false },

  // X-Frame-Options
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Strict-Transport-Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // X-Content-Type-Options
  noSniff: true,

  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // X-XSS-Protection
  xssFilter: true,

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false,

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Static allowed origins
    const allowedOrigins = [
      config.server.frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://frontend-cce-git-main-gastonnicolasbaezs-projects.vercel.app',
      'https://frontend-cce.vercel.app' // URL más corta si está disponible
    ];

    // Dynamic patterns for multi-tenant subdomains
    const allowedPatterns = [
      // Local development subdomains: espora.localhost:3000, demo.localhost:3000
      /^http:\/\/[\w-]+\.localhost(?::3000)?$/,
      // Production subdomains: espora.zeclogic.net.ar, demo.zeclogic.net.ar
      /^https?:\/\/[\w-]+\.zeclogic\.net\.ar$/,
      // Vercel preview/production deployments
      /^https:\/\/[\w-]+\.vercel\.app$/
    ];

    // Check static origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check dynamic patterns
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      return callback(null, true);
    }

    // Reject unknown origins
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Slug']
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

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0',
    status: 'healthy',
    services: {
      server: 'up',
      database: 'unknown'
    }
  };

  try {
    // Check database connection
    await sequelize.authenticate();
    healthCheck.services.database = 'up';

    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      ...healthCheck
    });
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.services.database = 'down';
    healthCheck.error = error.message;

    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      ...healthCheck
    });
  }
});

// API routes
// Authentication routes (multi-tenant)
app.use('/api/auth', authRoutes);

// Resource routes (with multi-tenant support and role-based permissions)
app.use('/api/socios', sociosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/search', searchRoutes);

// Admin routes (super admin only)
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.success('Database connection established successfully');

    // IMPORTANTE: NO usamos sync() porque ahora usamos migraciones
    // Las tablas se crean con: npm run db:migrate
    logger.info('Using migration-based database schema');
    logger.info('Run "npm run db:migrate" to create/update tables');

    // Verificar que las tablas principales existan
    try {
      const { Socio } = require('./models');
      await Socio.findOne({ limit: 1 });
      logger.success('Database tables verified');
    } catch (error) {
      logger.warn('Database tables may not exist.');
      logger.warn('Please run migrations: npm run db:migrate');
      logger.warn('Error details:', error.message);
    }

    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${config.server.env}`);
      logger.info(`📱 Frontend URL: ${config.server.frontendUrl}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);

      // Log service status
      logger.info('\n📋 Services Status:');
      const dbDialect = sequelize.options.dialect;
      const dbType = dbDialect === 'postgres' ? 'PostgreSQL' : dbDialect.toUpperCase();
      logger.info(`  • Database: ✅ Connected (${dbType})`);
      logger.info(`  • Email: ${config.email.auth.user ? '✅' : '⚠️'} ${config.email.auth.user ? 'Configured' : 'Not configured'}`);
      logger.info(`  • MercadoPago: ${config.mercadoPago.accessToken ? '✅' : '⚠️'} ${config.mercadoPago.accessToken ? 'Configured' : 'Not configured'}`);
      
      // Initialize cron service
      if (config.server.env === 'production' || config.server.env === 'development') {
        cronService.init();
        logger.info(`  • Cron Jobs: ✅ Initialized`);
      }

      logger.info('\n🔧 Database Migration Commands:');
      logger.info('  • Create tables: npm run db:migrate');
      logger.info('  • Rollback: npm run db:migrate:undo');
      logger.info('  • Seed data: npm run db:seed');
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  try {
    cronService.stop();
    await sequelize.close();
    logger.success('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  try {
    cronService.stop();
    await sequelize.close();
    logger.success('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;