'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    router.push('/')
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    if (user.role === 'DONOR' && user.donor) {
      return user.donor.fullName
    }
    if (user.role === 'HEALTH_CENTER' && user.healthCenter) {
      return user.healthCenter.centerName
    }
    return user.email
  }

  const getUserRole = () => {
    if (!user) return ''
    return user.role === 'DONOR' ? 'Donor' : 'Health Center'
  }

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-midnight">
                <span className="text-crimson">Blood</span>link
              </h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-crimson transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-crimson transition-colors">
              About
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-crimson transition-colors">
              How It Works
            </Link>

            {/* Authentication State */}
            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/login"
                      className="text-crimson hover:text-red-700 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-crimson transition-colors focus:outline-none"
                    >
                      <div className="w-8 h-8 bg-crimson text-white rounded-full flex items-center justify-center">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{getUserDisplayName()}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {getUserRole()}
                        </div>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-crimson focus:outline-none focus:text-crimson"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-crimson transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-crimson transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/how-it-works"
                className="block px-3 py-2 text-gray-700 hover:text-crimson transition-colors"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </Link>

              {!isLoading && (
                <>
                  {!isAuthenticated ? (
                    <>
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-crimson hover:text-red-700 font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 bg-crimson text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-500 border-t">
                        {getUserDisplayName()} • {getUserRole()}
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-gray-700 hover:text-crimson transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-gray-700 hover:text-crimson transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-crimson transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 