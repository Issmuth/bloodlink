'use client'

import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import HowItWorksSection from '../components/HowItWorksSection'
import ImpactSection from '../components/ImpactSection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ImpactSection />
      <CTASection />
      <Footer />
    </>
  )
} 