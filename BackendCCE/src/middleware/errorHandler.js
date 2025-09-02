const config = require('../config');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

// Handle Sequelize errors
const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError('Validation failed', errors);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'field';
    return new ConflictError(`${field} already exists`);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Foreign key constraint failed');
  }

  if (error.name === 'SequelizeDatabaseError') {
    console.error('Original Sequelize error:', error);
    return new AppError(`Database error: ${error.message}`, 500, false);
  }

  return error;
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize errors
  if (error.name && error.name.startsWith('Sequelize')) {
    error = handleSequelizeError(error);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.isOperational = false;
  }

  // Log error (only in development or if it's a server error)
  if (config.server.env === 'development' || !error.isOperational) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  // Send error response
  const response = {
    success: false,
    message: error.message,
    statusCode: error.statusCode
  };

  // Include additional error details in development or for validation errors
  if (config.server.env === 'development' || error instanceof ValidationError) {
    if (error.errors) {
      response.errors = error.errors;
    }
    if (config.server.env === 'development') {
      response.stack = error.stack;
    }
  }

  // Don't expose internal errors in production
  if (config.server.env === 'production' && !error.isOperational) {
    response.message = 'Something went wrong!';
  }

  res.status(error.statusCode).json(response);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};