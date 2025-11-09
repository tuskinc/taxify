import React from 'react'

export default function SiteFooter() {
  return (
    <footer className="bg-[#0b1220] text-white" id="contact">
      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="h-9 w-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold">Z</div>
          <p className="mt-3 text-white/70 text-sm">Ziam — smarter tax planning for everyone.</p>
        </div>
        <div>
          <h4 className="font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-white/80 text-sm">
            <li><a href="#about" className="hover:text-white">About</a></li>
            <li><a href="#services" className="hover:text-white">Services</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Support</h4>
          <ul className="mt-3 space-y-2 text-white/80 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-white/80 text-sm">
            <li>support@ziam.app</li>
            <li>+1 (555) 123-4567</li>
            <li className="flex space-x-3 pt-2">
              <span className="h-6 w-6 rounded bg-white/20" />
              <span className="h-6 w-6 rounded bg-white/20" />
              <span className="h-6 w-6 rounded bg-white/20" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto pl-4 pr-4 sm:px-6 lg:px-8 text-sm text-white/60">© {new Date().getFullYear()} Ziam. All rights reserved.</div>
      </div>
    </footer>
  )
}


