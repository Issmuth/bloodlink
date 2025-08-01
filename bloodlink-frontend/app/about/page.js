import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'About Us - Bloodlink Blood Donor Platform',
  description: 'Learn about Bloodlink\'s mission to connect blood donors with health centers, saving lives through technology and community.',
}

export default function AboutPage() {
  const stats = [
    { number: "500+", label: "Lives Saved" },
    { number: "50+", label: "Health Centers" },
    { number: "1000+", label: "Registered Donors" },
    { number: "24/7", label: "Emergency Support" }
  ]

  const values = [
    {
      title: "Life First",
      description: "Every decision we make prioritizes saving lives and improving healthcare outcomes.",
      icon: "❤️"
    },
    {
      title: "Community Driven",
      description: "We believe in the power of community to create lasting change in healthcare.",
      icon: "🤝"
    },
    {
      title: "Innovation",
      description: "Using cutting-edge technology to solve critical healthcare challenges.",
      icon: "🚀"
    },
    {
      title: "Transparency",
      description: "Open, honest communication with all stakeholders in our platform.",
      icon: "🔍"
    }
  ]

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "15+ years in emergency medicine, passionate about blood donation advocacy.",
      image: "👩‍⚕️"
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      description: "Former healthcare tech lead, expert in real-time matching algorithms.",
      image: "👨‍💻"
    },
    {
      name: "Lisa Rodriguez",
      role: "Community Outreach Director",
      description: "Dedicated to building partnerships with health centers and donor communities.",
      image: "👩‍💼"
    }
  ]

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 transition-colors">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-crimson to-red-700 dark:from-red-800 dark:to-red-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            About Bloodlink
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            We're on a mission to revolutionize blood donation by connecting donors 
            with health centers instantly, saving lives through technology and community.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Every 2 seconds, someone in the world needs blood. Yet, finding the right donor 
              at the right time remains a critical challenge. Bloodlink bridges this gap by 
              creating an intelligent network that connects willing donors with urgent medical needs, 
              ensuring that no life is lost due to blood shortage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-midnight dark:text-gray-50 mb-4">
                The Problem We Solve
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-crimson mr-2">•</span>
                  Blood shortages affect 1 in 7 patients entering hospitals
                </li>
                <li className="flex items-start">
                  <span className="text-crimson mr-2">•</span>
                  Traditional donor recruitment is slow and inefficient
                </li>
                <li className="flex items-start">
                  <span className="text-crimson mr-2">•</span>
                  Emergency situations require immediate donor response
                </li>
                <li className="flex items-start">
                  <span className="text-crimson mr-2">•</span>
                  Lack of coordination between donors and health centers
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-midnight dark:text-gray-50 mb-4">
                Our Solution
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-teal-green mr-2">✓</span>
                  Real-time matching of donors with urgent requests
                </li>
                <li className="flex items-start">
                  <span className="text-teal-green mr-2">✓</span>
                  Instant notifications via Telegram and email
                </li>
                <li className="flex items-start">
                  <span className="text-teal-green mr-2">✓</span>
                  Verified donor database with availability tracking
                </li>
                <li className="flex items-start">
                  <span className="text-teal-green mr-2">✓</span>
                  Seamless coordination and appointment scheduling
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Together, we're building a network that saves lives every day
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-crimson dark:text-red-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core principles guide everything we do at Bloodlink
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border dark:border-gray-600">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-midnight dark:text-gray-50 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Passionate professionals dedicated to saving lives through innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-off-white dark:bg-gray-700 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold text-midnight dark:text-gray-50 mb-2">
                  {member.name}
                </h3>
                <div className="text-crimson dark:text-red-400 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-midnight dark:text-gray-50 mb-6">
              Our Story
            </h2>
            <div className="text-left space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                Bloodlink was born from a simple yet powerful realization: in our connected world, 
                finding a blood donor shouldn't be harder than ordering food. Our founders, 
                having witnessed firsthand the challenges faced by hospitals during blood shortages, 
                knew technology could bridge this critical gap.
              </p>
              <p>
                What started as a weekend hackathon project has grown into a platform that serves 
                hundreds of health centers and thousands of donors. We've learned that saving lives 
                isn't just about technology—it's about building trust, fostering community, and 
                making the donation process as seamless as possible.
              </p>
              <p>
                Today, Bloodlink continues to evolve, driven by feedback from our community of 
                donors and health centers. Every feature we build, every notification we send, 
                and every match we make is designed with one goal in mind: ensuring that when 
                someone needs blood, help is just a click away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-green to-green-600 dark:from-teal-700 dark:to-green-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Whether you're a donor ready to save lives or a health center looking 
            to connect with your community, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="bg-white text-teal-green font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Become a Donor
            </a>
            <a 
              href="/register" 
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-teal-green transition-colors"
            >
              Partner with Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}