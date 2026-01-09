const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if running in production with DATABASE_URL
if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Railway/Vercel
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('✅ Using PostgreSQL (Production)');
} else {
  // Development: Use local PostgreSQL with individual credentials
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cce_multitenant',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
  console.log('✅ Using PostgreSQL (Development)');
}

module.exports = sequelize;