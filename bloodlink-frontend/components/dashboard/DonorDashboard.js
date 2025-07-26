'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardCard from './DashboardCard'
import { mockDonorData, urgencyColors, statusColors } from '../../lib/mockData'
import TelegramLink from '../TelegramLink'

// Icons (you can replace with your preferred icon library)
const HeartIcon = () => (
  <svg className="w-6 h-6 text-crimson" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-6 h-6 text-teal-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function DonorDashboard({ user }) {
  const [isAvailable, setIsAvailable] = useState(mockDonorData.stats.isAvailable)
  const donorData = mockDonorData
  const donor = user.donor || {}

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Blood Type"
          icon={<HeartIcon />}
          className="bg-gradient-to-br from-crimson/5 to-crimson/10 border-crimson/20"
        >
          <div className="text-3xl font-bold text-crimson">
            {donor.bloodType || donorData.stats.bloodType}
          </div>
          <p className="text-sm text-gray-500 mt-1">Your blood type</p>
        </DashboardCard>

        <DashboardCard
          title="Total Donations"
          icon={<HeartIcon />}
        >
          <div className="text-3xl font-bold text-midnight">
            {donorData.stats.totalDonations}
          </div>
          <p className="text-sm text-gray-500 mt-1">Lives saved</p>
        </DashboardCard>

        <DashboardCard
          title="Last Donation"
          icon={<CalendarIcon />}
        >
          <div className="text-lg font-semibold text-midnight">
            {formatDate(donorData.stats.lastDonationDate)}
          </div>
          <p className="text-sm text-gray-500 mt-1">3 months ago</p>
        </DashboardCard>

        <DashboardCard
          title="Next Eligible"
          icon={<CalendarIcon />}
        >
          <div className="text-lg font-semibold text-teal-green">
            {formatDate(donorData.stats.nextEligibleDate)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Ready to donate!</p>
        </DashboardCard>
      </div>

      {/* Availability Status */}
      <DashboardCard title="Donation Availability">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {isAvailable ? 'Available for donation' : 'Not available'}
            </span>
          </div>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAvailable 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {isAvailable 
            ? 'Health centers can see you\'re ready to donate' 
            : 'You won\'t receive donation requests while unavailable'
          }
        </p>
      </DashboardCard>

      {/* Recent Blood Requests */}
      <DashboardCard 
        title="Recent Blood Requests" 
        icon={<BellIcon />}
      >
        <div className="space-y-4">
          {donorData.recentRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-midnight">{request.hospitalName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[request.urgency]}`}>
                      {request.urgency}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Blood Type: <span className="font-medium text-crimson">{request.bloodType}</span></p>
                    <p>Units needed: <span className="font-medium">{request.unitsNeeded}</span></p>
                    <p>Location: {request.location}</p>
                    <p className="text-xs text-gray-500">Posted {getTimeAgo(request.requestedAt)}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {request.status === 'pending' && (
                    <>
                      <button className="px-3 py-1 bg-crimson text-white rounded-md text-sm hover:bg-red-700 transition-colors">
                        Respond
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors">
                        Ignore
                      </button>
                    </>
                  )}
                  {request.status === 'responded' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                      Response sent
                    </span>
                  )}
                  {request.status === 'fulfilled' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/requests" className="text-crimson hover:text-red-700 font-medium">
            View all requests →
          </Link>
        </div>
      </DashboardCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Update Profile"
          icon={<UserIcon />}
          onClick={() => window.location.href = '/profile'}
          hoverable={true}
        >
          <p>Update your contact information, medical details, and preferences</p>
        </DashboardCard>

        <DashboardCard
          title="Donation History"
          icon={<HeartIcon />}
          onClick={() => window.location.href = '/history'}
          hoverable={true}
        >
          <p>View your complete donation history and impact statistics</p>
        </DashboardCard>

        <DashboardCard
          title="Telegram Status"
          icon={<BellIcon />}
          className="bg-gradient-to-br from-teal-green/5 to-teal-green/10 border-teal-green/20"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
            <p className="text-sm text-gray-600">
              {user.telegramUsername || '@your_username'}
            </p>
            <button className="text-teal-green hover:text-teal-700 text-sm font-medium">
              Update username
            </button>
          </div>
        </DashboardCard>
      </div>

      {/* Telegram Integration */}
      <div className="mb-8">
        <TelegramLink />
      </div>

      {/* Donation Status */}
    </div>
  )
} 