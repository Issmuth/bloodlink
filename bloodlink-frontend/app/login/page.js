'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormInput from '../../components/FormInput'
import Toast from '../../components/Toast'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'donor' // default role
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({}) // Clear previous errors

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      })

      if (result.success) {
        setToast({
          show: true,
          message: result.message,
          type: 'success'
        })

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/requests')
        }, 1500)
      } else {
        // Handle validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const newErrors = {}
          result.errors.forEach(error => {
            newErrors[error.field] = error.message
          })
          setErrors(newErrors)
        }

        setToast({
          show: true,
          message: result.message,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      setToast({
        show: true,
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'donor', label: 'Blood Donor' },
    { value: 'health_center', label: 'Health Center' }
  ]

  // Show loading if auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-midnight">
              <span className="text-crimson">Life</span>line
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-midnight">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <FormInput
              label="I am a"
              type="select"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              options={roleOptions}
              placeholder="Select your role"
              required
              error={errors.role}
            />

            {/* Email Field */}
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
              error={errors.email}
            />

            {/* Password Field */}
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              error={errors.password}
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-crimson hover:text-red-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary text-lg py-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-crimson hover:text-red-700 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-midnight transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}