const logger = require('../../../infrastructure/logging/logger');

// Global error-handling middleware.

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error(`Unhandled error: ${err.stack || err.message}`);
  }

  const errorResponse = {
    success: false,
    error: {
      message: message
    }
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
