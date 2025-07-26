const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { protect } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errorMessages));
  }
  next();
};

// Validation rules for creating blood request
const validateBloodRequest = [
  body('bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood type'),

  body('unitsNeeded')
    .isInt({ min: 1, max: 10 })
    .withMessage('Units needed must be between 1 and 10'),

  body('urgency')
    .isIn(['Normal', 'High', 'Emergency'])
    .withMessage('Urgency must be Normal, High, or Emergency'),

  body('procedure')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Procedure/reason must be between 3 and 200 characters'),

  body('patientAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Patient age must be between 0 and 120'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('expectedTimeframe')
    .isIn(['within-2h', 'within-6h', 'within-24h', 'within-3d', 'within-week'])
    .withMessage('Invalid timeframe selection'),

  body('contactPreference')
    .isIn(['telegram', 'phone', 'both'])
    .withMessage('Contact preference must be telegram, phone, or both')
];

// Middleware to ensure user is health center
const requireHealthCenter = (req, res, next) => {
  console.log('🏥 [HEALTH CENTER CHECK] Checking if user is health center...');
  console.log('🏥 [HEALTH CENTER CHECK] User data:', {
    id: req.user?.id,
    email: req.user?.email,
    role: req.user?.role,
    hasHealthCenter: !!req.user?.healthCenter,
    healthCenterId: req.user?.healthCenter?.id,
    centerName: req.user?.healthCenter?.centerName
  });

  if (req.user.role !== 'HEALTH_CENTER') {
    console.error('❌ [HEALTH CENTER CHECK] Access denied - user role is not HEALTH_CENTER:', {
      userRole: req.user.role,
      userId: req.user.id
    });
    return next(new AppError('Access denied. Health center role required.', 403, 'ACCESS_DENIED'));
  }

  console.log('✅ [HEALTH CENTER CHECK] User role verified as HEALTH_CENTER');
  next();
};

// All routes require authentication
router.use(protect);

// CREATE - Post new blood request
router.post('/', requireHealthCenter, validateBloodRequest, handleValidationErrors, async (req, res, next) => {
  console.log('🩸 [BLOOD REQUEST CREATE] Starting request creation...');
  console.log('🩸 [BLOOD REQUEST CREATE] User:', {
    id: req.user?.id,
    email: req.user?.email,
    role: req.user?.role,
    hasHealthCenter: !!req.user?.healthCenter
  });
  console.log('🩸 [BLOOD REQUEST CREATE] Request body:', req.body);

  try {
    const {
      bloodType,
      unitsNeeded,
      urgency,
      procedure,
      patientAge,
      notes,
      expectedTimeframe,
      contactPreference
    } = req.body;

    console.log('🩸 [BLOOD REQUEST CREATE] Searching for health center profile...');

    // Get health center info
    const healthCenter = await prisma.healthCenter.findUnique({
      where: { userId: req.user.id },
      include: { user: true }
    });

    if (!healthCenter) {
      console.error('❌ [BLOOD REQUEST CREATE] Health center profile not found for user:', {
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role
      });
      return next(new AppError('Health center profile not found. Please complete your profile setup.', 404, 'PROFILE_NOT_FOUND'));
    }

    console.log('✅ [BLOOD REQUEST CREATE] Health center found:', {
      id: healthCenter.id,
      centerName: healthCenter.centerName,
      contactPerson: healthCenter.contactPerson
    });

    // Calculate expected fulfillment date based on timeframe
    const calculateExpectedDate = (timeframe) => {
      const now = new Date();
      switch (timeframe) {
        case 'within-2h':
          return new Date(now.getTime() + 2 * 60 * 60 * 1000);
        case 'within-6h':
          return new Date(now.getTime() + 6 * 60 * 60 * 1000);
        case 'within-24h':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case 'within-3d':
          return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        case 'within-week':
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }
    };

    const expectedFulfillmentDate = calculateExpectedDate(expectedTimeframe);
    console.log('🩸 [BLOOD REQUEST CREATE] Expected fulfillment date calculated:', expectedFulfillmentDate);

    // Prepare blood request data
    const bloodRequestData = {
      healthCenterId: healthCenter.id,
      bloodType,
      unitsNeeded,
      unitsReceived: 0,
      urgency,
      procedure,
      patientAge,
      notes,
      expectedTimeframe,
      expectedFulfillmentDate,
      contactPreference,
      status: 'ACTIVE'
    };

    console.log('🩸 [BLOOD REQUEST CREATE] Creating blood request with data:', bloodRequestData);

    // Create blood request
    const bloodRequest = await prisma.bloodRequest.create({
      data: bloodRequestData,
      include: {
        healthCenter: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                location: true,
                telegramUsername: true
              }
            }
          }
        }
      }
    });

    console.log('✅ [BLOOD REQUEST CREATE] Blood request created successfully:', {
      id: bloodRequest.id,
      bloodType: bloodRequest.bloodType,
      unitsNeeded: bloodRequest.unitsNeeded,
      urgency: bloodRequest.urgency,
      status: bloodRequest.status
    });

    // Send notifications to eligible donors
    console.log('📧 [BLOOD REQUEST CREATE] Sending notifications to eligible donors...');
    try {
      const { sendTelegramNotification } = require('../services/telegramService');

      // Find eligible donors with Telegram accounts
      const eligibleDonors = await prisma.user.findMany({
        where: {
          role: 'DONOR',
          status: 'ACTIVE',
          telegramChatId: { not: null },
          donor: {
            bloodType: bloodRequest.bloodType,
            isAvailable: true
          }
        },
        include: {
          donor: {
            select: {
              fullName: true,
              bloodType: true,
              isAvailable: true
            }
          }
        },
        take: 50 // Limit to prevent spam
      });

      console.log('📧 [BLOOD REQUEST CREATE] Found eligible donors:', {
        count: eligibleDonors.length,
        bloodTypeNeeded: bloodRequest.bloodType
      });

      if (eligibleDonors.length > 0) {
        // Create notification message
        const urgencyEmoji = {
          'Emergency': '🚨',
          'High': '⚠️',
          'Normal': '🩸'
        };

        const notificationMessage = `${urgencyEmoji[bloodRequest.urgency] || '🩸'} BLOOD NEEDED!

🏥 Health Center: ${healthCenter.centerName}
🩸 Blood Type: ${bloodRequest.bloodType}
📊 Units Needed: ${bloodRequest.unitsNeeded}
⏰ Urgency: ${bloodRequest.urgency}
🏠 Location: ${healthCenter.user.location}

${bloodRequest.procedure ? `📋 Procedure: ${bloodRequest.procedure}` : ''}

If you're available to donate, please contact the health center immediately!

Thank you for being a life-saver! ❤️`;

        // Send notifications
        const notificationResult = await sendTelegramNotification(eligibleDonors, notificationMessage);

        console.log('✅ [BLOOD REQUEST CREATE] Telegram notifications sent:', notificationResult);
      } else {
        console.log('ℹ️ [BLOOD REQUEST CREATE] No eligible donors with Telegram accounts found');
      }
    } catch (notificationError) {
      // Don't fail the blood request creation if notifications fail
      console.error('❌ [BLOOD REQUEST CREATE] Notification failed (non-critical):', {
        message: notificationError.message,
        stack: notificationError.stack
      });
    }

    const responseData = {
      success: true,
      message: 'Blood request created successfully. Eligible donors will be notified.',
      data: {
        bloodRequest: {
          id: bloodRequest.id,
          bloodType: bloodRequest.bloodType,
          unitsNeeded: bloodRequest.unitsNeeded,
          urgency: bloodRequest.urgency,
          procedure: bloodRequest.procedure,
          status: bloodRequest.status,
          createdAt: bloodRequest.createdAt,
          expectedFulfillmentDate: bloodRequest.expectedFulfillmentDate
        }
      }
    };

    console.log('✅ [BLOOD REQUEST CREATE] Sending success response:', responseData);
    res.status(201).json(responseData);

  } catch (error) {
    console.error('❌ [BLOOD REQUEST CREATE] Database or processing error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });

    // Check for specific database errors
    if (error.code === 'P2002') {
      console.error('❌ [BLOOD REQUEST CREATE] Unique constraint violation:', error.meta);
      return next(new AppError('Duplicate request detected. Please try again.', 400, 'DUPLICATE_REQUEST'));
    }

    if (error.code === 'P2003') {
      console.error('❌ [BLOOD REQUEST CREATE] Foreign key constraint violation:', error.meta);
      return next(new AppError('Invalid health center reference. Please contact support.', 400, 'INVALID_REFERENCE'));
    }

    if (error.code === 'P2025') {
      console.error('❌ [BLOOD REQUEST CREATE] Record not found:', error.meta);
      return next(new AppError('Required data not found. Please refresh and try again.', 404, 'RECORD_NOT_FOUND'));
    }

    // Generic error
    console.error('❌ [BLOOD REQUEST CREATE] Unexpected error:', error);
    next(error);
  }
});

