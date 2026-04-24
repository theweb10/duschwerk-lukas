import { Link } from 'react-router-dom'

const services = [
  {
    number: '01',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M16 3h5m0 0v5m0-5l-7 7" />
      </svg>
    ),
    title: 'Präzisionsaufmaß',
    description: 'Exakte Maßaufnahme vor Ort – für eine passgenaue Duschabtrennung ohne Nacharbeiten.',
  },
  {
    number: '02',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Fachgerechte Montage',
    description: 'Professionelle Installation durch erfahrene Fachkräfte – sauber, termintreu, ohne Folgeschäden.',
  },
  {
    number: '03',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Beratung & Planung',
    description: 'Individuelle Beratung zu Glasart, Rahmen und Design – kostenlos und unverbindlich.',
  },
  {
    number: '04',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Hochwertige Materialien',
    description: 'Geprüftes Sicherheitsglas und zertifizierte Beschläge – für dauerhafte Qualität.',
  },
]

export default function ServicesPreview() {
  return (
    <section className="section-padding" style={{ background: '#ECEEF2' }}>
      <div className="container-max">

        <header className="mb-14 text-center" data-reveal>
          <p className="eyebrow mb-3">Leistungen</p>
          <h2
            className="font-headline text-3xl sm:text-4xl text-primary"
            style={{ letterSpacing: '-0.03em' }}
          >
            Alles aus einer Hand.
          </h2>
        </header>

        <div className="cards-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {services.map(({ number, icon, title, description }, i) => (
            <article key={number} data-reveal data-reveal-delay={i * 80} className="card-3d p-7 group cursor-default">
              {/* Icon */}
              <div
                className="w-10 h-10 flex items-center justify-center mb-5 text-gray-400 group-hover:text-primary transition-colors duration-200"
                style={{
                  background: '#EEF1F6',
                  borderRadius: '8px',
                }}
              >
                {icon}
              </div>
              {/* Number */}
              <span className="text-gray-200 text-xs font-semibold tracking-widest block mb-2">{number}</span>
              <h3
                className="font-headline text-base text-primary font-semibold mb-2.5"
                style={{ letterSpacing: '-0.02em' }}
              >
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">{description}</p>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/leistungen" className="btn-outline text-xs px-6 py-2.5">
            Alle Leistungen ansehen →
          </Link>
        </div>
      </div>
    </section>
  )
}
