

interface CardProps {
  title: string
  description: string
  cta: string
}

function Card({ title, description, cta }: CardProps) {
  return (
    <div className="rounded-3xl bg-[#2563eb] text-white p-6 shadow hover:shadow-md transition-shadow">
      <h3 className="text-xl font-serif font-semibold">{title}</h3>
      <p className="mt-2 text-white/90">{description}</p>
      <button className="mt-4 inline-flex items-center rounded-full bg-white/90 text-[#2563eb] pl-4 pr-4 py-2 font-semibold hover:bg-white transition-colors">
        {cta}
      </button>
    </div>
  )
}

export default function FeatureCards() {
  return (
    <section id="services" className="bg-[#fdf9f6]">
      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-6">
        <Card title="Explore" description="Discover tailored strategies based on your profile." cta="Explore" />
        <Card title="Connect" description="Sync financial data and get unified insights." cta="Connect" />
        <Card title="Support" description="Chat with experts and get ongoing guidance." cta="Get Support" />
      </div>
    </section>
  )
}


