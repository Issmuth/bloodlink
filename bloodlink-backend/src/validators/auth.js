const { body, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');

// Validation rules for user registration
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  body('role')
    .isIn(['donor', 'health_center'])
    .withMessage('Role must be either donor or health_center'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('telegramUsername')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Telegram username must not exceed 50 characters'),
  
  // Donor-specific validations
  body('fullName')
    .if(body('role').equals('donor'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('bloodType')
    .if(body('role').equals('donor'))
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood type'),
  
  // Health Center-specific validations
  body('centerName')
    .if(body('role').equals('health_center'))
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Health center name must be between 2 and 200 characters'),
  
  body('contactPerson')
    .if(body('role').equals('health_center'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person name must be between 2 and 100 characters'),
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('role')
    .optional()
    .isIn(['donor', 'health_center'])
    .withMessage('Role must be either donor or health_center'),
];

// Validation rules for forgot password
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Validation rules for reset password
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Password reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

// Validation rules for change password
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

// Validation rules for refresh token
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors found:', errors.array()); // Debug log
    console.log('Request body that failed validation:', req.body); // Debug log
    
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errorMessages));
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  handleValidationErrors,
}; 