const { sendError } = require('../utils/apiResponse');

/**
 * Global error handler middleware.
 * Catches all errors thrown from routes/controllers and returns standardized responses.
 *
 * Handles:
 *   - Prisma known errors (P2002 unique constraint, P2025 record not found)
 *   - Joi validation errors (isJoi flag)
 *   - JWT errors (JsonWebTokenError, TokenExpiredError)
 *   - Multer file upload errors (LIMIT_FILE_SIZE)
 *   - Custom application errors (with statusCode property)
 *   - Unknown errors (500)
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(
      res,
      `A record with this ${field} already exists`,
      409,
      [{ field, message: `This ${field} is already in use` }]
    );
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // Joi validation errors
  if (err.isJoi) {
    return sendError(
      res,
      'Validation failed',
      400,
      err.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired', 401);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File too large (maximum 10MB)', 400);
  }

  // Multer invalid file type
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 'Unexpected file field', 400);
  }

  // Custom application error with statusCode
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // Default: 500 Internal Server Error
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, 500);
};

module.exports = errorHandler;