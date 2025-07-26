const express = require('express');
const { protect, requireHealthCenter, optionalAuth } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get list of health centers (public route with optional auth)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { location, verified, limit = 20, offset = 0 } = req.query;

    const where = {
      user: {
        status: 'ACTIVE'
      }
    };

    // Add filters
    if (location) {
      where.user.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (verified === 'true') {
      where.verified = true;
    }

    const healthCenters = await prisma.healthCenter.findMany({
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
        verified: 'desc', // Show verified centers first
        updatedAt: 'desc'
      }
    });

    const total = await prisma.healthCenter.count({ where });

    res.status(200).json({
      success: true,
      data: {
        healthCenters,
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

// Get health center statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await prisma.healthCenter.aggregate({
      _count: {
        id: true
      },
      where: {
        user: {
          status: 'ACTIVE'
        }
      }
    });

    const verifiedStats = await prisma.healthCenter.groupBy({
      by: ['verified'],
      _count: {
        verified: true
      },
      where: {
        user: {
          status: 'ACTIVE'
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalHealthCenters: stats._count.id,
        verificationStats: verifiedStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes - require authentication
router.use(protect);

// Get health center profile (self)
router.get('/profile', requireHealthCenter, async (req, res, next) => {
  try {
    const healthCenterProfile = req.user.healthCenter;
    
    res.status(200).json({
      success: true,
      data: { healthCenter: healthCenterProfile }
    });
  } catch (error) {
    next(error);
  }
});

// Update health center profile
router.put('/profile', requireHealthCenter, async (req, res, next) => {
  try {
    const {
      centerName,
      contactPerson,
      registrationNumber,
      centerType,
      capacity,
      operatingHours,
      services
    } = req.body;

    const healthCenterId = req.user.healthCenter.id;

    const updatedHealthCenter = await prisma.healthCenter.update({
      where: { id: healthCenterId },
      data: {
        ...(centerName && { centerName }),
        ...(contactPerson && { contactPerson }),
        ...(registrationNumber && { registrationNumber }),
        ...(centerType && { centerType }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(operatingHours && { operatingHours }),
        ...(services && { services })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Health center profile updated successfully',
      data: { healthCenter: updatedHealthCenter }
    });
  } catch (error) {
    next(error);
  }
});

// Submit verification request
router.post('/verification', requireHealthCenter, async (req, res, next) => {
  try {
    const { verificationDoc } = req.body;
    const healthCenterId = req.user.healthCenter.id;

    if (req.user.healthCenter.verified) {
      return next(new AppError('Health center is already verified', 400, 'ALREADY_VERIFIED'));
    }

    const updatedHealthCenter = await prisma.healthCenter.update({
      where: { id: healthCenterId },
      data: {
        verificationDoc,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Verification request submitted successfully. Our team will review it shortly.',
      data: { healthCenter: updatedHealthCenter }
    });
  } catch (error) {
    next(error);
  }
});

// Get verification status
router.get('/verification', requireHealthCenter, async (req, res, next) => {
  try {
    const healthCenter = req.user.healthCenter;
    
    res.status(200).json({
      success: true,
      data: {
        verificationStatus: {
          verified: healthCenter.verified,
          hasSubmittedDocuments: !!healthCenter.verificationDoc,
          verificationDoc: healthCenter.verificationDoc
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Search for donors (health center specific functionality)
router.get('/search-donors', requireHealthCenter, async (req, res, next) => {
  try {
    const { bloodType, location, urgent = false, limit = 20 } = req.query;

    if (!bloodType) {
      return next(new AppError('Blood type is required for donor search', 400, 'BLOOD_TYPE_REQUIRED'));
    }

    const where = {
      isAvailable: true,
      bloodType: bloodType.replace('+', '_POSITIVE').replace('-', '_NEGATIVE'),
      user: {
        status: 'ACTIVE'
      }
    };

    if (location) {
      where.user.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // If urgent, also include donors who donated more than 8 weeks ago
    if (urgent === 'true') {
      const eightWeeksAgo = new Date(Date.now() - (56 * 24 * 60 * 60 * 1000));
      where.OR = [
        { lastDonation: null },
        { lastDonation: { lt: eightWeeksAgo } }
      ];
    }

    const donors = await prisma.donor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            location: true,
            phone: true,
            telegramUsername: true,
            createdAt: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: [
        { lastDonation: 'asc' }, // Prioritize donors who haven't donated recently
        { updatedAt: 'desc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        donors,
        searchCriteria: {
          bloodType,
          location,
          urgent,
          total: donors.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create blood request (placeholder for future feature)
router.post('/blood-requests', requireHealthCenter, async (req, res, next) => {
  try {
    const {
      bloodType,
      urgencyLevel,
      unitsNeeded,
      patientInfo,
      deadline
    } = req.body;

    // TODO: Implement blood request creation
    // This would typically create a request that notifies matching donors
    
    res.status(201).json({
      success: true,
      message: 'Blood request feature coming soon',
      data: {
        request: {
          bloodType,
          urgencyLevel,
          unitsNeeded,
          status: 'pending'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 