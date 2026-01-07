const config = require('../config');

/**
 * Simple logger utility
 *
 * In production, console.logs should be replaced with proper logging service
 * (e.g., Winston, Pino, or cloud logging like CloudWatch, Datadog)
 */

const isDevelopment = config.server.env === 'development';
const isProduction = config.server.env === 'production';

const logger = {
  /**
   * Info level - general information
   */
  info: (message, ...args) => {
    console.log(`ℹ️  [INFO] ${message}`, ...args);
  },

  /**
   * Success level - successful operations
   */
  success: (message, ...args) => {
    console.log(`✅ [SUCCESS] ${message}`, ...args);
  },

  /**
   * Warning level - potential issues
   */
  warn: (message, ...args) => {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  },

  /**
   * Error level - errors that need attention
   */
  error: (message, ...args) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  },

  /**
   * Debug level - only in development
   */
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Security level - security-related events
   */
  security: (message, ...args) => {
    console.error(`🚨 [SECURITY] ${message}`, ...args);
  },

  /**
   * HTTP level - HTTP requests (use in production with caution)
   */
  http: (message, ...args) => {
    if (isDevelopment) {
      console.log(`🌐 [HTTP] ${message}`, ...args);
    }
  }
};

module.exports = logger;
