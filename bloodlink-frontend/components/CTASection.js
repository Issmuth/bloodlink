import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-crimson to-red-600 dark:from-red-800 dark:to-red-900 relative overflow-hidden transition-colors">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-4 border-white rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-4xl sm:text-5xl font-bold text-white dark:text-gray-50 mb-6">
          Ready to Save Lives?
        </h2>
        <p className="text-xl text-red-100 dark:text-gray-100 mb-12 max-w-2xl mx-auto">
          Every donation can save up to three lives. Join our community of heroes and make a difference today.
        </p>

        {/* Main CTA Button */}
        <div className="mb-8">
          <Link href="/register" className="bg-white dark:bg-gray-100 text-crimson dark:text-red-800 text-xl font-bold px-12 py-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-transform inline-block">
            Become a Lifesaver Today
          </Link>
        </div>

        {/* Secondary Info */}
        <p className="text-red-100 dark:text-gray-200 text-sm">
          Free registration • Takes less than 5 minutes • Join 500+ donors
        </p>
      </div>
    </section>
  )
} 
