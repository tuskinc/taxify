import React from 'react'

export default function Partners() {
  const partners = ['Shell', 'Apple', 'Ferrari', 'Stripe', 'Netflix']
  return (
    <section aria-label="Partners" className="bg-[#fdf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 opacity-70">
          {partners.map((name) => (
            <div key={name} className="h-10 rounded-lg bg-[#f5f5f5] text-[#111827]/70 flex items-center justify-center text-sm font-medium">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


