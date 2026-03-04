import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link } from 'react-router-dom'

// Unsplash-Fotos: Dusche, Glas, Bad, Architektur
const photoIds = [
  'photo-1552321554-5fefe8c9ef14', // shower glass
  'photo-1584622650111-993a426fbf0a', // bathroom
  'photo-1552321554-5fefe8c9ef14',
  'photo-1507652313519-d4e9174996dd', // modern shower
  'photo-1600566752355-35792bedcfea', // bathroom interior
  'photo-1613685703305-a5e3da9b3a3d', // glass shower
  'photo-1558618666-fcd25c85cd64', // modern bath
  'photo-1600607687920-4e2a09cf159d', // shower
  'photo-1571902943202-507ec2618e8f', // bath design
]

const projects = [
  { id: 1, title: 'Rahmenlose Walk-in-Dusche', category: 'Walk-in', location: 'Regensburg', description: 'Walk-in mit 10mm ESG-Klarglas, bodenbündig eingebaut', photo: photoIds[0] },
  { id: 2, title: 'Nischen-Schiebetür', category: 'Schiebetüren', location: 'Augsburg', description: 'Zweiteilige Schiebetür in Nische, 180cm breit, rahmenlos', photo: photoIds[1] },
  { id: 3, title: 'Badewannen-Abtrennung', category: 'Duschabtrennungen', location: 'Ingolstadt', description: 'Satinierte Glasabtrennung zur Wannenabtrennung, Chromprofil', photo: photoIds[2] },
  { id: 4, title: 'Eck-Duschabtrennung', category: 'Duschabtrennungen', location: 'Nürnberg', description: 'Eckeinstieg mit Drehtüren, Chromrahmen, 90×90cm', photo: photoIds[3] },
  { id: 5, title: 'Walk-in Schrägdach', category: 'Walk-in', location: 'München', description: 'Sonderanfertigung unter Dachschräge, individuell angepasst', photo: photoIds[4] },
  { id: 6, title: 'Drehtür-Nische', category: 'Drehtüren', location: 'Regensburg', description: 'Eintürige Drehtür, halbgerahmt, 80cm breit', photo: photoIds[5] },
  { id: 7, title: 'Doppel-Schiebetür', category: 'Schiebetüren', location: 'Landsberg', description: 'Doppelschiebetür, 160cm, 8mm ESG mit Nano-Beschichtung', photo: photoIds[6] },
  { id: 8, title: 'Pentagonale Duschabtrennung', category: 'Duschabtrennungen', location: 'Dachau', description: 'Fünfeckige Duschabtrennung als Sondermaßanfertigung', photo: photoIds[7] },
  { id: 9, title: 'Walk-in mit Festteil', category: 'Walk-in', location: 'Freising', description: 'Walk-in mit festem Seitenteil, 120cm Eingangsbreite', photo: photoIds[8] },
]

const categories = ['Alle', 'Duschabtrennungen', 'Walk-in', 'Schiebetüren', 'Drehtüren']

const heights = [260, 320, 280, 300, 260, 310, 280, 300, 270]

export default function References() {
  const [activeCategory, setActiveCategory] = useState('Alle')
  const [loadError, setLoadError] = useState({})

  const filtered = activeCategory === 'Alle'
    ? projects
    : projects.filter((p) => p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Referenzen | Duschwerk Bayern Regensburg</title>
        <meta name="description" content="Referenzprojekte von Duschwerk Bayern: Maßgeschneiderte Duschabtrennungen, Walk-in-Duschen, Schiebetüren und Drehtüren in Regensburg und Bayern." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/referenzen" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-3">Referenzen</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Unsere Projekte.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Eine Auswahl abgeschlossener Projekte – jede Duschabtrennung maßgeschneidert und präzise montiert.
          </p>
        </div>
      </div>

      <main className="section-padding" style={{ background: '#F5F5F5' }}>
        <div className="container-max">

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-medium tracking-wide transition-all duration-200 min-h-[36px] ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-primary'
                }`}
                style={{ borderRadius: '8px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="card-3d break-inside-avoid overflow-hidden"
              >
                {/* Photo */}
                <div
                  className="overflow-hidden bg-gray-100"
                  style={{ height: heights[project.id - 1] }}
                >
                  {!loadError[project.id] ? (
                    <img
                      src={`https://images.unsplash.com/${project.photo}?auto=format&fit=crop&w=600&q=80`}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={() => setLoadError(prev => ({ ...prev, [project.id]: true }))}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <span className="text-gray-400 text-[10px] uppercase tracking-widest font-medium">{project.category}</span>
                  <h2 className="font-headline text-sm text-primary font-semibold tracking-tight mt-1">{project.title}</h2>
                  <p className="text-gray-500 text-xs mt-1.5 font-light leading-relaxed">{project.description}</p>
                  <p className="text-xs text-gray-300 mt-2 font-light">📍 {project.location}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <section
        className="section-padding text-center"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
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
