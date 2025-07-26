const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { prisma } = require('../config/database');
const { AppError } = require('./errorHandler');

// Middleware to protect routes - requires valid JWT
const protect = async (req, res, next) => {
  console.log('🔐 [AUTH] Starting authentication check...');
  console.log('🔐 [AUTH] Request headers:', {
    authorization: req.headers.authorization ? `${req.headers.authorization.substring(0, 20)}...` : 'NOT_PROVIDED',
    userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
    origin: req.headers.origin
  });

  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 [AUTH] Token extracted from header:', token ? `${token.substring(0, 20)}...` : 'EMPTY');
    }

    if (!token) {
      console.error('❌ [AUTH] No token provided in request');
      return next(new AppError('You are not logged in! Please log in to get access.', 401, 'NOT_AUTHENTICATED'));
    }

    console.log('🔐 [AUTH] JWT_SECRET available:', !!process.env.JWT_SECRET);
    console.log('🔐 [AUTH] Verifying token...');

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH] Token verified successfully:', {
      userId: decoded.id,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString(),
      timeUntilExpiry: Math.round((decoded.exp * 1000 - Date.now()) / (1000 * 60)) + ' minutes'
    });

    // 3) Check if user still exists
    console.log('🔐 [AUTH] Looking up user in database...');
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        donor: true,
        healthCenter: true
      }
    });

    if (!currentUser) {
      console.error('❌ [AUTH] User not found in database:', { userId: decoded.id });
      return next(new AppError('The user belonging to this token does no longer exist.', 401, 'USER_NOT_FOUND'));
    }

    console.log('✅ [AUTH] User found:', {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
      hasDonor: !!currentUser.donor,
      hasHealthCenter: !!currentUser.healthCenter
    });

    // 4) Check if user is active
    if (currentUser.status === 'SUSPENDED') {
      console.error('❌ [AUTH] User account is suspended:', { userId: currentUser.id });
      return next(new AppError('Your account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED'));
    }

    if (currentUser.status === 'INACTIVE') {
      console.error('❌ [AUTH] User account is inactive:', { userId: currentUser.id });
      return next(new AppError('Your account is inactive. Please contact support.', 403, 'ACCOUNT_INACTIVE'));
    }

    // 5) Grant access to protected route
    console.log('✅ [AUTH] Authentication successful, granting access');
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ [AUTH] Invalid JWT token');
      return next(new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN'));
    }

    if (error.name === 'TokenExpiredError') {
      console.error('❌ [AUTH] JWT token expired:', {
        expiredAt: error.expiredAt,
        now: new Date().toISOString()
      });
      return next(new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }

    if (error.name === 'NotBeforeError') {
      console.error('❌ [AUTH] JWT token not active yet');
      return next(new AppError('Token not active yet. Please try again.', 401, 'TOKEN_NOT_ACTIVE'));
    }

    next(error);
  }
};

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'INSUFFICIENT_PERMISSIONS'));
    }
    next();
  };
};

// Middleware to check if user is a donor
const requireDonor = (req, res, next) => {
  if (req.user.role !== 'DONOR') {
    return next(new AppError('This action is only available to donors', 403, 'DONOR_ONLY'));
  }
  if (!req.user.donor) {
    return next(new AppError('Donor profile not found', 404, 'DONOR_PROFILE_NOT_FOUND'));
  }
  next();
};

// Middleware to check if user is a health center
const requireHealthCenter = (req, res, next) => {
  if (req.user.role !== 'HEALTH_CENTER') {
    return next(new AppError('This action is only available to health centers', 403, 'HEALTH_CENTER_ONLY'));
  }
  if (!req.user.healthCenter) {
    return next(new AppError('Health center profile not found', 404, 'HEALTH_CENTER_PROFILE_NOT_FOUND'));
  }
  next();
};

// Middleware to check if user's email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(new AppError('Please verify your email address to access this feature', 403, 'EMAIL_NOT_VERIFIED'));
  }
  next();
};

// Middleware to check if health center is verified
const requireHealthCenterVerification = (req, res, next) => {
  if (req.user.role === 'HEALTH_CENTER' && !req.user.healthCenter.verified) {
    return next(new AppError('Your health center needs to be verified to access this feature', 403, 'HEALTH_CENTER_NOT_VERIFIED'));
  }
  next();
};

// Optional authentication - doesn't throw error if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        donor: true,
        healthCenter: true
      }
    });

    if (currentUser && currentUser.status === 'ACTIVE') {
      req.user = currentUser;
    }

    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    next();
  }
};

module.exports = {
  protect,
  restrictTo,
  requireDonor,
  requireHealthCenter,
  requireEmailVerification,
  requireHealthCenterVerification,
  optionalAuth
}; 