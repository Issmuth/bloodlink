const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { hashPassword, comparePassword } = require('../utils/password');
const { 
  createSendToken, 
  refreshAccessToken, 
  logout,
  generatePasswordResetToken 
} = require('../utils/jwt');

// Register new user
const register = async (req, res, next) => {
  try {
    console.log('Registration request body:', req.body); // Debug log
    
    const {
      email,
      password,
      confirmPassword,
      role,
      phone,
      location,
      telegramUsername,
      // Donor fields
      fullName,
      bloodType,
      // Health Center fields
      centerName,
      contactPerson
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(new AppError('User with this email already exists', 400, 'EMAIL_EXISTS'));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
          phone,
          location,
          telegramUsername,
          status: 'PENDING_VERIFICATION'
        }
      });

      // Create role-specific profile
      if (role === 'donor') {
        const donor = await tx.donor.create({
          data: {
            userId: user.id,
            fullName,
            bloodType: bloodType // Now using the bloodType string directly (A+, A-, etc.)
          }
        });
        return { ...user, donor };
      } else if (role === 'health_center') {
        const healthCenter = await tx.healthCenter.create({
          data: {
            userId: user.id,
            centerName,
            contactPerson
          }
        });
        return { ...user, healthCenter };
      }

      return user;
    });

    // Get complete user data with relations
    const newUser = await prisma.user.findUnique({
      where: { id: result.id },
      include: {
        donor: true,
        healthCenter: true
      }
    });

    // Send token
    await createSendToken(newUser, 201, res, 'Registration successful! Please verify your email address.');

  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        donor: true,
        healthCenter: true
      }
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Check password
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Check if role matches (optional role validation)
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return next(new AppError('Invalid role for this account', 401, 'ROLE_MISMATCH'));
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return next(new AppError('Your account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED'));
    }

    if (user.status === 'INACTIVE') {
      return next(new AppError('Your account is inactive. Please contact support.', 403, 'ACCOUNT_INACTIVE'));
    }

    // Send token
    await createSendToken(user, 200, res, 'Login successful!');

  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    console.log('🔄 [REFRESH TOKEN] Starting token refresh...');
    console.log('🔄 [REFRESH TOKEN] Refresh token provided:', !!refreshToken);

    if (!refreshToken) {
      console.error('❌ [REFRESH TOKEN] No refresh token provided in request');
      return next(new AppError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED'));
    }

    console.log('🔄 [REFRESH TOKEN] Calling refreshAccessToken utility...');
    const result = await refreshAccessToken(refreshToken);

    console.log('✅ [REFRESH TOKEN] Token refresh successful:', {
      hasAccessToken: !!result.accessToken,
      userId: result.user?.id,
      userRole: result.user?.role
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        tokenType: result.tokenType,
        expiresIn: result.expiresIn,
        user: result.user
      }
    });

  } catch (error) {
    console.error('❌ [REFRESH TOKEN] Token refresh failed:', {
      message: error.message,
      name: error.name
    });

    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return next(new AppError(error.message, 401, 'INVALID_REFRESH_TOKEN'));
    }
    next(error);
  }
};

// Logout user
const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await logout(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to database
    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt: resetTokenExpires
      }
    });

    // TODO: Send email with reset token
    // For now, we'll just log it (in production, send via email service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      ...(process.env.NODE_ENV === 'development' && { resetToken }) // Only in development
    });

  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find valid reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return next(new AppError('Invalid or expired password reset token', 400, 'INVALID_RESET_TOKEN'));
    }

    if (resetToken.used) {
      return next(new AppError('This password reset token has already been used', 400, 'TOKEN_ALREADY_USED'));
    }

    if (resetToken.expiresAt < new Date()) {
      return next(new AppError('Password reset token has expired', 400, 'TOKEN_EXPIRED'));
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and mark token as used
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword }
      });

      await tx.passwordReset.update({
        where: { token },
        data: { used: true }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    next(error);
  }
};

// Change password (for authenticated users)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isCurrentPasswordCorrect = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return next(new AppError('Current password is incorrect', 400, 'INCORRECT_CURRENT_PASSWORD'));
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    // Remove password from response
    const { password, ...userProfile } = user;

    res.status(200).json({
      success: true,
      data: { user: userProfile }
    });

  } catch (error) {
    next(error);
  }
};

// Verify email (placeholder for email verification feature)
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // TODO: Implement email verification logic
    // This would typically involve checking a verification token
    
    res.status(200).json({
      success: true,
      message: 'Email verification feature coming soon'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout: logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  verifyEmail
}; 