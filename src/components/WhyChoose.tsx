import React from 'react'

const ITEMS = [
  {
    title: 'Trusted Security',
    desc: 'Your data is encrypted in transit and at rest with strict access.',
  },
  {
    title: 'Accurate Insights',
    desc: 'Real-time rules and rates keep your analyses sharp and compliant.',
  },
  {
    title: 'Human Expertise',
    desc: 'Talk to real specialists when you need depth and reassurance.',
  },
  {
    title: 'Scalable Platform',
    desc: 'From personal to business, Ziam grows with your needs.',
  },
]

export default function WhyChoose() {
  return (
    <section className="bg-[#0b1220]" id="about">
      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif text-white">Why Choose Ziam</h2>
        <p className="mt-2 text-white/70 max-w-2xl">A modern tax platform that balances automation with the human touch.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="h-10 w-10 rounded-lg bg-[#2563eb] mb-4" />
              <h3 className="text-white font-semibold">{item.title}</h3>
              <p className="text-white/80 mt-2 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


