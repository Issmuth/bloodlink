const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { sendTelegramNotification } = require('../services/telegramService');

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

// Validation rules for linking Telegram account
const validateTelegramLink = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  
  body('telegram_id')
    .notEmpty()
    .withMessage('Telegram ID is required')
    .isNumeric()
    .withMessage('Telegram ID must be numeric')
    .isLength({ min: 5, max: 20 })
    .withMessage('Telegram ID must be between 5 and 20 digits')
];

// GET /api/telegram/deep-link/:userId - Generate deep link for Telegram bot
router.get('/deep-link/:userId', async (req, res, next) => {
  console.log('🔗 [TELEGRAM DEEP LINK] Generating deep link...');
  
  try {
    const { userId } = req.params;
    
    console.log('🔗 [TELEGRAM DEEP LINK] Request for user:', { userId });

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        telegramChatId: true
      }
    });

    if (!user) {
      console.error('❌ [TELEGRAM DEEP LINK] User not found:', { userId });
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    console.log('✅ [TELEGRAM DEEP LINK] User found:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      alreadyLinked: !!user.telegramChatId
    });

    // Generate deep link
    const deepLink = `https://t.me/ecomerceetBot?start=${userId}`;
    
    console.log('✅ [TELEGRAM DEEP LINK] Deep link generated:', {
      userId,
      deepLink,
      isAlreadyLinked: !!user.telegramChatId
    });

    res.status(200).json({
      success: true,
      message: user.telegramChatId ? 
        'Telegram account already linked. You can still use this link to reconnect.' : 
        'Deep link generated successfully. Click the link to connect your Telegram account.',
      data: {
        deep_link: deepLink,
        bot_username: '@ecomerceetBot',
        user_id: userId,
        is_already_linked: !!user.telegramChatId,
        instructions: 'Click the link to open Telegram and start the bot with your user ID.'
      }
    });

  } catch (error) {
    console.error('❌ [TELEGRAM DEEP LINK] Error generating deep link:', {
      message: error.message,
      code: error.code
    });

    next(error);
  }
});

// POST /api/link-telegram - Link user account with Telegram
router.post('/link-telegram', validateTelegramLink, handleValidationErrors, async (req, res, next) => {
  console.log('🔗 [TELEGRAM LINK] Starting Telegram account linking...');
  
  try {
    const { user_id, telegram_id } = req.body;
    
    console.log('🔗 [TELEGRAM LINK] Request data:', {
      user_id,
      telegram_id,
      telegram_id_type: typeof telegram_id
    });

    // Convert telegram_id to string for storage
    const telegramChatId = telegram_id.toString();

    // Check if user exists
    console.log('🔗 [TELEGRAM LINK] Looking up user...');
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        email: true,
        role: true,
        telegramChatId: true,
        telegramUsername: true
      }
    });

    if (!user) {
      console.error('❌ [TELEGRAM LINK] User not found:', { user_id });
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    console.log('✅ [TELEGRAM LINK] User found:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      currentTelegramChatId: user.telegramChatId
    });

    // Check if this Telegram ID is already linked to another user
    console.log('🔗 [TELEGRAM LINK] Checking for existing Telegram linkage...');
    const existingTelegramUser = await prisma.user.findFirst({
      where: {
        telegramChatId: telegramChatId,
        id: { not: user_id } // Exclude current user
      },
      select: { id: true, email: true }
    });

    if (existingTelegramUser) {
      console.error('❌ [TELEGRAM LINK] Telegram ID already linked to another user:', {
        telegram_id: telegramChatId,
        existing_user_id: existingTelegramUser.id,
        existing_user_email: existingTelegramUser.email
      });
      return next(new AppError('This Telegram account is already linked to another user', 409, 'TELEGRAM_ALREADY_LINKED'));
    }

    // Update user with Telegram chat ID
    console.log('🔗 [TELEGRAM LINK] Updating user with Telegram chat ID...');
    const updatedUser = await prisma.user.update({
      where: { id: user_id },
      data: { 
        telegramChatId: telegramChatId,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        role: true,
        telegramChatId: true,
        telegramUsername: true
      }
    });

    console.log('✅ [TELEGRAM LINK] Telegram account linked successfully:', {
      userId: updatedUser.id,
      telegramChatId: updatedUser.telegramChatId,
      previousChatId: user.telegramChatId
    });

    res.status(200).json({
      status: 'success',
      message: 'Telegram account linked successfully',
      data: {
        user_id: updatedUser.id,
        telegram_chat_id: updatedUser.telegramChatId,
        linked_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [TELEGRAM LINK] Database error:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });

    // Handle specific database errors
    if (error.code === 'P2025') {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    next(error);
  }
});

