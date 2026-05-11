/**
 * Shared constants and enums.
 * Mirrors Prisma enums for use in validation and business logic.
 */

// Recipe difficulty levels
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Recipe source types
const RECIPE_SOURCES = ['MANUAL', 'AI_GENERATED', 'IMPORTED'];

// Pantry item categories
const PANTRY_CATEGORIES = [
  'Proteins',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'OilsAndCondiments',
  'Spices',
  'Other',
];

// Days of the week
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Meal types
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Shopping list categories
const SHOPPING_CATEGORIES = ['Produce', 'Dairy', 'Proteins', 'Pantry', 'Other'];

// Generation status
const GENERATION_STATUSES = ['GENERATED', 'SAVED', 'DISCARDED'];

// Common measurement units
const UNITS = ['g', 'kg', 'ml', 'L', 'pieces', 'tbsp', 'tsp', 'cup', 'serving', 'oz', 'lb'];

// Pagination defaults
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Sort directions
const SORT_DIRECTIONS = ['asc', 'desc'];

// Allowed mimetypes for image uploads
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Bcrypt salt rounds
const BCRYPT_SALT_ROUNDS = 12;

module.exports = {
  DIFFICULTIES,
  RECIPE_SOURCES,
  PANTRY_CATEGORIES,
  DAYS_OF_WEEK,
  MEAL_TYPES,
  SHOPPING_CATEGORIES,
  GENERATION_STATUSES,
  UNITS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  SORT_DIRECTIONS,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  BCRYPT_SALT_ROUNDS,
};