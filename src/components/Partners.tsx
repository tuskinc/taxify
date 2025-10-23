
export default function Partners() {
  const partners = ['Shell', 'Apple', 'Ferrari', 'Stripe', 'Netflix']
  return (
    <section aria-label="Partners" className="section section-light">
      <div className="page-container">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-16px opacity-70">
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


