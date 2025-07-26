'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardCard from './DashboardCard'
import RequestTable from './RequestTable'
import { mockHealthCenterData, urgencyColors, statusColors } from '../../lib/mockData'
import TelegramLink from '../TelegramLink'

// Icons
const PlusIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ClipboardIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6 text-teal-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5H21.5" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

export default function HealthCenterDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('active')
  const healthCenterData = mockHealthCenterData
  const healthCenter = user.healthCenter || {}

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleConfirmDonor = (responseId) => {
    console.log(`Confirming donor response ${responseId}`)
    // Implement confirmation logic
  }

  const handleContactDonor = (contactInfo) => {
    if (contactInfo.startsWith('@')) {
      // Telegram username
      window.open(`https://t.me/${contactInfo.substring(1)}`, '_blank')
    } else if (contactInfo.startsWith('+')) {
      // Phone number
      window.open(`tel:${contactInfo}`, '_self')
    }
  }

  return (
    <div className="space-y-8">
      {/* Telegram Integration */}
      <div className="mb-8">
        <TelegramLink />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Requests"
          icon={<ClipboardIcon />}
        >
          <div className="text-3xl font-bold text-midnight">
            {healthCenterData.stats.totalRequests}
          </div>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </DashboardCard>

        <DashboardCard
          title="Active Requests"
          icon={<BellIcon />}
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
        >
          <div className="text-3xl font-bold text-orange-600">
            {healthCenterData.stats.activeRequests}
          </div>
          <p className="text-sm text-gray-500 mt-1">Seeking donors</p>
        </DashboardCard>

        <DashboardCard
          title="Fulfilled"
          icon={<CheckCircleIcon />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        >
          <div className="text-3xl font-bold text-green-600">
            {healthCenterData.stats.fulfilledRequests}
          </div>
          <p className="text-sm text-gray-500 mt-1">Completed requests</p>
        </DashboardCard>

        <DashboardCard
          title="Donors Reached"
          icon={<UsersIcon />}
          className="bg-gradient-to-br from-teal-green/10 to-teal-green/20 border-teal-green/30"
        >
          <div className="text-3xl font-bold text-teal-green">
            {healthCenterData.stats.totalDonorsReached}
          </div>
          <p className="text-sm text-gray-500 mt-1">Total responses</p>
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Post New Blood Request"
          onClick={() => window.location.href = '/request/new'}
          hoverable={true}
          className="bg-gradient-to-br from-crimson/5 to-crimson/10 border-crimson/20 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-4">
                Quickly post a new blood request to reach available donors
              </p>
              <div className="inline-flex items-center space-x-2 bg-crimson text-white px-4 py-2 rounded-lg">
                <PlusIcon />
                <span className="font-medium">Create Request</span>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Telegram Integration"
          icon={<BellIcon />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
            <p className="text-sm text-gray-600">
              Automatic notifications to your Telegram group when donors respond
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Update settings
            </button>
          </div>
        </DashboardCard>
      </div>

      {/* Donor Responses */}
      <DashboardCard title="Recent Donor Responses">
        <div className="space-y-4">
          {healthCenterData.donorResponses.map((response) => (
            <div key={response.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-crimson text-white rounded-full flex items-center justify-center font-bold">
                  {response.bloodType}
                </div>
                <div>
                  <h4 className="font-semibold text-midnight">{response.donorName}</h4>
                  <p className="text-sm text-gray-600">
                    Available: {response.availableTime}
                  </p>
                  <p className="text-xs text-gray-500">
                    Responded {getTimeAgo(response.responseTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[response.status]}`}>
                  {response.status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContactDonor(response.contactInfo)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                  >
                    Contact
                  </button>
                  {response.status === 'pending' && (
                    <button
                      onClick={() => handleConfirmDonor(response.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Request Management Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Requests ({healthCenterData.activeRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({healthCenterData.recentRequests.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'active' && (
            <RequestTable
              requests={healthCenterData.activeRequests}
              title="Active Blood Requests"
              showActions={true}
            />
          )}
          {activeTab === 'completed' && (
            <RequestTable
              requests={healthCenterData.recentRequests}
              title="Completed Requests"
              showActions={false}
            />
          )}
        </div>
      </div>

      {/* Export and Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Export History"
          onClick={() => console.log('Export request history')}
          hoverable={true}
        >
          <p>Download your complete request history and analytics</p>
        </DashboardCard>

        <DashboardCard
          title="Update Profile"
          onClick={() => window.location.href = '/profile'}
          hoverable={true}
        >
          <p>Update center information, contact details, and settings</p>
        </DashboardCard>

        <DashboardCard
          title="View Analytics"
          onClick={() => window.location.href = '/analytics'}
          hoverable={true}
        >
          <p>Detailed insights about your requests and donor engagement</p>
        </DashboardCard>
      </div>
    </div>
  )
} 