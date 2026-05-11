/**
 * Simple pagination helper.
 * Computes offset/limit from page params.
 *
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
const getPagination = (page = 1, limit = 20) => {
  const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('./constants');

  const p = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));

  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
};

/**
 * Builds pagination metadata for response.
 */
const buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { getPagination, buildMeta };