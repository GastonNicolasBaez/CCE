const rateLimit = require('express-rate-limit');
const config = require('../config');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      retryAfter: Math.round(config.rateLimit.windowMs / 1000)
    });
  }
});

// Stricter limiter for payment operations
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: {
    success: false,
    message: 'Too many payment requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many payment requests from this IP, please try again later.',
      statusCode: 429,
      retryAfter: Math.round(15 * 60) // 15 minutes in seconds
    });
  }
});

// Stricter limiter for webhook endpoints
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Allow more requests for webhooks as they come from external services
  message: {
    success: false,
    message: 'Too many webhook requests',
    statusCode: 429
  },
  skip: (req) => {
    // Skip rate limiting for known webhook IPs (you can add MercadoPago IPs here)
    const trustedIPs = [
      // Add MercadoPago webhook IPs here if needed
    ];
    return trustedIPs.includes(req.ip);
  }
});

// Limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    statusCode: 429
  },
  skipSuccessfulRequests: true // Don't count successful requests
});

module.exports = {
  generalLimiter,
  paymentLimiter,
  webhookLimiter,
  authLimiter
};