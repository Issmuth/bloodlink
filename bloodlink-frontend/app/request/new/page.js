'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { bloodRequestsAPI } from '../../../lib/api'
import Navbar from '../../../components/Navbar'
import FormInput from '../../../components/FormInput'
import Toast from '../../../components/Toast'

export default function CreateRequestPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    bloodType: '',
    unitsNeeded: 1,
    urgency: 'Normal',
    patientAge: '',
    procedure: '',
    notes: '',
    expectedTimeframe: 'within-24h',
    contactPreference: 'telegram'
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Redirect if user is not a health center
    if (!isLoading && isAuthenticated && user?.role !== 'HEALTH_CENTER') {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
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

    if (!formData.bloodType) {
      newErrors.bloodType = 'Blood type is required'
    }

    if (!formData.unitsNeeded || formData.unitsNeeded < 1) {
      newErrors.unitsNeeded = 'At least 1 unit is required'
    }

    if (formData.unitsNeeded > 10) {
      newErrors.unitsNeeded = 'Maximum 10 units can be requested at once'
    }

    if (!formData.procedure.trim()) {
      newErrors.procedure = 'Procedure or reason is required'
    }

    if (formData.patientAge && (formData.patientAge < 0 || formData.patientAge > 120)) {
      newErrors.patientAge = 'Please enter a valid age'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🩸 [FRONTEND] Starting blood request creation...');
    console.log('🩸 [FRONTEND] User data:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      hasHealthCenter: !!user?.healthCenter,
      isAuthenticated
    });
    
    if (!validateForm()) {
      console.error('❌ [FRONTEND] Form validation failed:', errors);
      return;
    }

    setLoading(true)
    setErrors({})

    try {
      // Prepare request data
      const requestData = {
        bloodType: formData.bloodType,
        unitsNeeded: formData.unitsNeeded,
        urgency: formData.urgency,
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        procedure: formData.procedure.trim(),
        notes: formData.notes.trim(),
        expectedTimeframe: formData.expectedTimeframe,
        contactPreference: formData.contactPreference
      }

      console.log('🩸 [FRONTEND] Sending request data:', requestData);
      console.log('🩸 [FRONTEND] Current tokens:', {
        hasAccessToken: !!localStorage.getItem('accessToken'),
        hasRefreshToken: !!localStorage.getItem('refreshToken'),
        accessTokenPreview: localStorage.getItem('accessToken')?.substring(0, 20) + '...'
      });

      // Call the API
      console.log('🩸 [FRONTEND] Making API call to create blood request...');
      const response = await bloodRequestsAPI.create(requestData);
      
      console.log('✅ [FRONTEND] Blood request created successfully:', {
        status: response.status,
        message: response.data?.message,
        requestId: response.data?.data?.bloodRequest?.id
      });
      
      setToast({
        show: true,
        message: response.data.message || 'Blood request posted successfully! Donors will be notified immediately.',
        type: 'success'
      })

      // Reset form
      setFormData({
        bloodType: '',
        unitsNeeded: 1,
        urgency: 'Normal',
        patientAge: '',
        procedure: '',
        notes: '',
        expectedTimeframe: 'within-24h',
        contactPreference: 'telegram'
      })

      console.log('✅ [FRONTEND] Form reset, redirecting to dashboard in 2 seconds...');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('❌ [FRONTEND] Blood request creation failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? {
            authorization: error.config.headers.Authorization?.substring(0, 20) + '...'
          } : null
        }
      });
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.error('❌ [FRONTEND] Authentication error - token invalid or expired');
        console.log('🔄 [FRONTEND] Clearing tokens and redirecting to login...');
        
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        setToast({
          show: true,
          message: 'Your session has expired. Please log in again.',
          type: 'error'
        });
        
        // Redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
        return;
      }
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        console.error('❌ [FRONTEND] Validation errors from backend:', error.response.data.errors);
        
        const newErrors = {}
        error.response.data.errors.forEach(err => {
          newErrors[err.field] = err.message
          console.error(`❌ [FRONTEND] Validation error for field "${err.field}": ${err.message}`);
        })
        setErrors(newErrors)
      }
      
      // Handle specific error codes
      let errorMessage = 'Failed to create blood request. Please try again.';
      
      if (error.response?.data?.code) {
        console.error('❌ [FRONTEND] Backend error code:', error.response.data.code);
        
        switch (error.response.data.code) {
          case 'PROFILE_NOT_FOUND':
            errorMessage = 'Health center profile not found. Please complete your profile setup.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = 'Please check your input and try again.';
            break;
          case 'DUPLICATE_REQUEST':
            errorMessage = 'Duplicate request detected. Please try again.';
            break;
          case 'ACCESS_DENIED':
            errorMessage = 'Access denied. Health center role required.';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      console.error('❌ [FRONTEND] Final error message:', errorMessage);
      
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setLoading(false)
      console.log('🏁 [FRONTEND] Blood request creation flow completed');
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not health center
  if (!isAuthenticated || !user || user.role !== 'HEALTH_CENTER') {
    return null
  }

  const bloodTypeOptions = [
    { value: '', label: 'Select blood type' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ]

  const urgencyOptions = [
    { value: 'Normal', label: 'Normal - Scheduled procedure' },
    { value: 'High', label: 'High - Urgent within hours' },
    { value: 'Emergency', label: 'Emergency - Critical immediate need' }
  ]

  const timeframeOptions = [
    { value: 'within-2h', label: 'Within 2 hours' },
    { value: 'within-6h', label: 'Within 6 hours' },
    { value: 'within-24h', label: 'Within 24 hours' },
    { value: 'within-3d', label: 'Within 3 days' },
    { value: 'within-week', label: 'Within a week' }
  ]

  const contactOptions = [
    { value: 'telegram', label: 'Telegram' },
    { value: 'phone', label: 'Phone call' },
    { value: 'both', label: 'Both Telegram and Phone' }
  ]

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-crimson transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-midnight">Create Blood Request</h1>
              <p className="text-gray-600 mt-2">
                Post a new blood request to reach available donors in your area
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Essential Information */}
            <div>
              <h2 className="text-xl font-semibold text-midnight mb-6 flex items-center">
                <div className="w-8 h-8 bg-crimson text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  1
                </div>
                Essential Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Blood Type Required"
                  type="select"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  options={bloodTypeOptions}
                  required
                  error={errors.bloodType}
                />

                <FormInput
                  label="Units Needed"
                  type="number"
                  name="unitsNeeded"
                  value={formData.unitsNeeded}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  error={errors.unitsNeeded}
                />

                <FormInput
                  label="Urgency Level"
                  type="select"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  options={urgencyOptions}
                  required
                  error={errors.urgency}
                />

                <FormInput
                  label="Expected Timeframe"
                  type="select"
                  name="expectedTimeframe"
                  value={formData.expectedTimeframe}
                  onChange={handleInputChange}
                  options={timeframeOptions}
                  required
                  error={errors.expectedTimeframe}
                />
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <h2 className="text-xl font-semibold text-midnight mb-6 flex items-center">
                <div className="w-8 h-8 bg-teal-green text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  2
                </div>
                Patient Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Patient Age (Optional)"
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  placeholder="Enter patient age"
                  error={errors.patientAge}
                />

                <FormInput
                  label="Procedure/Reason"
                  name="procedure"
                  value={formData.procedure}
                  onChange={handleInputChange}
                  placeholder="e.g., Emergency surgery, Cancer treatment, etc."
                  required
                  error={errors.procedure}
                />
              </div>

              <div className="mt-6">
                <FormInput
                  label="Additional Notes (Optional)"
                  type="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information that might help donors (e.g., specific requirements, hospital location details, etc.)"
                  error={errors.notes}
                />
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-midnight mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  3
                </div>
                Contact Preferences
              </h2>
              
              <FormInput
                label="How should donors contact you?"
                type="select"
                name="contactPreference"
                value={formData.contactPreference}
                onChange={handleInputChange}
                options={contactOptions}
                required
                error={errors.contactPreference}
              />

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Important Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your request will be sent to all eligible donors in your area. Donors will see your health center name and contact information as provided in your profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 bg-crimson text-white font-medium rounded-lg transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Request...
                  </div>
                ) : (
                  'Post Blood Request'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-teal-green/10 to-teal-green/5 rounded-xl p-6 border border-teal-green/20">
          <h3 className="text-lg font-semibold text-teal-green mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-midnight mb-2">Urgency Levels:</h4>
              <ul className="space-y-1">
                <li><span className="font-medium">Emergency:</span> Life-threatening, immediate need</li>
                <li><span className="font-medium">High:</span> Urgent within a few hours</li>
                <li><span className="font-medium">Normal:</span> Scheduled procedure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-midnight mb-2">Tips for Better Response:</h4>
              <ul className="space-y-1">
                <li>• Be specific about the procedure/reason</li>
                <li>• Include patient age if relevant</li>
                <li>• Set realistic timeframes</li>
                <li>• Ensure your contact info is up to date</li>
              </ul>
            </div>
          </div>
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