import NavBar from './NavBar'
import Hero from './Hero'
import Partners from './Partners'
import FeatureCards from './FeatureCards'
import WhyChoose from './WhyChoose'
import SiteFooter from './SiteFooter'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <NavBar onGetStarted={onGetStarted} onBookNow={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Partners />
      <FeatureCards />
      <WhyChoose />
      <SiteFooter />
    </div>
  )
}


