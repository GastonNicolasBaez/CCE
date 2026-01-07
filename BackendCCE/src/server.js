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

// Import routes
const authRoutes = require('./routes/auth');
const sociosRoutes = require('./routes/socios');
const pagosRoutes = require('./routes/pagos');

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
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0'
  });
});

// API routes
// Authentication routes (multi-tenant)
app.use('/api/auth', authRoutes);

// Resource routes (will need tenant scoping in future updates)
app.use('/api/socios', sociosRoutes);
app.use('/api/pagos', pagosRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // IMPORTANTE: NO usamos sync() porque ahora usamos migraciones
    // Las tablas se crean con: npm run db:migrate
    console.log('ℹ️  Using migration-based database schema');
    console.log('ℹ️  Run "npm run db:migrate" to create/update tables');

    // Verificar que las tablas principales existan
    try {
      const { Socio } = require('./models');
      await Socio.findOne({ limit: 1 });
      console.log('✅ Database tables verified');
    } catch (error) {
      console.warn('⚠️  Database tables may not exist.');
      console.warn('⚠️  Please run migrations: npm run db:migrate');
      console.warn('   Error details:', error.message);
    }

    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.server.env}`);
      console.log(`📱 Frontend URL: ${config.server.frontendUrl}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      
      // Log service status
      console.log('\n📋 Services Status:');
      const dbType = config.server.env === 'development' ? 'SQLite' : 'PostgreSQL (Railway)';
      console.log(`  • Database: ✅ Connected (${dbType})`);
      console.log(`  • Email: ${config.email.auth.user ? '✅' : '⚠️'} ${config.email.auth.user ? 'Configured' : 'Not configured'}`);
      console.log(`  • MercadoPago: ${config.mercadoPago.accessToken ? '✅' : '⚠️'} ${config.mercadoPago.accessToken ? 'Configured' : 'Not configured'}`);
      
      // Initialize cron service
      if (config.server.env === 'production' || config.server.env === 'development') {
        cronService.init();
        console.log(`  • Cron Jobs: ✅ Initialized`);
      }

      console.log('\n🔧 Database Migration Commands:');
      console.log('  • Create tables: npm run db:migrate');
      console.log('  • Rollback: npm run db:migrate:undo');
      console.log('  • Seed data: npm run db:seed');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  try {
    cronService.stop();
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  try {
    cronService.stop();
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;