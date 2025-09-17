import React from 'react'

interface CardProps {
  title: string
  description: string
  cta: string
}

function Card({ title, description, cta }: CardProps) {
  return (
    <div className="card-elevated bg-[#2563eb] text-white">
      <h3 className="text-xl font-serif font-semibold">{title}</h3>
      <p className="mt-8px text-white/90">{description}</p>
      <button className="mt-16px btn btn-ghost btn-pill bg-white/90 text-[#2563eb] border-0 hover:bg-white">
        {cta}
      </button>
    </div>
  )
}

export default function FeatureCards() {
  return (
    <section id="services" className="section section-light">
      <div className="page-container grid md:grid-cols-3 gap-24px">
        <Card title="Explore" description="Discover tailored strategies based on your profile." cta="Explore" />
        <Card title="Connect" description="Sync financial data and get unified insights." cta="Connect" />
        <Card title="Support" description="Chat with experts and get ongoing guidance." cta="Get Support" />
      </div>
    </section>
  )
}


