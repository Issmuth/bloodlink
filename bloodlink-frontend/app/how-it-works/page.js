import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'How It Works - Bloodlink Blood Donor Platform',
  description: 'Learn how Bloodlink connects blood donors with health centers in three simple steps. Register, get matched, and save lives.',
}

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Register Your Profile",
      description: "Sign up as a donor or health center in under 5 minutes. Complete your profile with essential information.",
      icon: "👤",
      details: [
        "Create your account with email verification",
        "Choose your role: Blood Donor or Health Center",
        "Complete your profile with medical/facility information",
        "Set your availability and notification preferences"
      ]
    },
    {
      number: "02", 
      title: "Get Matched Instantly",
      description: "Our intelligent system connects you with nearby donors or urgent blood requests in real-time.",
      icon: "🔗",
      details: [
        "Advanced matching algorithm by blood type and location",
        "Real-time notifications via Telegram and email",
        "Priority system for emergency requests",
        "Distance-based donor recommendations"
      ]
    },
    {
      number: "03",
      title: "Save Lives Together",
      description: "Coordinate donations seamlessly and make a real difference in your community.",
      icon: "❤️",
      details: [
        "Direct communication between donors and health centers",
        "Appointment scheduling and confirmation",
        "Donation tracking and history",
        "Impact metrics and community recognition"
      ]
    }
  ]

  const benefits = [
    {
      title: "For Blood Donors",
      items: [
        "Find nearby donation opportunities",
        "Track your donation history and impact",
        "Receive notifications for urgent requests",
        "Connect with your local community"
      ]
    },
    {
      title: "For Health Centers",
      items: [
        "Access verified donor database",
        "Send urgent blood requests instantly",
        "Manage appointments efficiently",
        "Reduce blood shortage incidents"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 transition-colors">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-crimson to-red-700 dark:from-red-800 dark:to-red-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            How Bloodlink Works
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Connecting blood donors with health centers has never been easier. 
            Follow these three simple steps to start saving lives today.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="text-crimson dark:text-red-400 font-bold text-lg mb-2">
                    Step {step.number}
                  </div>
                  <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-teal-green mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Icon/Visual */}
                <div className="flex-1 flex justify-center">
                  <div className="w-64 h-64 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border dark:border-gray-600">
                    <span className="text-8xl">{step.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Bloodlink creates value for both donors and health centers, 
              building a stronger, more connected healthcare community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-off-white dark:bg-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-midnight dark:text-gray-50 mb-6">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-crimson dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-green to-green-600 dark:from-teal-700 dark:to-green-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of donors and health centers already using Bloodlink 
            to save lives in their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="bg-white text-teal-green font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Register as Donor
            </a>
            <a 
              href="/register" 
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-teal-green transition-colors"
            >
              Register Health Center
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}