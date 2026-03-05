import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const values = [
  { title: 'Präzision', desc: 'Jede Maßangabe wird exakt umgesetzt. Kein Spielraum für Kompromisse.' },
  { title: 'Qualität', desc: 'Nur geprüfte Materialien und zertifiziertes Sicherheitsglas.' },
  { title: 'Verlässlichkeit', desc: 'Vereinbarte Termine werden eingehalten – Punkt.' },
  { title: 'Ehrlichkeit', desc: 'Transparente Angebote ohne versteckte Kosten.' },
]

const team = [
  {
    name: 'Thomas K.',
    role: 'Inhaber & Experte',
    desc: 'Spezialist für maßgeschneiderte Duschabtrennungen',
    photo: 'photo-1472099645785-5658abf4ff4e',
  },
  {
    name: 'Markus S.',
    role: 'Monteur & Aufmessung',
    desc: 'Präzisionsaufmessung und fachgerechte Montage',
    photo: 'photo-1500648767791-00dcc994a43e',
  },
  {
    name: 'Sarah M.',
    role: 'Beratung & Planung',
    desc: 'Ihr erster Ansprechpartner für alle Fragen',
    photo: 'photo-1438761681033-6461ffad8d80',
  },
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>Über uns | Duschwerk Bayern Regensburg</title>
        <meta name="description" content="Duschwerk Bayern Regensburg – Ihr Experte für maßgeschneiderte Duschabtrennungen mit hochwertigen Materialien und präziser Montage." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/ueber-uns" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-3">Über uns</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Duschwerk Bayern.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Präzise Duschabtrennungen vom Experten – mit hochwertigen Materialien und fachgerechter Montage in Regensburg und Bayern.
          </p>
        </div>
      </div>

      <main>

        {/* Story */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-3">Unsere Geschichte</p>
                <h2 className="font-headline text-3xl sm:text-4xl text-primary mb-8" style={{ letterSpacing: '-0.03em' }}>
                  Fokus auf das Wesentliche.
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed font-light text-sm">
                  <p>
                    Duschwerk Bayern steht für maßgeschneiderte Duschabtrennungen nach höchsten Qualitätsstandards. Unser Fokus liegt zu 100 % auf Duschabtrennungen – von der Präzisionsaufmessung bis zur fachgerechten Montage.
                  </p>
                  <p>
                    Wir arbeiten ausschließlich mit geprüftem Sicherheitsglas und zertifizierten Beschlägen. Jede Abtrennung wird individuell geplant und exakt auf Ihr Bad abgestimmt – kein Standardprodukt, sondern Ihre Lösung.
                  </p>
                  <p>
                    Unser Anspruch: Eine Duschabtrennung, die perfekt passt – optisch, technisch und langfristig.
                  </p>
                </div>
              </div>

              {/* Company photo + timeline */}
              <div>
                <div
                  className="rounded-2xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)', height: '260px' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1613685703305-a5e3da9b3a3d?auto=format&fit=crop&w=700&q=80"
                    alt="Duschwerk Bayern – Unser Team bei der Arbeit"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-0">
                  {[
                    { year: '2015', event: 'Gründung von Duschwerk Bayern in Regensburg' },
                    { year: '2017', event: 'Spezialisierung auf maßgefertigte Duschabtrennungen' },
                    { year: '2019', event: 'Einführung der Präzisionsaufmessung vor Ort' },
                    { year: '2022', event: 'Erweiterung des Montageteams' },
                    { year: '2025', event: 'Über 300 erfolgreich montierte Duschabtrennungen' },
                  ].map(({ year, event }, i, arr) => (
                    <div
                      key={year}
                      className={`flex gap-5 py-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <span className="font-semibold text-gray-300 text-xs w-10 flex-shrink-0 pt-0.5">{year}</span>
                      <p className="text-gray-500 text-sm font-light">{event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding" style={{ background: '#F5F5F5' }}>
          <div className="container-max">
            <header className="mb-12">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-3">Team</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>
                Die Menschen dahinter.
              </h2>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {team.map(({ name, role, desc, photo }) => (
                <article key={name} className="card-3d overflow-hidden">
                  <div className="h-56 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&q=80`}
                      alt={name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-headline text-base text-primary font-semibold tracking-tight">{name}</h3>
                    <p className="text-gray-400 text-[10px] font-medium mt-1 mb-2 uppercase tracking-wider">{role}</p>
                    <p className="text-gray-500 text-sm font-light">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <header className="mb-12">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-3">Werte</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>
                Was uns ausmacht.
              </h2>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map(({ title, desc }) => (
                <div key={title} className="card-3d p-7">
                  <div
                    className="w-8 h-8 flex items-center justify-center mb-4"
                    style={{ background: '#EEF1F6', borderRadius: '8px' }}
                  >
                    <span className="font-headline text-sm text-gray-400 font-semibold">{title[0]}</span>
                  </div>
                  <h3 className="font-semibold text-primary text-sm tracking-tight mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section
        className="section-padding text-center"
        style={{ background: 'linear-gradient(135deg, #1F2E4A 0%, #2E4C7D 100%)' }}
      >
        <div className="container-max">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Kontakt</p>
          <h2 className="font-headline text-3xl text-white mb-4" style={{ letterSpacing: '-0.03em' }}>Lernen Sie uns kennen.</h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto font-light text-sm">Wir beraten Sie gerne – kostenlos und unverbindlich.</p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">Kontakt aufnehmen</Link>
        </div>
      </section>
    </>
  )
}
