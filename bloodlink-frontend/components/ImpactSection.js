import Link from 'next/link'

export default function ImpactSection() {
  const stats = [
    {
      number: "500+",
      label: "Donations Facilitated",
      description: "Lives touched through our platform",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      color: "text-crimson"
    },
    {
      number: "120",
      label: "Hospitals Supported",
      description: "Medical facilities in our network",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      color: "text-teal-green"
    },
    {
      number: "24/7",
      label: "Available Support",
      description: "Round-the-clock emergency response",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      color: "text-amber"
    },
    {
      number: "95%",
      label: "Success Rate",
      description: "Successful donor-hospital matches",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ),
      color: "text-teal-green"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-midnight mb-4">
            Our <span className="text-crimson">Impact</span> So Far
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Together, we're building a network that saves lives every day
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-6 lg:p-8 card-shadow border border-gray-100 text-center group hover:scale-105 transition-transform duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${stat.color} bg-gray-50 group-hover:bg-gray-100 transition-colors`}>
                {stat.icon}
              </div>
              
              {/* Number */}
              <div className="text-3xl lg:text-4xl font-bold text-midnight mb-2">
                {stat.number}
              </div>
              
              {/* Label */}
              <div className="text-lg font-semibold text-midnight mb-2">
                {stat.label}
              </div>
              
              {/* Description */}
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 lg:p-12 card-shadow border border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-midnight mb-4">
              Be Part of Something <span className="text-crimson">Life-Changing</span>
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Every donation has the potential to save up to three lives. Join thousands of heroes who have already made a difference.
            </p>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Monthly Goal Progress</span>
                <span>84% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-crimson to-red-500 h-3 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">126 more donations needed this month</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-block text-center">
                Start Donating Today
              </Link>
              <Link href="/#how-it-works" className="border-2 border-teal-green text-teal-green px-8 py-3 rounded-full font-medium hover:bg-teal-green hover:text-white transition-colors duration-300 inline-block text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 