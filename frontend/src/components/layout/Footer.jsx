import { Link } from 'react-router-dom'
import RegensburgSilhouette from '../sections/RegensburgSilhouette'
import DomIcon from '../icons/DomIcon'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1F2E4A 0%, #162338 100%)' }}
    >
      {/* Regensburg silhouette inside footer */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none select-none">
        <RegensburgSilhouette variant="dark" />
      </div>

      <div className="container-max section-padding relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* Logo Mark – auf dunklem Hintergrund */}
              <div className="flex-shrink-0 opacity-90">
                <DomIcon size={32} />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-[5px]" style={{ marginBottom: '2px' }}>
                  <span className="font-headline font-bold text-white/90 tracking-tight" style={{ fontSize: '14px', letterSpacing: '-0.02em' }}>
                    Duschwerk
                  </span>
                  <span className="font-body font-light text-white/60" style={{ fontSize: '14px', letterSpacing: '0.01em' }}>
                    Bayern
                  </span>
                </div>
                <span className="font-body text-white/30 uppercase tracking-[0.18em]" style={{ fontSize: '8px' }}>
                  Regensburg
                </span>
              </div>
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
                { to: '/produkte', label: 'Produkte' },
                { to: '/ueber-uns', label: 'Über uns' },
                { to: '/kontakt', label: 'Kontakt' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/40 hover:text-red-500 transition-colors duration-200 font-light"
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
              <p>Prüfeninger Straße 73, 93049 Regensburg</p>
              <p>
                <a href="tel:+4915163373563" className="hover:text-red-500 transition-colors duration-200">
                  +49 151 63373563
                </a>
              </p>
              <p>
                <a href="mailto:info@duschwerk-bayern.de" className="hover:text-red-500 transition-colors duration-200">
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
            <Link to="/impressum" className="transition-colors duration-200 hover:text-red-500">Impressum</Link>
            <Link to="/datenschutz" className="transition-colors duration-200 hover:text-red-500">Datenschutz</Link>
            <Link to="/agb" className="transition-colors duration-200 hover:text-red-500">AGB</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
