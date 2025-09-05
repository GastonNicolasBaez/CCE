require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      console.error('🚨 SECURITY WARNING: JWT_SECRET not set! Using insecure default.');
      console.error('Generate a secure secret with: openssl rand -base64 32');
      return 'encriptada';
    })(),
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
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'Club Comandante Espora <noreply@clubespora.com>'
  },
  
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  }
};
