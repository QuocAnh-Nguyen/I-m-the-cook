// server/src/middleware/auth.js
// JWT authentication middleware — attaches req.userId and req.user
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { env } = require('../config/env');
const { sendError } = require('../utils/apiResponse');

const prisma = new PrismaClient();

/**
 * Authenticate a request by verifying the JWT Bearer token.
 * On success, attaches req.userId and req.user.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401);
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401);
    }
    next(err);
  }
};

module.exports = { authenticate };