// READ - Get all requests for current health center
router.get('/', requireHealthCenter, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get health center
    const healthCenter = await prisma.healthCenter.findUnique({
      where: { userId: req.user.id }
    });

    if (!healthCenter) {
      return next(new AppError('Health center profile not found', 404, 'PROFILE_NOT_FOUND'));
    }

    // Build where clause
    const where = {
      healthCenterId: healthCenter.id,
      ...(status && { status: status.toUpperCase() })
    };

    // Get requests with pagination
    const [requests, totalCount] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: offset,
        include: {
          responses: {
            include: {
              donor: {
                include: {
                  user: {
                    select: {
                      phone: true,
                      telegramUsername: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.bloodRequest.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + requests.length < totalCount,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// READ - Get single request by ID
router.get('/:id', requireHealthCenter, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get health center
    const healthCenter = await prisma.healthCenter.findUnique({
      where: { userId: req.user.id }
    });

    if (!healthCenter) {
      return next(new AppError('Health center profile not found', 404, 'PROFILE_NOT_FOUND'));
    }

    const bloodRequest = await prisma.bloodRequest.findFirst({
      where: {
        id,
        healthCenterId: healthCenter.id
      },
      include: {
        healthCenter: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                location: true,
                telegramUsername: true
              }
            }
          }
        },
        responses: {
          include: {
            donor: {
              include: {
                user: {
                  select: {
                    phone: true,
                    telegramUsername: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!bloodRequest) {
      return next(new AppError('Blood request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: { bloodRequest }
    });

  } catch (error) {
    next(error);
  }
});

// UPDATE - Update request status or details
router.put('/:id', requireHealthCenter, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Get health center
    const healthCenter = await prisma.healthCenter.findUnique({
      where: { userId: req.user.id }
    });

    if (!healthCenter) {
      return next(new AppError('Health center profile not found', 404, 'PROFILE_NOT_FOUND'));
    }

    // Check if request exists and belongs to this health center
    const existingRequest = await prisma.bloodRequest.findFirst({
      where: {
        id,
        healthCenterId: healthCenter.id
      }
    });

    if (!existingRequest) {
      return next(new AppError('Blood request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    // Update request
    const updatedRequest = await prisma.bloodRequest.update({
      where: { id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Blood request updated successfully',
      data: { bloodRequest: updatedRequest }
    });

  } catch (error) {
    next(error);
  }
});

// DELETE - Archive/cancel request
router.delete('/:id', requireHealthCenter, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get health center
    const healthCenter = await prisma.healthCenter.findUnique({
      where: { userId: req.user.id }
    });

    if (!healthCenter) {
      return next(new AppError('Health center profile not found', 404, 'PROFILE_NOT_FOUND'));
    }

    // Check if request exists and belongs to this health center
    const existingRequest = await prisma.bloodRequest.findFirst({
      where: {
        id,
        healthCenterId: healthCenter.id
      }
    });

    if (!existingRequest) {
      return next(new AppError('Blood request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    // Archive instead of hard delete
    await prisma.bloodRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully'
    });

  } catch (error) {
    next(error);
  }
});

// READ - Get all requests for donors
router.get('/donor', async (req, res, next) => {
  try {
    const { bloodType, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(bloodType && { bloodType: bloodType.toUpperCase() })
    };

    // Get requests with pagination
    const [requests, totalCount] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: offset,
      }),
      prisma.bloodRequest.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + requests.length < totalCount,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;