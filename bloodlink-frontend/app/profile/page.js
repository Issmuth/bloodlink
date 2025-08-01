'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI, donorsAPI, healthCentersAPI } from '../../lib/api'
import Navbar from '../../components/Navbar'
import FormInput from '../../components/FormInput'
import Toast from '../../components/Toast'
// Remove this line: import LoadingSpinner from '../../components/LoadingSpinner'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Form data state - synced with backend schema
  const [formData, setFormData] = useState({
    // General user info (from users endpoint)
    phone: '',
    location: '',
    telegramUsername: '',
    
    // Donor specific (from donors endpoint)
    fullName: '',
    bloodType: '',
    dateOfBirth: '',
    weight: '',
    emergencyContact: '',
    medicalNotes: '',
    isAvailable: true,
    
    // Health Center specific (from health-centers endpoint)
    centerName: '',
    contactPerson: '',
    registrationNumber: '',
    centerType: '',
    capacity: '',
    operatingHours: '',
    services: ''
  })

  const [errors, setErrors] = useState({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Load profile data
  useEffect(() => {
    if (user && isAuthenticated) {
      loadProfileData()
    }
  }, [user, isAuthenticated])

  const loadProfileData = async () => {
    try {
      setIsLoading(true)
      
      // Load general user profile from /users/profile
      const userResponse = await usersAPI.getProfile()
      const userData = userResponse.data.data.user
      
      // Load role-specific profile
      let roleData = {}
      if (user.role === 'DONOR') {
        const donorResponse = await donorsAPI.getProfile()
        roleData = donorResponse.data.data.donor
      } else if (user.role === 'HEALTH_CENTER') {
        const centerResponse = await healthCentersAPI.getProfile()
        roleData = centerResponse.data.data.healthCenter
      }

      // Populate form data - handle backend field mapping
      setFormData({
        // General user fields
        phone: userData.phone || '',
        location: userData.location || '',
        telegramUsername: userData.telegramUsername || '',
        
        // Donor fields - handle blood type enum conversion
        fullName: roleData.fullName || '',
        bloodType: roleData.bloodType ? 
          roleData.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') : '',
        dateOfBirth: roleData.dateOfBirth ? 
          new Date(roleData.dateOfBirth).toISOString().split('T')[0] : '',
        weight: roleData.weight ? roleData.weight.toString() : '',
        emergencyContact: roleData.emergencyContact || '',
        medicalNotes: roleData.medicalNotes || '',
        isAvailable: roleData.isAvailable !== undefined ? roleData.isAvailable : true,
        
        // Health Center fields
        centerName: roleData.centerName || '',
        contactPerson: roleData.contactPerson || '',
        registrationNumber: roleData.registrationNumber || '',
        centerType: roleData.centerType || '',
        capacity: roleData.capacity ? roleData.capacity.toString() : '',
        operatingHours: roleData.operatingHours || '',
        services: roleData.services || ''
      })

    } catch (error) {
      console.error('Error loading profile:', error)
      setToast({
        show: true,
        message: 'Failed to load profile data',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleGeneralSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      // Prepare data for /users/profile PUT endpoint
      const updateData = {
        phone: formData.phone || null,
        location: formData.location || null,
        telegramUsername: formData.telegramUsername || null
      }

      const response = await usersAPI.updateProfile(updateData)
      
      // Update user context with new data
      updateUser(response.data.data.user)
      
      setToast({
        show: true,
        message: 'General profile updated successfully',
        type: 'success'
      })

    } catch (error) {
      console.error('Error updating general profile:', error)
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const newErrors = {}
        error.response.data.errors.forEach(err => {
          newErrors[err.field] = err.message
        })
        setErrors(newErrors)
      }
      
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to update profile',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRoleSpecificSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      if (user.role === 'DONOR') {
        // Prepare data for /donors/profile PUT endpoint
        const updateData = {
          fullName: formData.fullName,
          bloodType: formData.bloodType ? 
            formData.bloodType.replace('+', '_POSITIVE').replace('-', '_NEGATIVE') : null,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          emergencyContact: formData.emergencyContact || null,
          medicalNotes: formData.medicalNotes || null
        }

        await donorsAPI.updateProfile(updateData)
        
        // Update availability separately using /donors/availability PUT endpoint
        const currentAvailability = user.donor?.isAvailable
        if (formData.isAvailable !== currentAvailability) {
          await donorsAPI.updateAvailability({ isAvailable: formData.isAvailable })
        }

      } else if (user.role === 'HEALTH_CENTER') {
        // Prepare data for /health-centers/profile PUT endpoint
        const updateData = {
          centerName: formData.centerName,
          contactPerson: formData.contactPerson,
          registrationNumber: formData.registrationNumber || null,
          centerType: formData.centerType || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          operatingHours: formData.operatingHours || null,
          services: formData.services || null
        }

        await healthCentersAPI.updateProfile(updateData)
      }

      setToast({
        show: true,
        message: `${user.role === 'DONOR' ? 'Donor' : 'Health Center'} profile updated successfully`,
        type: 'success'
      })

      // Reload profile data to get updated info
      await loadProfileData()

    } catch (error) {
      console.error('Error updating role-specific profile:', error)
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const newErrors = {}
        error.response.data.errors.forEach(err => {
          newErrors[err.field] = err.message
        })
        setErrors(newErrors)
      }
      
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to update profile',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Blood type options matching backend enum
  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ]

  // Center type options matching backend enum
  const centerTypeOptions = [
    { value: 'HOSPITAL', label: 'Hospital' },
    { value: 'CLINIC', label: 'Clinic' },
    { value: 'BLOOD_BANK', label: 'Blood Bank' },
    { value: 'LABORATORY', label: 'Laboratory' }
  ]

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 transition-colors">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-midnight dark:text-gray-50">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-200 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-600 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-600">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'general'
                    ? 'border-crimson text-crimson dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                General Information
              </button>
              <button
                onClick={() => setActiveTab('role')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'role'
                    ? 'border-crimson text-crimson dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {user.role === 'DONOR' ? 'Donor Profile' : 'Health Center Profile'}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-crimson text-crimson dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson"></div>
              </div>
            ) : (
              <>
                {/* General Information Tab */}
                {activeTab === 'general' && (
                  <form onSubmit={handleGeneralSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Email Address"
                        type="email"
                        value={user.email}
                        disabled
                        className="opacity-60"
                      />
                      
                      <FormInput
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        error={errors.phone}
                      />
                      
                      <FormInput
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State"
                        error={errors.location}
                        className="md:col-span-2"
                      />
                      
                      <div className="md:col-span-2 bg-gradient-to-r from-teal-green/10 to-teal-green/5 dark:from-teal-green/20 dark:to-teal-green/10 p-4 rounded-lg border border-teal-green/20 dark:border-teal-green/30">
                        <FormInput
                          label="Telegram Username"
                          name="telegramUsername"
                          value={formData.telegramUsername}
                          onChange={handleInputChange}
                          placeholder="@yourusername"
                          error={errors.telegramUsername}
                        />
                        <p className="text-sm text-teal-green dark:text-teal-400 mt-2">
                          <span className="font-medium">Optional:</span> Get instant notifications about donation requests and updates.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-crimson hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Role-specific Tab */}
                {activeTab === 'role' && (
                  <form onSubmit={handleRoleSpecificSubmit} className="space-y-6">
                    {user.role === 'DONOR' ? (
                      <>
                        {/* Donor Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            error={errors.fullName}
                          />
                          
                          <FormInput
                            label="Blood Type"
                            name="bloodType"
                            type="select"
                            value={formData.bloodType}
                            onChange={handleInputChange}
                            options={bloodTypeOptions}
                            placeholder="Select blood type"
                            required
                            error={errors.bloodType}
                          />
                          
                          <FormInput
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            error={errors.dateOfBirth}
                          />
                          
                          <FormInput
                            label="Weight (kg)"
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleInputChange}
                            placeholder="70"
                            min="40"
                            max="200"
                            step="0.1"
                            error={errors.weight}
                          />
                          
                          <FormInput
                            label="Emergency Contact"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            placeholder="Name and phone number"
                            error={errors.emergencyContact}
                            className="md:col-span-2"
                          />
                          
                          <FormInput
                            label="Medical Notes"
                            name="medicalNotes"
                            type="textarea"
                            value={formData.medicalNotes}
                            onChange={handleInputChange}
                            placeholder="Any medical conditions, medications, or notes..."
                            rows={3}
                            error={errors.medicalNotes}
                            className="md:col-span-2"
                          />
                        </div>

                        {/* Availability Toggle */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-midnight dark:text-gray-50">
                                Donation Availability
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-200">
                                Let health centers know if you're available to donate
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="isAvailable"
                                checked={formData.isAvailable}
                                onChange={handleInputChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-crimson/20 dark:peer-focus:ring-red-400/20 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-crimson dark:peer-checked:bg-red-400"></div>
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Health Center Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Center Name"
                            name="centerName"
                            value={formData.centerName}
                            onChange={handleInputChange}
                            required
                            error={errors.centerName}
                          />
                          
                          <FormInput
                            label="Contact Person"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            required
                            error={errors.contactPerson}
                          />
                          
                          <FormInput
                            label="Registration Number"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            placeholder="Medical facility registration number"
                            error={errors.registrationNumber}
                          />
                          
                          <FormInput
                            label="Center Type"
                            name="centerType"
                            type="select"
                            value={formData.centerType}
                            onChange={handleInputChange}
                            options={centerTypeOptions}
                            placeholder="Select center type"
                            error={errors.centerType}
                          />
                          
                          <FormInput
                            label="Capacity"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            placeholder="Number of beds/patients"
                            min="1"
                            error={errors.capacity}
                          />
                          
                          <FormInput
                            label="Operating Hours"
                            name="operatingHours"
                            value={formData.operatingHours}
                            onChange={handleInputChange}
                            placeholder="e.g., Mon-Fri 8AM-6PM"
                            error={errors.operatingHours}
                          />
                          
                          <FormInput
                            label="Services Offered"
                            name="services"
                            type="textarea"
                            value={formData.services}
                            onChange={handleInputChange}
                            placeholder="List of medical services provided..."
                            rows={3}
                            error={errors.services}
                            className="md:col-span-2"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-crimson hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-midnight dark:text-gray-50 mb-4">
                        Change Password
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200 mb-4">
                        Use the change password endpoint to update your password securely.
                      </p>
                      <button
                        onClick={() => router.push('/change-password')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-4">
                        Danger Zone
                      </h3>
                      <p className="text-red-600 dark:text-red-300 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            // TODO: Implement account deletion endpoint
                            alert('Account deletion endpoint not implemented yet')
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-midnight dark:hover:text-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Dashboard
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

