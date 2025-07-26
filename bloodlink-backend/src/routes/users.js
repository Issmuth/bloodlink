const express = require('express');
const { protect } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const { password, ...userProfile } = req.user;
    
    res.status(200).json({
      success: true,
      data: { user: userProfile }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { phone, location, telegramUsername } = req.body;
    const userId = req.user.id;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(phone && { phone }),
        ...(location && { location }),
        ...(telegramUsername !== undefined && { telegramUsername })
      },
      include: {
        donor: true,
        healthCenter: true
      }
    });

    // Remove password from response
    const { password, ...userProfile } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userProfile }
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    let stats = {};

    if (req.user.role === 'DONOR') {
      stats = {
        donationCount: req.user.donor.donationCount,
        lastDonation: req.user.donor.lastDonation,
        isAvailable: req.user.donor.isAvailable,
        bloodType: req.user.donor.bloodType
      };
    } else if (req.user.role === 'HEALTH_CENTER') {
      // Add health center specific stats
      stats = {
        verified: req.user.healthCenter.verified,
        centerType: req.user.healthCenter.centerType,
        capacity: req.user.healthCenter.capacity
      };
    }

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/account', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Soft delete - change status to inactive
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'INACTIVE',
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 