import { Link } from 'react-router-dom'
import RegensburgSilhouette from '../sections/RegensburgSilhouette'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)' }}
    >
      {/* Regensburg silhouette inside footer */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none select-none">
        <RegensburgSilhouette variant="dark" />
      </div>

      <div className="container-max section-padding relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: '7px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16" />
                </svg>
              </div>
              <span className="font-headline text-white/90 text-sm font-semibold tracking-tight">
                Duschwerk Bayern
              </span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed font-light max-w-xs">
              Maßgeschneiderte Duschabtrennungen.<br />
              Präzise aufgemessen. Fachgerecht montiert.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white/25 uppercase text-[10px] tracking-widest mb-5 font-medium">Navigation</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/', label: 'Startseite' },
                { to: '/leistungen', label: 'Leistungen' },
                { to: '/referenzen', label: 'Referenzen' },
                { to: '/ueber-uns', label: 'Über uns' },
                { to: '/kontakt', label: 'Kontakt' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/40 hover:text-white/80 transition-colors duration-200 font-light"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/25 uppercase text-[10px] tracking-widest mb-5 font-medium">Kontakt</h4>
            <address className="not-italic text-sm text-white/40 space-y-2.5 font-light">
              <p>Musterstraße 1, 12345 Regensburg</p>
              <p>
                <a href="tel:+491234567890" className="hover:text-white/70 transition-colors duration-200">
                  +49 (0) 123 456789
                </a>
              </p>
              <p>
                <a href="mailto:info@duschwerk-bayern.de" className="hover:text-white/70 transition-colors duration-200">
                  info@duschwerk-bayern.de
                </a>
              </p>
              <p className="pt-1 text-white/25 text-xs">Mo – Fr · 08:00 – 17:00 Uhr</p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 text-xs text-white/20"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span>© {year} Duschwerk Bayern · Regensburg</span>
          <div className="flex gap-5">
            <Link to="/impressum" className="hover:text-white/40 transition-colors duration-200">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-white/40 transition-colors duration-200">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
