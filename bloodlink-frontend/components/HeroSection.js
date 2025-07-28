import Link from 'next/link'

export default function HeroSection() {
  return (
    <section id="home" className="bg-gradient-to-br from-off-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-32 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-midnight dark:text-gray-50 leading-tight">
              Donate Blood,{' '}
              <span className="text-crimson dark:text-red-400">Save Lives</span>{' '}
              Instantly
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-200 leading-relaxed">
              Connect hospitals with nearby donors in seconds. Join our mission to make blood donation faster, easier, and more impactful than ever before.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-block text-center">
                Register as Donor
              </Link>
              <Link href="/register" className="btn-secondary text-lg px-8 py-4 inline-block text-center">
                Request Blood
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-green rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-green rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Verified Donors</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="relative">
              {/* Blood Drop Illustration */}
              <div className="mx-auto w-80 h-80 lg:w-96 lg:h-96 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-crimson to-red-600 rounded-full opacity-10 animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-crimson to-red-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute inset-8 bg-crimson rounded-full flex items-center justify-center">
                  {/* Blood Drop SVG */}
                  <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C9.5 2 7.4 3.5 6.4 5.6C5.4 7.7 5.7 10.1 7.2 11.9L11.3 17.2C11.7 17.7 12.3 17.7 12.7 17.2L16.8 11.9C18.3 10.1 18.6 7.7 17.6 5.6C16.6 3.5 14.5 2 12 2Z"/>
                  </svg>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-16 right-8 w-6 h-6 bg-teal-green rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute bottom-20 left-8 w-4 h-4 bg-amber rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-32 left-12 w-3 h-3 bg-crimson rounded-full opacity-40 animate-bounce" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 
