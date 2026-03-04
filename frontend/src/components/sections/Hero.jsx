import { Link } from 'react-router-dom'
import RegensburgSilhouette from './RegensburgSilhouette'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(170deg, #FFFFFF 0%, #FAFAFA 60%, #F5F5F5 100%)',
      }}
      aria-label="Hero"
    >
      {/* Regensburg Silhouette – dezent im Hintergrund */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
        <RegensburgSilhouette variant="light" />
      </div>

      {/* Subtle radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(192,192,192,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center pt-20 pb-56 sm:pb-72">
        <div className="max-w-3xl mx-auto">

          {/* Location badge */}
          <div
            className="inline-flex items-center gap-2 mb-10"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(192,192,192,0.25)',
              borderRadius: '100px',
              padding: '6px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#C0C0C0' }}
            />
            <span className="text-gray-500 text-xs font-medium tracking-widest uppercase">
              Regensburg &amp; ganz Bayern
            </span>
          </div>

          {/* H1 */}
          <h1
            className="font-headline text-5xl sm:text-6xl lg:text-[72px] text-primary leading-none mb-6"
            style={{ letterSpacing: '-0.04em' }}
          >
            Ihre Experten für<br />
            <span style={{ color: '#C0C0C0' }}>maßgeschneiderte</span><br />
            Badverglasungen
          </h1>

          {/* Subtext */}
          <p className="text-gray-500 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Präzise aufgemessen. Hochwertige Materialien.<br className="hidden sm:block" />
            Fachgerecht montiert – aus einer Hand.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/kontakt" className="btn-primary px-10 py-4 text-sm">
              Jetzt Aufmaß buchen
            </Link>
            <Link to="/leistungen" className="btn-outline px-10 py-4 text-sm">
              Unsere Leistungen →
            </Link>
          </div>

          {/* Trust strip */}
          <div
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-xl mx-auto pt-10"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            {[
              { value: '300+', label: 'Projekte' },
              { value: '100%', label: 'Maßanfertigung' },
              { value: '24h', label: 'Reaktionszeit' },
              { value: '5 ★', label: 'Bewertung' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div
                  className="font-headline text-2xl text-primary font-semibold"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {value}
                </div>
                <div className="text-gray-400 text-xs mt-1 tracking-wider uppercase font-medium">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
