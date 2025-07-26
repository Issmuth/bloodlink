const express = require('express');
const { protect, requireDonor, optionalAuth } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get list of available donors (public route with optional auth)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { bloodType, location, limit = 20, offset = 0 } = req.query;

    const where = {
      isAvailable: true,
      user: {
        status: 'ACTIVE'
      }
    };

    // Add filters
    if (bloodType) {
      where.bloodType = bloodType.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
    }
    
    if (location) {
      where.user.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    const donors = await prisma.donor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            location: true,
            phone: req.user ? true : false, // Only show phone if authenticated
            telegramUsername: req.user ? true : false,
            createdAt: true
          }
        }
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const total = await prisma.donor.count({ where });

    res.status(200).json({
      success: true,
      data: {
        donors,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get donor statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await prisma.donor.aggregate({
      _count: {
        id: true
      },
      where: {
        user: {
          status: 'ACTIVE'
        }
      }
    });

    const bloodTypeStats = await prisma.donor.groupBy({
      by: ['bloodType'],
      _count: {
        bloodType: true
      },
      where: {
        isAvailable: true,
        user: {
          status: 'ACTIVE'
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDonors: stats._count.id,
        bloodTypeDistribution: bloodTypeStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes - require authentication
router.use(protect);

// Get donor profile (self)
router.get('/profile', requireDonor, async (req, res, next) => {
  try {
    const donorProfile = req.user.donor;
    
    res.status(200).json({
      success: true,
      data: { donor: donorProfile }
    });
  } catch (error) {
    next(error);
  }
});

// Update donor profile
router.put('/profile', requireDonor, async (req, res, next) => {
  try {
    const {
      fullName,
      bloodType,
      dateOfBirth,
      weight,
      emergencyContact,
      medicalNotes
    } = req.body;

    const donorId = req.user.donor.id;

    const updatedDonor = await prisma.donor.update({
      where: { id: donorId },
      data: {
        ...(fullName && { fullName }),
        ...(bloodType && { bloodType: bloodType.replace('+', '_POSITIVE').replace('-', '_NEGATIVE') }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(weight && { weight: parseFloat(weight) }),
        ...(emergencyContact && { emergencyContact }),
        ...(medicalNotes !== undefined && { medicalNotes })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Donor profile updated successfully',
      data: { donor: updatedDonor }
    });
  } catch (error) {
    next(error);
  }
});

// Update availability status
router.put('/availability', requireDonor, async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const donorId = req.user.donor.id;

    if (typeof isAvailable !== 'boolean') {
      return next(new AppError('isAvailable must be a boolean value', 400, 'INVALID_AVAILABILITY'));
    }

    const updatedDonor = await prisma.donor.update({
      where: { id: donorId },
      data: { 
        isAvailable,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: { 
        isAvailable: updatedDonor.isAvailable,
        updatedAt: updatedDonor.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Record a donation
router.post('/donations', requireDonor, async (req, res, next) => {
  try {
    const { donationDate, healthCenterId, notes } = req.body;
    const donorId = req.user.donor.id;

    // Update donor with new donation
    const updatedDonor = await prisma.donor.update({
      where: { id: donorId },
      data: {
        donationCount: {
          increment: 1
        },
        lastDonation: donationDate ? new Date(donationDate) : new Date(),
        isAvailable: false, // Set to unavailable after donation
        ...(notes && { medicalNotes: notes })
      }
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: { donor: updatedDonor }
    });
  } catch (error) {
    next(error);
  }
});

// Get donation history
router.get('/donations', requireDonor, async (req, res, next) => {
  try {
    const donor = req.user.donor;

    res.status(200).json({
      success: true,
      data: {
        donationHistory: {
          totalDonations: donor.donationCount,
          lastDonation: donor.lastDonation,
          canDonateAgain: donor.lastDonation ? 
            new Date() > new Date(donor.lastDonation.getTime() + (56 * 24 * 60 * 60 * 1000)) : // 56 days
            true
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 