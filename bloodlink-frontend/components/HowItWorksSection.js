import Link from 'next/link'

export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Donor Sign-Up",
      description: "Create your profile with medical information and location. Get verified in minutes.",
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      color: "text-teal-green"
    },
    {
      id: 2,
      title: "Hospital Request",
      description: "Hospitals submit urgent blood requests with specific requirements and location.",
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 8h2V6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2h-2v2H4V8z"/>
          <path d="M6 12h6v2H6zm0-2h8V8H6v2zm0 6h4v-2H6v2z"/>
        </svg>
      ),
      color: "text-amber"
    },
    {
      id: 3,
      title: "Instant Matching",
      description: "Our AI instantly connects hospitals with the nearest compatible donors.",
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 7h-2v4L9 9l-1.42 1.42L12 14.84l4.42-4.42L15 9l-2 2V7zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      ),
      color: "text-crimson"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-midnight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our streamlined process connects donors with hospitals in just three simple steps
          </p>
        </div>

        {/* Steps Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-gray-400 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              )}
              
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 card-shadow border border-gray-100 relative z-10 text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-crimson text-white rounded-full text-sm font-bold mb-6">
                  {step.id}
                </div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${step.color} bg-gray-50`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-midnight mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Ready to get started?</p>
          <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-block">
            Join Our Community
          </Link>
        </div>
      </div>
    </section>
  )
} 