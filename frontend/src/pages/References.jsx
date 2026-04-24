import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function References() {
  return (
    <>
      <Helmet>
        <title>Referenzen | Duschwerk Bayern Regensburg</title>
        <meta name="description" content="Referenzprojekte von Duschwerk Bayern: Maßgefertigte Duschabtrennungen und Badumbauten in Regensburg und Umgebung." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/referenzen" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="eyebrow mb-3">Referenzen</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Unsere Projekte.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Realisierte Duschlösungen – individuelle Planungen, unterschiedliche Einbausituationen und Ausführungsvarianten.
          </p>
        </div>
      </div>

      <main className="section-padding" style={{ background: '#ECEEF2' }}>
        <div className="container-max">

          {/* Placeholder */}
          <div
            className="flex flex-col items-center justify-center text-center py-24 px-6"
            style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center mb-6"
              style={{ background: '#EEF1F6', borderRadius: '16px' }}
            >
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="eyebrow mb-3">In Kürze verfügbar</p>
            <h2 className="font-headline text-2xl text-primary mb-4" style={{ letterSpacing: '-0.02em' }}>
              Referenzbilder folgen.
            </h2>
            <p className="text-gray-500 text-sm font-light leading-relaxed max-w-md">
              In diesem Bereich werden zukünftig Referenzbilder bereits realisierter Projekte dargestellt – eine visuelle Präsentation verschiedener Duschlösungen, Einbausituationen und Ausführungsvarianten. Dieser Bereich befindet sich aktuell noch im Aufbau und wird laufend erweitert.
            </p>
          </div>

        </div>
      </main>

      <section
        className="section-padding text-center"
        style={{ background: 'linear-gradient(135deg, #1F2E4A 0%, #2E4C7D 100%)' }}
      >
        <div className="container-max">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Ihr Projekt</p>
          <h2 className="font-headline text-3xl text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Ihr Projekt als nächstes?
          </h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto font-light text-sm">
            Kostenloses und unverbindliches Aufmaß – wir freuen uns auf Ihr Projekt.
          </p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">Jetzt Aufmaß buchen</Link>
        </div>
      </section>
    </>
  )
}
