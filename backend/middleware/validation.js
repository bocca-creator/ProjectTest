const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .trim(),
  body('profile.steamId')
    .optional()
    .matches(/^\d{17}$/)
    .withMessage('Steam ID must be 17 digits'),
  body('profile.discordId')
    .optional()
    .matches(/^\d{17,19}$/)
    .withMessage('Discord ID must be 17-19 digits'),
  body('profile.preferences.theme')
    .optional()
    .isIn(['darkNeon', 'retroPixel', 'minimalistLight', 'cyberRed'])
    .withMessage('Invalid theme selection'),
  body('profile.preferences.language')
    .optional()
    .isIn(['en', 'uk'])
    .withMessage('Invalid language selection'),
  handleValidationErrors
];

// Announcement validation rules
const validateAnnouncement = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters')
    .trim(),
  body('type')
    .isIn(['maintenance', 'tournament', 'update', 'event', 'security', 'general'])
    .withMessage('Invalid announcement type'),
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('Pinned must be a boolean value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return tags.every(tag => typeof tag === 'string' && tag.length <= 30);
    })
    .withMessage('Each tag must be a string with maximum 30 characters'),
  body('metadata.priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid publish date format'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters')
    .trim(),
  body('category')
    .optional()
    .isIn(['general', 'servers', 'community', 'events', 'support'])
    .withMessage('Invalid review category'),
  body('metadata.gameMode')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Game mode cannot exceed 50 characters')
    .trim(),
  body('metadata.serverName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Server name cannot exceed 100 characters')
    .trim(),
  body('metadata.platform')
    .optional()
    .isIn(['PC', 'PlayStation', 'Xbox', 'Mobile', 'Other'])
    .withMessage('Invalid platform'),
  body('metadata.playtime')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Playtime must be a positive number'),
  handleValidationErrors
];

// Contact/Ticket validation rules
const validateContact = [
  body('user.name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('user.email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters')
    .trim(),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .trim(),
  body('category')
    .isIn(['general', 'technical', 'account', 'report', 'appeal', 'suggestion', 'billing'])
    .withMessage('Invalid ticket category'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

const validateTicketResponse = [
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Response message must be between 1 and 2000 characters')
    .trim(),
  handleValidationErrors
];

const validateTicketStatusUpdate = [
  body('status')
    .isIn(['open', 'in-progress', 'waiting-response', 'resolved', 'closed'])
    .withMessage('Invalid ticket status'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim(),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'rating', 'likes', 'views', 'title'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Sort order must be asc/desc or 1/-1'),
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

const validatePasswordResetConfirm = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  handleValidationErrors
];

// Change password validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? Object.values(req.files).flat() : [req.file];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size too large. Maximum allowed size is ${Math.round(maxSize / (1024 * 1024))}MB`
        });
      }

      // Check file type
      if (allowedTypes.length && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
    }

    next();
  };
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateAnnouncement,
  validateReview,
  validateContact,
  validateTicketResponse,
  validateTicketStatusUpdate,
  validatePagination,
  validateObjectId,
  validateSearch,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validatePasswordChange,
  validateFileUpload
};