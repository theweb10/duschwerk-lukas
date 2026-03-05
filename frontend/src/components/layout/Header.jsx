import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import DomIcon from '../icons/DomIcon'

const navLinks = [
  { to: '/leistungen', label: 'Leistungen' },
  { to: '/referenzen', label: 'Referenzen' },
  { to: '/ueber-uns', label: 'Über uns' },
  { to: '/konfigurator', label: 'Konfigurator' },
  { to: '/kontakt', label: 'Kontakt' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: scrolled
          ? '0 1px 0 rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.05)'
          : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(0,0,0,0.06)'
          : '1px solid transparent',
      }}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between transition-all duration-300"
          style={{ height: scrolled ? '60px' : '72px' }}
        >

          {/* ── Logo Mark + Wordmark ──────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-4 group"
            aria-label="Duschwerk Bayern – Startseite"
          >
            {/* SVG Logo Mark – shrinks on scroll + glass shine */}
            <div
              className="glass-shine transition-all duration-300 flex-shrink-0"
              style={{
                transform: scrolled ? 'scale(0.80)' : 'scale(1)',
                transformOrigin: 'left center',
                borderRadius: '6px',
              }}
            >
              <DomIcon size={42} />
            </div>

            {/* Wordmark */}
            <div className="flex flex-col justify-center leading-none">
              <div
                className="flex items-center gap-[7px] transition-all duration-300"
                style={{ marginBottom: '4px' }}
              >
                {/* Duschwerk – SF Pro Bold, optisches Kerning */}
                <span
                  style={{
                    color: '#1F2E4A',
                    fontSize: scrolled ? '15px' : '19px',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    transition: 'font-size 0.3s ease',
                  }}
                >
                  Duschwerk
                </span>

                {/* Vertikaler Separator */}
                <span
                  style={{
                    display: 'inline-block',
                    width: '1px',
                    height: scrolled ? '12px' : '15px',
                    background: 'rgba(46,76,125,0.22)',
                    borderRadius: '1px',
                    flexShrink: 0,
                    transition: 'height 0.3s ease',
                  }}
                />

                {/* Bayern – SF Pro Light, offenes Tracking */}
                <span
                  style={{
                    color: '#2E4C7D',
                    fontSize: scrolled ? '15px' : '19px',
                    fontWeight: 300,
                    letterSpacing: '0.07em',
                    lineHeight: 1,
                    transition: 'font-size 0.3s ease',
                  }}
                >
                  Bayern
                </span>
              </div>

              {/* Tagline */}
              <span
                style={{
                  color: '#9CA3AF',
                  fontSize: scrolled ? '8px' : '9.5px',
                  fontWeight: 400,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  transition: 'font-size 0.3s ease',
                  lineHeight: 1,
                }}
              >
                Regensburg
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Hauptnavigation">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-gray-400 hover:text-primary font-normal'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link to="/kontakt" className="btn-primary ml-1 px-5 py-2 text-xs">
              Aufmaß buchen
            </Link>
          </nav>

          {/* ── Mobile Burger ─────────────────────────── */}
          <button
            className="md:hidden text-primary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <nav className="container-max px-4 py-5 flex flex-col gap-0.5">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-3 text-sm transition-colors duration-200 min-h-[44px] flex items-center rounded-lg ${
                    isActive
                      ? 'text-primary font-medium bg-gray-50'
                      : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link to="/kontakt" className="btn-primary text-xs mt-3 w-full">
              Jetzt Aufmaß buchen
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
