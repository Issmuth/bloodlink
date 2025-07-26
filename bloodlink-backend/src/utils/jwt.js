const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { prisma } = require('../config/database');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Generate refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

// Create and send JWT token
const createSendToken = async (user, statusCode, res, message = 'Success') => {
  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  // Save refresh token to database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Update user's last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Remove password from output
  const userResponse = {
    id: user.id,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    telegramUsername: user.telegramUsername,
    status: user.status,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };

  // Add role-specific data
  if (user.donor) {
    userResponse.donor = user.donor;
  }
  if (user.healthCenter) {
    userResponse.healthCenter = user.healthCenter;
  }

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userResponse,
      tokens: {
        accessToken: token,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    },
  });
};

// Verify refresh token
const verifyRefreshToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in database
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { token },
      });
      throw new Error('Refresh token expired');
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        donor: true,
        healthCenter: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const newAccessToken = signToken(user.id);

    return {
      accessToken: newAccessToken,
      user,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN,
    };
  } catch (error) {
    throw error;
  }
};

// Logout - remove refresh token
const logout = async (refreshToken) => {
  try {
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    return true;
  } catch (error) {
    // Token might not exist, which is fine for logout
    return true;
  }
};

// Clean up expired refresh tokens
const cleanupExpiredTokens = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`🧹 Cleaned up ${result.count} expired refresh tokens`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

// Generate password reset token
const generatePasswordResetToken = () => {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  return resetToken;
};

module.exports = {
  signToken,
  signRefreshToken,
  createSendToken,
  verifyRefreshToken,
  refreshAccessToken,
  logout,
  cleanupExpiredTokens,
  generatePasswordResetToken,
}; 