import React from 'react'

interface NavBarProps {
  onBookNow?: () => void
  onGetStarted?: () => void
}

export default function NavBar({ onBookNow, onGetStarted }: NavBarProps) {
  return (
    <header className="w-full bg-[#fdf9f6]/90 backdrop-blur supports-[backdrop-filter]:bg-[#fdf9f6]/80 border-b border-[#f5f5f5] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold">Z</div>
            <span className="text-xl font-serif font-semibold text-[#111827]">Ziam</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-[#111827]">
            <a href="#home" className="hover:text-[#2563eb] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#2563eb] transition-colors">About</a>
            <a href="#services" className="hover:text-[#2563eb] transition-colors">Services</a>
            <a href="#contact" className="hover:text-[#2563eb] transition-colors">Contact</a>
            <button
              onClick={onBookNow}
              className="ml-4 rounded-full bg-[#2563eb] text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </nav>
          <div className="md:hidden">
            <button
              onClick={onGetStarted}
              className="rounded-full bg-[#2563eb] text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}


