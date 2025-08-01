'use client'

import dynamic from 'next/dynamic'
import { DarkModeProvider } from '../contexts/DarkModeContext'

// Import AuthProvider dynamically to prevent SSR hydration issues
const AuthProvider = dynamic(
  () => import('../contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson"></div>
      </div>
    )
  }
)

export default function ClientProviders({ children }) {
  return (
    <DarkModeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DarkModeProvider>
  )
}