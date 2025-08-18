require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  database: {
    path: process.env.DB_PATH || './database.sqlite'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN,
    publicKey: process.env.MP_PUBLIC_KEY,
    webhookSecret: process.env.MP_WEBHOOK_SECRET,
    successUrl: process.env.MP_SUCCESS_URL || 'http://localhost:3000/pago-exitoso',
    failureUrl: process.env.MP_FAILURE_URL || 'http://localhost:3000/pago-fallido',
    pendingUrl: process.env.MP_PENDING_URL || 'http://localhost:3000/pago-pendiente'
  },
  
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'Club Comandante Espora <noreply@clubespora.com>'
  },
  
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },
  
  rateLimit: {
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};