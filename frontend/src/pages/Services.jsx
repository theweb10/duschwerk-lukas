import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const servicePhotos = [
  'photo-1552321554-5fefe8c9ef14',  // walk-in shower
  'photo-1584622650111-993a426fbf0a', // bathroom renovation
  'photo-1507652313519-d4e9174996dd', // accessories
]

const services = [
  {
    id: 'duschabtrennungen',
    title: 'Maßgefertigte Duschabtrennungen',
    description: 'Der Schwerpunkt von Duschwerk Bayern liegt auf der Planung und Umsetzung maßgefertigter Duschabtrennungen. Jede Dusche wird individuell an die räumlichen Gegebenheiten sowie an die gestalterischen Vorstellungen der Kunden angepasst.',
    features: ['Nischenlösung', 'Eckdusche', 'Walk-In Dusche', 'Badewannenaufsatz', 'Beratung & Aufmaß vor Ort'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    id: 'teilsanierung',
    title: 'Badewanne zur Dusche umbauen',
    description: 'Ein wichtiger Leistungsbereich ist der Umbau bestehender Badewannen zu modernen und komfortablen Duschanlagen. Passende Duschwannen, Wandpaneele sowie Armaturen werden geliefert und durch langjährige Subunternehmer fachgerecht montiert.',
    features: ['Duschwannen', 'Wandpaneele (Artwall)', 'Armaturen', 'Altersgerechter Umbau', 'Schnelle Umsetzung', 'Minimaler Eingriff in Bausubstanz'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    id: 'zubehoer',
    title: 'Zubehör & Ergänzungen',
    description: 'Ergänzend werden verschiedene Zubehörartikel und praktische Ergänzungen für den Duschbereich angeboten – für eine komfortable Nutzung und langfristige Pflege der Dusche.',
    features: ['Duschabzieher', 'Reinigungsprodukte', 'Handtuchhalter', 'Funktionale Ausstattungselemente', 'Hochwertige Markenprodukte', 'Auf Anfrage erhältlich'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
    ),
  },
]

const ablaufSteps = [
  { nr: '01', title: 'Anfrage', desc: 'Sie nehmen Kontakt auf – telefonisch, per E-Mail oder über das Kontaktformular.' },
  { nr: '02', title: 'Beratung', desc: 'Persönliche Beratung direkt bei Ihnen oder in unserer Ausstellung in Regensburg.' },
  { nr: '03', title: 'Aufmaß', desc: 'Präzises Aufmaß durch unser Fachpersonal vor Ort – für eine passgenaue Planung.' },
  { nr: '04', title: 'Angebot', desc: 'Sie erhalten ein individuelles Angebot auf Basis Ihrer Wünsche und des Aufmaßes.' },
  { nr: '05', title: 'Bestellung', desc: 'Nach Ihrer Freigabe wird die Duschabtrennung bestellt und termingerecht geliefert.' },
  { nr: '06', title: 'Montage', desc: 'Fachgerechte Montage durch erfahrene Monteure – sauber und termintreu.' },
]

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Leistungen | Duschwerk Bayern – Duschabtrennungen & Badumbau</title>
        <meta name="description" content="Maßgefertigte Duschabtrennungen, Badewanne zur Dusche umbauen, Zubehör – Komplettservice aus einer Hand von Duschwerk Bayern in Regensburg." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/leistungen" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero text-center">
        <div className="container-max">
          <p className="eyebrow mb-3">Leistungen</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Unsere Leistungen.
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-base font-light leading-relaxed">
            Von der persönlichen Beratung über das Aufmaß bis zur fachgerechten Montage – alles aus einer Hand.
          </p>
        </div>
      </div>

      <main className="section-padding" style={{ background: '#ECEEF2' }}>
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ id, title, description, features, icon }, index) => (
              <article key={id} id={id} className="card-3d overflow-hidden flex flex-col">
                {/* Photo */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/${servicePhotos[index]}?auto=format&fit=crop&w=700&q=80`}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-8 text-center flex flex-col flex-1">
                  <span className="text-gray-300 text-[10px] font-semibold tracking-widest uppercase mb-3 block">0{index + 1}</span>
                  <div
                    className="w-12 h-12 flex items-center justify-center mb-4 mx-auto text-white"
                    style={{ background: '#1F2E4A', borderRadius: '12px' }}
                  >
                    {icon}
                  </div>
                  <h2 className="font-headline text-xl text-primary mb-3" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
                  <p className="text-gray-500 leading-relaxed mb-6 font-light text-sm">{description}</p>
                  <ul className="flex flex-wrap justify-center gap-2 mb-8">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="text-xs text-gray-500 font-light px-3 py-1"
                        style={{ background: '#EEF1F6', borderRadius: '100px' }}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Link to="/kontakt" className="btn-outline text-xs px-6 py-2.5">
                      Anfrage stellen →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Ablauf */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <header className="mb-12 text-center">
            <p className="eyebrow mb-3">Ablauf</p>
            <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>
              So funktioniert Ihr Weg zur neuen Dusche.
            </h2>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ablaufSteps.map(({ nr, title, desc }) => (
              <div key={nr} className="card-3d p-7">
                <span className="text-gray-200 text-2xl font-bold font-headline block mb-3">{nr}</span>
                <h3 className="font-semibold text-primary text-sm tracking-tight mb-2">{title}</h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-8 font-light">
            <span className="font-semibold" style={{ color: '#C62828' }}>Hinweis:</span>{' '}Das finale Aufmaß erfolgt immer durch unser Fachpersonal.
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #1F2E4A 0%, #2E4C7D 100%)' }}>
        <div className="container-max text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Beratung</p>
          <h2 className="font-headline text-3xl text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Nicht sicher, welche Lösung passt?
          </h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto font-light text-sm">
            Wir beraten Sie kostenlos und finden gemeinsam die optimale Duschlösung für Ihre Situation.
          </p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">Beratung anfragen</Link>
        </div>
      </section>
    </>
  )
}
