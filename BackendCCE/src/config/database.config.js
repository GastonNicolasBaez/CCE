require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        // Only disable SSL verification if explicitly set in environment
        // This is needed for some managed PostgreSQL services
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true,
        // Optionally provide custom CA certificate
        ca: process.env.DB_SSL_CA || undefined
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
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
};