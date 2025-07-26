const express = require('express');
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  verifyEmail
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  handleValidationErrors
} = require('../validators/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/refresh', validateRefreshToken, handleValidationErrors, refresh);
router.post('/logout', logout);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes (authentication required)
router.use(protect); // All routes after this middleware require authentication

router.get('/profile', getProfile);
router.put('/change-password', validateChangePassword, handleValidationErrors, changePassword);

module.exports = router; 