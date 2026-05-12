const { env } = require('./env');

// CORS configuration — supports multiple origins for dev + production deployment.
// In production/CI, set FRONTEND_URL to your deployed frontend URL.
// You can also set comma-separated values (e.g., "http://localhost:3000,https://your-app.vercel.app").

const getAllowedOrigins = () => {
  const urls = (env.FRONTEND_URL || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length === 0) {
    return ['http://localhost:3000'];
  }

  return urls;
};

const corsConfig = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();

    // Allow requests with no origin (e.g., Postman, server-to-server, curl)
    if (!origin) return callback(null, true);

    if (allowed.includes(origin) || allowed.includes('*')) {
      return callback(null, true);
    }

    // In development, allow any localhost origin
    if (env.NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours preflight cache
};

module.exports = corsConfig;