import React from 'react'

interface HeroProps {
  onGetStarted: () => void
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section id="home" className="bg-[#fdf9f6]">
      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-[#111827]">
            Personalized tax planning built for you
          </h1>
          <p className="mt-4 text-[#111827]/70 text-lg">
            Ziam helps individuals and businesses explore, connect, and get support with data-backed tax strategies.
          </p>
          <div className="mt-8 flex items-center space-x-4">
            <button
              onClick={onGetStarted}
              className="rounded-full bg-[#2563eb] text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
            <a href="#services" className="text-[#2563eb] font-medium hover:underline">Learn more</a>
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


