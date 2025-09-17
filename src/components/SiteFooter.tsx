import React from 'react'

export default function SiteFooter() {
  return (
    <footer className="section-dark" id="contact">
      <div className="page-container py-24px grid md:grid-cols-4 gap-24px text-white">
        <div>
          <div className="h-9 w-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold">Z</div>
          <p className="mt-8px text-white/70 text-sm">Ziam — smarter tax planning for everyone.</p>
        </div>
        <div>
          <h4 className="font-semibold">Company</h4>
          <ul className="mt-8px space-y-8px text-white/80 text-sm">
            <li><a href="#about" className="hover:text-white">About</a></li>
            <li><a href="#services" className="hover:text-white">Services</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Support</h4>
          <ul className="mt-8px space-y-8px text-white/80 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-8px space-y-8px text-white/80 text-sm">
            <li>support@ziam.app</li>
            <li>+1 (555) 123-4567</li>
            <li className="flex gap-12px pt-8px">
              <span className="h-6 w-6 rounded bg-white/20" />
              <span className="h-6 w-6 rounded bg-white/20" />
              <span className="h-6 w-6 rounded bg-white/20" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-16px">
        <div className="page-container text-sm text-white/60">© {new Date().getFullYear()} Ziam. All rights reserved.</div>
      </div>
    </footer>
  )
}


