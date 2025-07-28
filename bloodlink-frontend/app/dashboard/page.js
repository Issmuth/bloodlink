'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../../components/Navbar'
import DonorDashboard from '../../components/dashboard/DonorDashboard'
import HealthCenterDashboard from '../../components/dashboard/HealthCenterDashboard'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const userRole = user.role?.toLowerCase()
  const getUserDisplayName = () => {
    if (user.role === 'DONOR' && user.donor) {
      return user.donor.fullName
    }
    if (user.role === 'HEALTH_CENTER' && user.healthCenter) {
      return user.healthCenter.centerName
    }
    return user.email
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-midnight dark:text-gray-50">
            Welcome back, {getUserDisplayName()}
          </h1>
          <p className="text-gray-600 dark:text-gray-200 mt-2">
            {userRole === 'donor' ? 'Thank you for being a life-saving donor!' : 'Manage your blood requests and connect with donors'}
          </p>
        </div>

        {/* Role-based Dashboard Content */}
        {userRole === 'donor' ? (
          <DonorDashboard user={user} />
        ) : userRole === 'health_center' ? (
          <HealthCenterDashboard user={user} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Unknown user role</h2>
            <p className="text-gray-500 dark:text-gray-300 mt-2">Please contact support for assistance.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
