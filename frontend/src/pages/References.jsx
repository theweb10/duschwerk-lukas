import { useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

// ── Referenzprojekte ────────────────────────────────────────────────────────
// Bilder als src eintragen sobald verfügbar, z.B. src: '/referenzen/projekt1.jpg'
const PROJECTS = [
  {
    id: 1,
    title: 'Nischen-Dusche mit Schiebetür',
    location: 'Regensburg',
    desc: 'Maßgefertigte Nischenlösung mit zweiteiliger Schiebetür, rahmenlosem Klarglas und mattem Edelstahl-Profil.',
    src: null,
  },
  {
    id: 2,
    title: 'Eckdusche mit Drehtür',
    location: 'Pentling',
    desc: 'Eckduschkabine mit großformatigem Klarglas, verchromten Beschlägen und bodengleicher Duschwanne.',
    src: null,
  },
  {
    id: 3,
    title: 'Walk-In Dusche',
    location: 'Regensburg',
    desc: 'Offene Walk-In-Lösung mit feststehender Glasfläche, Wandhalterung ohne Seitenprofil und Edelstahl matt.',
    src: null,
  },
  {
    id: 4,
    title: 'Badewannenaufsatz',
    location: 'Neutraubling',
    desc: 'Klapptür-Aufsatz auf bestehender Badewanne mit Satinato-Glas und Messing-Beschlägen.',
    src: null,
  },
  {
    id: 5,
    title: 'Dusche mit Seitenblende',
    location: 'Regensburg',
    desc: 'Nischendusche mit fixer Seitenblende, großformatigem Klarglas und schwarzen Profilen.',
    src: null,
  },
]

// ── Platzhalter-Bild wenn kein src vorhanden ────────────────────────────────
function PlaceholderSlide({ index }) {
  const hues = [210, 195, 220, 205, 215]
  const h = hues[index % hues.length]
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `hsl(${h}, 18%, 92%)`,
        gap: '12px',
      }}
    >
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="44" height="32" rx="4" stroke={`hsl(${h}, 25%, 65%)`} strokeWidth="1.8"/>
        <circle cx="16" cy="22" r="4" stroke={`hsl(${h}, 25%, 65%)`} strokeWidth="1.5"/>
        <path d="M4 34 l10-8 8 6 8-10 18 14" stroke={`hsl(${h}, 25%, 65%)`} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: '12px', color: `hsl(${h}, 20%, 58%)`, fontWeight: 500, letterSpacing: '0.04em' }}>
        Referenzbild folgt
      </span>
    </div>
  )
}

// ── Diashow-Komponente ──────────────────────────────────────────────────────
function Slideshow({ projects }) {
  const [current, setCurrent] = useState(0)
  const [animDir, setAnimDir] = useState(null) // 'left' | 'right'
  const [isAnimating, setIsAnimating] = useState(false)

  const go = useCallback((dir) => {
    if (isAnimating) return
    setAnimDir(dir)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrent(i => dir === 'right'
        ? (i + 1) % projects.length
        : (i - 1 + projects.length) % projects.length
      )
      setIsAnimating(false)
      setAnimDir(null)
    }, 280)
  }, [isAnimating, projects.length])

  const prev = useCallback(() => go('left'),  [go])
  const next = useCallback(() => go('right'), [go])

  const p = projects[current]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Haupt-Slide */}
      <div
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Bild-Bereich */}
        <div
          style={{
            height: '420px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'opacity 0.28s ease',
            opacity: isAnimating ? 0 : 1,
          }}
        >
          {p.src ? (
            <img
              src={p.src}
              alt={p.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <PlaceholderSlide index={current} />
          )}

          {/* Zähler oben rechts */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.42)',
              color: 'white',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              backdropFilter: 'blur(6px)',
            }}
          >
            {current + 1} / {projects.length}
          </div>

          {/* Pfeil Links */}
          <button
            onClick={prev}
            aria-label="Vorheriges Bild"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.92)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 14L6 9l5-5" stroke="#1F2E4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Pfeil Rechts */}
          <button
            onClick={next}
            aria-label="Nächstes Bild"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.92)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4l5 5-5 5" stroke="#1F2E4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Projekt-Info */}
        <div
          style={{
            padding: '28px 36px',
            transition: 'opacity 0.28s ease',
            opacity: isAnimating ? 0 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-headline, Georgia, serif)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1F2E4A',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {p.title}
            </h2>
            <span style={{ fontSize: '12px', color: '#8892A4', fontWeight: 400 }}>{p.location}</span>
          </div>
          <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 300, lineHeight: '1.65', margin: 0 }}>
            {p.desc}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => { if (!isAnimating && i !== current) { setAnimDir(i > current ? 'right' : 'left'); setIsAnimating(true); setTimeout(() => { setCurrent(i); setIsAnimating(false); setAnimDir(null) }, 280) } }}
            aria-label={`Projekt ${i + 1}`}
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === current ? '#C62828' : '#C8CDD6',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.25s ease, background 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Thumbnail-Leiste */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {projects.map((proj, i) => (
          <button
            key={i}
            onClick={() => { if (!isAnimating && i !== current) { setIsAnimating(true); setTimeout(() => { setCurrent(i); setIsAnimating(false) }, 280) } }}
            style={{
              flex: '0 0 100px',
              height: '68px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: i === current ? '2px solid #C62828' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              background: 'transparent',
              transition: 'border-color 0.2s, opacity 0.2s',
              opacity: i === current ? 1 : 0.62,
            }}
            onMouseEnter={e => { if (i !== current) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { if (i !== current) e.currentTarget.style.opacity = '0.62' }}
          >
            {proj.src ? (
              <img src={proj.src} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <PlaceholderSlide index={i} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Seite ───────────────────────────────────────────────────────────────────
export default function References() {
  return (
    <>
      <Helmet>
        <title>Referenzen | Duschwerk Bayern Regensburg</title>
        <meta name="description" content="Referenzprojekte von Duschwerk Bayern: Maßgefertigte Duschabtrennungen und Badumbauten in Regensburg und Umgebung." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/referenzen" />
      </Helmet>

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
          <Slideshow projects={PROJECTS} />
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
