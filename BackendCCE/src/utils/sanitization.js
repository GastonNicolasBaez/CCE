/**
 * Sanitization utilities for preventing injection attacks
 */

/**
 * Sanitizes a search term to prevent SQL injection in LIKE queries
 * Escapes special SQL wildcards: %, _, and \
 *
 * @param {string} searchTerm - The search term to sanitize
 * @returns {string} - Sanitized search term safe for SQL LIKE queries
 */
function sanitizeSearchTerm(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = searchTerm.trim();

  // Escape backslashes first (must be first to avoid double escaping)
  sanitized = sanitized.replace(/\\/g, '\\\\');

  // Escape SQL LIKE wildcards
  sanitized = sanitized.replace(/%/g, '\\%');
  sanitized = sanitized.replace(/_/g, '\\_');

  // Limit length to prevent DOS attacks
  sanitized = sanitized.substring(0, 100);

  return sanitized;
}

/**
 * Validates and sanitizes email address
 * @param {string} email - Email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = email.trim().toLowerCase();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Length check
  if (sanitized.length > 255) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitizes DNI (Argentina document number)
 * @param {string} dni - DNI to sanitize
 * @returns {string|null} - Sanitized DNI or null if invalid
 */
function sanitizeDNI(dni) {
  if (!dni || typeof dni !== 'string') {
    return null;
  }

  // Remove all non-digits
  const sanitized = dni.replace(/\D/g, '');

  // Argentina DNI should be 7-8 digits
  if (sanitized.length < 7 || sanitized.length > 8) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitizes general text input
 * Removes potentially dangerous characters
 * @param {string} input - Text to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 500)
 * @returns {string} - Sanitized text
 */
function sanitizeText(input, maxLength = 500) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newline and tab
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  sanitized = sanitized.substring(0, maxLength);

  return sanitized;
}

/**
 * Validates and sanitizes numeric input
 * @param {any} value - Value to sanitize
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null} - Sanitized number or null if invalid
 */
function sanitizeNumber(value, min = -Infinity, max = Infinity) {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (num < min || num > max) {
    return null;
  }

  return num;
}

module.exports = {
  sanitizeSearchTerm,
  sanitizeEmail,
  sanitizeDNI,
  sanitizeText,
  sanitizeNumber
};
