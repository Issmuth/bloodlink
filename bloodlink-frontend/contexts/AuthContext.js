'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true)
    
    // Then safely access localStorage
    try {
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        setUser(JSON.parse(userData))
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth hydration error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <AuthContext.Provider value={{
        user: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: () => {},
        setIsAuthenticated: () => {}
      }}>
        {children}
      </AuthContext.Provider>
    )
  }

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      
      console.log('🔐 [AUTH CONTEXT] Starting login process...')
      console.log('🔐 [AUTH CONTEXT] Login credentials:', {
        email: credentials.email,
        role: credentials.role
      })
      
      const response = await authAPI.login(credentials)
      console.log('✅ [AUTH CONTEXT] Login API response received:', {
        status: response.status,
        hasData: !!response.data,
        hasTokens: !!response.data?.data?.tokens,
        tokenStructure: response.data?.data ? Object.keys(response.data.data) : 'no data'
      })

      // Extract user and tokens from nested structure
      const { user, tokens } = response.data.data
      const { accessToken, refreshToken } = tokens

      console.log('🔐 [AUTH CONTEXT] Extracted tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken?.substring(0, 20) + '...',
        refreshTokenPreview: refreshToken?.substring(0, 20) + '...'
      })

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      console.log('✅ [AUTH CONTEXT] Tokens stored in localStorage')

      setUser(user)
      setIsAuthenticated(true)
      setIsLoading(false)

      return { success: true, message: response.data.message }
    } catch (error) {
      setIsLoading(false)
      
      console.error('❌ [AUTH CONTEXT] Login failed:', {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data
      })
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      const errorCode = error.response?.data?.code
      const validationErrors = error.response?.data?.errors

      return { 
        success: false, 
        message: errorMessage,
        code: errorCode,
        errors: validationErrors
      }
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)
      
      console.log('🔐 [AUTH CONTEXT] Starting registration process...')
      console.log('🔐 [AUTH CONTEXT] Registration data:', {
        email: userData.email,
        role: userData.role
      })
      
      const response = await authAPI.register(userData)
      console.log('✅ [AUTH CONTEXT] Registration API response received:', {
        status: response.status,
        hasData: !!response.data,
        hasTokens: !!response.data?.data?.tokens
      })

      // Extract user and tokens from nested structure
      const { user, tokens } = response.data.data
      const { accessToken, refreshToken } = tokens

      console.log('🔐 [AUTH CONTEXT] Extracted tokens from registration:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken?.substring(0, 20) + '...'
      })

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      console.log('✅ [AUTH CONTEXT] Registration tokens stored in localStorage')

      setUser(user)
      setIsAuthenticated(true)
      setIsLoading(false)

      return { success: true, message: response.data.message }
    } catch (error) {
      setIsLoading(false)
      
      console.error('❌ [AUTH CONTEXT] Registration failed:', {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data
      })
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      const errorCode = error.response?.data?.code
      const validationErrors = error.response?.data?.errors

      return { 
        success: false, 
        message: errorMessage,
        code: errorCode,
        errors: validationErrors
      }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const refreshTokens = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token available')

      const response = await authAPI.refreshToken(refreshToken)
      const { accessToken } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      refreshTokens
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
} 
