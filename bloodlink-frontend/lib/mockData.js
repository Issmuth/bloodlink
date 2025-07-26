// Mock data for dashboard components

export const mockDonorData = {
  stats: {
    totalDonations: 8,
    lastDonationDate: '2024-01-15',
    nextEligibleDate: '2024-07-15',
    bloodType: 'A+',
    isAvailable: true
  },
  recentRequests: [
    {
      id: 1,
      hospitalName: 'City General Hospital',
      bloodType: 'A+',
      urgency: 'Emergency',
      location: 'Downtown District',
      requestedAt: '2024-01-20T10:30:00Z',
      unitsNeeded: 2,
      status: 'pending'
    },
    {
      id: 2,
      hospitalName: 'Children\'s Medical Center',
      bloodType: 'A+',
      urgency: 'High',
      location: 'Medical District',
      requestedAt: '2024-01-19T14:15:00Z',
      unitsNeeded: 1,
      status: 'responded'
    },
    {
      id: 3,
      hospitalName: 'Regional Health Center',
      bloodType: 'A+',
      urgency: 'Normal',
      location: 'West Side',
      requestedAt: '2024-01-18T09:00:00Z',
      unitsNeeded: 3,
      status: 'fulfilled'
    }
  ],
  donationHistory: [
    {
      id: 1,
      date: '2024-01-15',
      hospital: 'City General Hospital',
      bloodType: 'A+',
      units: 1,
      notes: 'Emergency surgery patient'
    },
    {
      id: 2,
      date: '2023-10-20',
      hospital: 'Regional Blood Bank',
      bloodType: 'A+',
      units: 1,
      notes: 'Regular blood drive'
    },
    {
      id: 3,
      date: '2023-07-10',
      hospital: 'Children\'s Medical Center',
      bloodType: 'A+',
      units: 1,
      notes: 'Pediatric patient support'
    }
  ]
}

export const mockHealthCenterData = {
  stats: {
    totalRequests: 24,
    activeRequests: 3,
    fulfilledRequests: 18,
    pendingRequests: 3,
    totalDonorsReached: 156
  },
  activeRequests: [
    {
      id: 1,
      bloodType: 'O-',
      urgency: 'Emergency',
      unitsNeeded: 4,
      unitsReceived: 1,
      postedAt: '2024-01-20T08:00:00Z',
      patientAge: 45,
      procedure: 'Emergency Surgery',
      responses: 12,
      confirmed: 1,
      status: 'active'
    },
    {
      id: 2,
      bloodType: 'AB+',
      urgency: 'High',
      unitsNeeded: 2,
      unitsReceived: 0,
      postedAt: '2024-01-19T16:30:00Z',
      patientAge: 28,
      procedure: 'Cancer Treatment',
      responses: 6,
      confirmed: 0,
      status: 'active'
    },
    {
      id: 3,
      bloodType: 'B+',
      urgency: 'Normal',
      unitsNeeded: 1,
      unitsReceived: 0,
      postedAt: '2024-01-19T11:00:00Z',
      patientAge: 65,
      procedure: 'Planned Surgery',
      responses: 3,
      confirmed: 0,
      status: 'active'
    }
  ],
  recentRequests: [
    {
      id: 4,
      bloodType: 'A+',
      urgency: 'High',
      unitsNeeded: 2,
      unitsReceived: 2,
      postedAt: '2024-01-18T14:00:00Z',
      completedAt: '2024-01-19T10:30:00Z',
      responses: 8,
      confirmed: 2,
      status: 'fulfilled'
    },
    {
      id: 5,
      bloodType: 'O+',
      urgency: 'Emergency',
      unitsNeeded: 3,
      unitsReceived: 3,
      postedAt: '2024-01-17T09:15:00Z',
      completedAt: '2024-01-17T15:45:00Z',
      responses: 15,
      confirmed: 3,
      status: 'fulfilled'
    }
  ],
  donorResponses: [
    {
      id: 1,
      requestId: 1,
      donorName: 'Sarah Johnson',
      bloodType: 'O-',
      responseTime: '2024-01-20T08:15:00Z',
      status: 'confirmed',
      contactInfo: '@sarahj_donor',
      availableTime: 'Today 2-4 PM'
    },
    {
      id: 2,
      requestId: 2,
      donorName: 'Michael Chen',
      bloodType: 'AB+',
      responseTime: '2024-01-19T17:00:00Z',
      status: 'pending',
      contactInfo: '@mchen_donor',
      availableTime: 'Tomorrow morning'
    },
    {
      id: 3,
      requestId: 1,
      donorName: 'Ahmed Hassan',
      bloodType: 'O-',
      responseTime: '2024-01-20T09:30:00Z',
      status: 'pending',
      contactInfo: '+251911123456',
      availableTime: 'This evening'
    }
  ]
}

export const urgencyColors = {
  'Emergency': 'bg-red-100 text-red-800 border-red-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Normal': 'bg-green-100 text-green-800 border-green-200'
}

export const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'responded': 'bg-blue-100 text-blue-800 border-blue-200',
  'fulfilled': 'bg-green-100 text-green-800 border-green-200',
  'active': 'bg-crimson/10 text-crimson border-crimson/20',
  'confirmed': 'bg-teal-100 text-teal-800 border-teal-200',
  'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
} 