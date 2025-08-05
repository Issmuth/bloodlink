'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../lib/api'
import Navbar from '../../components/Navbar'
import FormInput from '../../components/FormInput'
import Toast from '../../components/Toast'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      await authAPI.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      )

      setToast({
        show: true,
        message: 'Password changed successfully',
        type: 'success'
      })

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Redirect to profile after success
      setTimeout(() => {
        router.push('/profile')
      }, 2000)

    } catch (error) {
      console.error('Change password error:', error)
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const newErrors = {}
        error.response.data.errors.forEach(err => {
          newErrors[err.field] = err.message
        })
        setErrors(newErrors)
      }
      
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to change password',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 transition-colors">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-midnight dark:text-gray-50">
            Change Password
          </h1>
          <p className="text-gray-600 dark:text-gray-200 mt-2">
            Update your account password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border dark:border-gray-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              required
              error={errors.currentPassword}
            />

            <FormInput
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              required
              error={errors.newPassword}
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              error={errors.confirmPassword}
            />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-crimson hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Back to Profile */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/profile')}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-midnight dark:hover:text-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Profile
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />
    </div>
  )
}