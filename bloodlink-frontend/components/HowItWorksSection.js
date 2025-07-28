import Link from 'next/link'

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Register",
      description: "Sign up as a donor or health center in under 5 minutes",
      icon: "👤"
    },
    {
      number: "02", 
      title: "Get Matched",
      description: "Our system connects you with nearby donors or requests",
      icon: "🔗"
    },
    {
      number: "03",
      title: "Save Lives",
      description: "Coordinate donations and make a real difference",
      icon: "❤️"
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-midnight dark:text-gray-50 mb-4">
            How It <span className="text-crimson dark:text-red-400">Works</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
            Getting started is simple. Follow these three easy steps to begin saving lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-crimson dark:text-red-400 font-bold text-lg mb-2">
                Step {step.number}
              </div>
              <h3 className="text-xl font-bold text-midnight dark:text-gray-50 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-200">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/register"
            className="btn-primary text-lg px-8 py-4 inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </section>
  )
} 
