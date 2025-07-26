const { Prisma } = require('@prisma/client');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target?.[0] || 'field';
        return new AppError(`${field} already exists`, 400, 'DUPLICATE_FIELD');
      
      case 'P2025':
        // Record not found
        return new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
      
      case 'P2003':
        // Foreign key constraint violation
        return new AppError('Invalid reference to related record', 400, 'INVALID_REFERENCE');
      
      case 'P2014':
        // Required relation violation
        return new AppError('Required relation is missing', 400, 'MISSING_RELATION');
      
      default:
        return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Invalid data provided', 400, 'VALIDATION_ERROR');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR');
  }

  return new AppError('Database error occurred', 500, 'DATABASE_ERROR');
};

// Handle JWT errors
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () => 
  new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');

// Send error in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

// Send error in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('💥 ERROR:', err);

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Set default values
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError || 
      err instanceof Prisma.PrismaClientValidationError ||
      err instanceof Prisma.PrismaClientInitializationError) {
    error = handlePrismaError(err);
  }

  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = {
  AppError,
  errorHandler
}; 