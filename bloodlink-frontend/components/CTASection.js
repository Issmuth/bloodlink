import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-crimson to-red-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-4 border-white rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Become a
          <span className="block text-yellow-200">Lifesaver?</span>
        </h2>
        
        {/* Subtext */}
        <p className="text-xl sm:text-2xl text-red-100 mb-8 leading-relaxed">
          Join our community of heroes and help save lives in your area. Your blood donation could be the difference between life and death for someone in need.
        </p>

        {/* Key Benefits */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p className="text-white font-medium">Instant Verification</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="text-white font-medium">Local Impact</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <p className="text-white font-medium">Save Lives</p>
          </div>
        </div>

        {/* Main CTA Button */}
        <div className="mb-8">
          <Link href="/register" className="bg-white text-crimson text-xl font-bold px-12 py-6 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-transform inline-block">
            Become a Lifesaver Today
          </Link>
        </div>

        {/* Secondary Info */}
        <p className="text-red-100 text-sm">
          Free registration • Takes less than 5 minutes • Join 500+ donors
        </p>

        {/* Testimonial Quote */}
        <div className="mt-12 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
          <blockquote className="text-white italic text-lg mb-4">
            "The feeling of knowing I helped save someone's life is indescribable. This platform made it so easy to get involved."
          </blockquote>
          <cite className="text-red-200 text-sm">— Sarah M., Regular Donor</cite>
        </div>
      </div>
    </section>
  )
} 