
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
    <section id="about" className="section-dark wave-top wave-bottom">
      {/* top wave */}
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,64 C240,16 480,16 720,48 C960,80 1200,80 1440,48 L1440,0 L0,0 Z" fill="#0b1220" />
      </svg>
      <div className="page-container py-48px">
        <h2 className="text-3xl font-serif text-white">Why Choose Ziam?</h2>
        <p className="mt-8px text-white/70 max-w-2xl">A modern tax platform that balances automation with the human touch.</p>
        <div className="mt-24px grid sm:grid-cols-2 lg:grid-cols-4 gap-24px">
          {ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 p-24px">
              <div className="h-10 w-10 rounded-lg bg-[#2563eb] mb-16px" />
              <h3 className="text-white font-semibold">{item.title}</h3>
              <p className="text-white/80 mt-8px text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* bottom wave */}
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,48 C240,80 480,80 720,48 C960,16 1200,16 1440,48 L1440,80 L0,80 Z" fill="#fdf9f6" />
      </svg>
    </section>
  )
}


