// server/src/middleware/upload.js
// Multer configuration for file uploads (food photos, receipt scans, etc.)
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { env } = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Create a multer upload middleware for a specific folder.
 * @param {string} folder - Subfolder under uploads/ (e.g., 'calories', 'pantry', 'scanner')
 * @returns {multer.Instance}
 */
const createUploader = (folder = 'general') => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(env.UPLOAD_DIR, folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: env.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
      }
    },
  });
};

// Pre-configured uploaders
const uploadPantry = createUploader('pantry');
const uploadCalories = createUploader('calories');
const uploadScanner = createUploader('scanner');

module.exports = { createUploader, uploadPantry, uploadCalories, uploadScanner };