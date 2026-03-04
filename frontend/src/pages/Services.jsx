import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const servicePhotos = [
  'photo-1552321554-5fefe8c9ef14',  // walk-in shower
  'photo-1507652313519-d4e9174996dd', // measuring
  'photo-1600566752355-35792bedcfea', // installation
  'photo-1584622650111-993a426fbf0a', // consultation / bathroom
]

const services = [
  {
    id: 'duschabtrennungen',
    title: 'Duschabtrennungen nach Maß',
    description: 'Ob rahmenlos, halbgerahmt oder gerahmt – wir fertigen Ihre Duschabtrennung exakt nach Ihren Wünschen. Maßgeschneiderte Lösungen für jede Badsituation.',
    features: ['Rahmenlose Ausführungen', 'Halbgerahmte Modelle', 'Walk-in-Duschen', 'Drehtüren & Schiebetüren', 'Nischenlösungen', 'Sondermaße & Sonderformen'],
    icon: '🚿',
  },
  {
    id: 'aufmessung',
    title: 'Präzisionsaufmessung',
    description: 'Jede maßgeschneiderte Duschabtrennung beginnt mit einer exakten Aufmessung vor Ort. Wir erfassen alle Maße präzise – für eine passgenaue Fertigung ohne Nacharbeiten.',
    features: ['Aufmessung beim Kunden vor Ort', 'Schrägen & Nischenmaße', 'Bodenunebenheiten', 'Digitale Dokumentation', 'Sofortige Machbarkeitseinschätzung', 'Unverbindliche Beratung'],
    icon: '📐',
  },
  {
    id: 'montage',
    title: 'Fachgerechte Montage',
    description: 'Professionelle Montage durch erfahrene Fachkräfte. Hochwertige Materialien werden fachgerecht verarbeitet – sauber, termintreu, ohne Schmutz.',
    features: ['Professionelle Montage', 'Saubere Ausführung', 'Dichtungen inbegriffen', 'Beschlag- & Profilmontage', 'Funktionsprüfung vor Ort', 'Einweisung nach Montage'],
    icon: '🔧',
  },
  {
    id: 'beratung',
    title: 'Beratung & Planung',
    description: 'Individuelle Beratung zu Glasart, Rahmen, Beschlägen und Design. Kostenlos und unverbindlich – damit Sie die beste Lösung für Ihr Bad finden.',
    features: ['Kostenlose Erstberatung', 'Glasarten & Stärken', 'Rahmen- & Profilwahl', 'Beschlag- & Griffauswahl', 'Klarglas, Satinato, Strukturglas', 'Visualisierung der Lösung'],
    icon: '💬',
  },
]

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Leistungen | Duschwerk Bayern – Maßgeschneiderte Duschabtrennungen</title>
        <meta name="description" content="Maßgeschneiderte Duschabtrennungen, Präzisionsaufmessung, fachgerechte Montage mit hochwertigen Materialien – alles aus einer Hand von Duschwerk Bayern Regensburg." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/leistungen" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-3">Leistungen</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Unsere Leistungen.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Von der Aufmessung bis zur Montage – maßgeschneiderte Duschabtrennungen mit hochwertigen Materialien.
          </p>
        </div>
      </div>

      <main className="section-padding" style={{ background: '#F5F5F5' }}>
        <div className="container-max space-y-6">
          {services.map(({ id, title, description, features, icon }, index) => (
            <article
              key={id}
              id={id}
              className={`card-3d p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
            >
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <span className="text-gray-300 text-[10px] font-semibold tracking-widest uppercase mb-3 block">0{index + 1}</span>
                <div className="text-3xl mb-4">{icon}</div>
                <h2 className="font-headline text-2xl text-primary mb-3" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
                <p className="text-gray-500 leading-relaxed mb-6 font-light text-sm">{description}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-silver flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/kontakt" className="btn-outline text-xs px-6 py-2.5">
                  Anfrage stellen →
                </Link>
              </div>

              <div className={`rounded-xl aspect-video overflow-hidden ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}
                   style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <img
                  src={`https://images.unsplash.com/${servicePhotos[index]}?auto=format&fit=crop&w=700&q=80`}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>
      </main>

      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <div className="container-max text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Beratung</p>
          <h2 className="font-headline text-3xl text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Nicht sicher, welche Lösung passt?
          </h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto font-light text-sm">
            Wir beraten Sie kostenlos und finden gemeinsam die optimale Duschabtrennung.
          </p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">Beratung anfragen</Link>
        </div>
      </section>
    </>
  )
}