// GET /api/telegram/test-broadcast - Test endpoint for sending broadcast
router.get('/test-broadcast', async (req, res, next) => {
  console.log('📢 [TELEGRAM TEST] Starting test broadcast...');
  
  try {
    // Get a few users with Telegram chat IDs for testing
    const testUsers = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        telegramChatId: true,
        role: true
      },
      take: 5
    });

    console.log('📢 [TELEGRAM TEST] Found test users:', {
      count: testUsers.length,
      users: testUsers.map(u => ({ id: u.id, role: u.role, hasTelegram: !!u.telegramChatId }))
    });

    if (testUsers.length === 0) {
      return res.status(200).json({
        status: 'info',
        message: 'No users with linked Telegram accounts found for testing',
        users_notified: 0
      });
    }

    const testMessage = "🩸 TEST: This is a test message from BloodLink platform! Your Telegram account is successfully linked.";
    
    const result = await sendTelegramNotification(testUsers, testMessage);

    console.log('✅ [TELEGRAM TEST] Test broadcast completed:', result);

    res.status(200).json({
      status: 'success',
      message: 'Test broadcast sent successfully',
      ...result
    });

  } catch (error) {
    console.error('❌ [TELEGRAM TEST] Test broadcast failed:', error);
    next(error);
  }
});

// POST /api/telegram/notify-blood-request - Send notifications for new blood request
router.post('/notify-blood-request', async (req, res, next) => {
  console.log('📢 [BLOOD REQUEST NOTIFY] Starting blood request notification...');
  
  try {
    const { bloodRequestId } = req.body;
    
    if (!bloodRequestId) {
      return next(new AppError('Blood request ID is required', 400, 'BLOOD_REQUEST_ID_REQUIRED'));
    }

    console.log('📢 [BLOOD REQUEST NOTIFY] Looking up blood request:', { bloodRequestId });

    // Get blood request details
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: bloodRequestId },
      include: {
        healthCenter: {
          include: {
            user: {
              select: {
                phone: true,
                location: true,
                telegramUsername: true
              }
            }
          }
        }
      }
    });

    if (!bloodRequest) {
      console.error('❌ [BLOOD REQUEST NOTIFY] Blood request not found:', { bloodRequestId });
      return next(new AppError('Blood request not found', 404, 'BLOOD_REQUEST_NOT_FOUND'));
    }

    console.log('✅ [BLOOD REQUEST NOTIFY] Blood request found:', {
      id: bloodRequest.id,
      bloodType: bloodRequest.bloodType,
      urgency: bloodRequest.urgency,
      unitsNeeded: bloodRequest.unitsNeeded,
      healthCenter: bloodRequest.healthCenter.centerName
    });

    // Find eligible donors
    console.log('📢 [BLOOD REQUEST NOTIFY] Finding eligible donors...');
    const eligibleUsers = await prisma.user.findMany({
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

    console.log('📢 [BLOOD REQUEST NOTIFY] Found eligible donors:', {
      count: eligibleUsers.length,
      bloodTypeNeeded: bloodRequest.bloodType
    });

    if (eligibleUsers.length === 0) {
      return res.status(200).json({
        status: 'info',
        message: 'No eligible donors with linked Telegram accounts found',
        users_notified: 0
      });
    }

    // Create notification message
    const urgencyEmoji = {
      'Emergency': '🚨',
      'High': '⚠️',
      'Normal': '🩸'
    };

    const message = `${urgencyEmoji[bloodRequest.urgency] || '🩸'} BLOOD NEEDED!

🏥 Health Center: ${bloodRequest.healthCenter.centerName}
🩸 Blood Type: ${bloodRequest.bloodType}
📊 Units Needed: ${bloodRequest.unitsNeeded}
⏰ Urgency: ${bloodRequest.urgency}
🏠 Location: ${bloodRequest.healthCenter.user.location}

${bloodRequest.procedure ? `📋 Procedure: ${bloodRequest.procedure}` : ''}

If you're available to donate, please contact the health center immediately!

Thank you for being a life-saver! ❤️`;

    // Send notifications
    const result = await sendTelegramNotification(eligibleUsers, message);

    console.log('✅ [BLOOD REQUEST NOTIFY] Notifications sent:', result);

    res.status(200).json({
      status: 'success',
      message: 'Blood request notifications sent successfully',
      blood_request_id: bloodRequestId,
      eligible_donors: eligibleUsers.length,
      ...result
    });

  } catch (error) {
    console.error('❌ [BLOOD REQUEST NOTIFY] Notification failed:', error);
    next(error);
  }
});

module.exports = router; 