
interface HeroProps {
  onGetStarted: () => void
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section id="home" className="section section-light">
      <div className="page-container grid md:grid-cols-2 gap-24px items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-[#111827]">
            Taxify - Smart Tax Planning Made Simple
          </h1>
          <p className="mt-8px text-[#111827]/70 text-lg">
            Upload your documents, connect your CRM, and get personalized tax insights with AI-powered analysis to maximize your savings.
          </p>
          <div className="mt-24px btn-group">
            <button
              onClick={onGetStarted}
              className="btn btn-primary btn-pill"
            >
              Get Started
            </button>
            <a href="#services" className="btn btn-ghost btn-pill">Learn more</a>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 shadow-inner" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#2563eb]/10" />
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-[#2563eb]/20" />
        </div>
      </div>
    </section>
  )
}


