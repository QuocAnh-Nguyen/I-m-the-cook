/**
 * Async handler wrapper.
 * Wraps async route handlers to catch errors and forward to the global error handler.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 *
 * Without this wrapper, a thrown error in an async handler would result in
 * an unhandled promise rejection instead of being caught by the error handler.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;