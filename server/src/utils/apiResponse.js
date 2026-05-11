/**
 * Standardized API response builder.
 * All endpoints use these helpers for consistent JSON structure.
 */

/**
 * Success response.
 * @param {object} res - Express response object
 * @param {*} data - Response payload
 * @param {object} [meta] - Optional metadata (e.g., pagination)
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data, meta = null, statusCode = 200) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Created (201) response.
 */
const sendCreated = (res, data, meta = null) => {
  return sendSuccess(res, data, meta, 201);
};

/**
 * Error response.
 * @param {object} res - Express response object
 * @param {string} error - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Array} [details] - Validation error details
 */
const sendError = (res, error, statusCode = 500, details = null) => {
  const response = { success: false, error };
  if (details) response.details = details;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendCreated, sendError };