import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import DomIcon from '../icons/DomIcon'

const navLinks = [
  { to: '/leistungen', label: 'Leistungen' },
  { to: '/referenzen', label: 'Referenzen' },
  { to: '/ueber-uns', label: 'Über uns' },
  { to: '/kontakt', label: 'Kontakt' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(255,255,255,0.92)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      }}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" aria-label="Startseite">
            <div
              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #222222 0%, #444444 100%)',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}
            >
              <DomIcon className="w-4 h-[18px] text-white" />
            </div>
            <div>
              <span className="font-headline text-primary text-sm font-semibold tracking-tight block leading-none">
                Duschwerk Bayern
              </span>
              <span className="text-gray-400 text-[10px] tracking-widest uppercase leading-none">
                Regensburg
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Hauptnavigation">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-gray-500 hover:text-primary font-normal'
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

          {/* Mobile burger */}
          <button
            className="md:hidden text-primary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          >
            <span
              className="block w-5 transition-all duration-200"
              style={{
                '--bars-opacity': menuOpen ? '0' : '1',
                '--cross-opacity': menuOpen ? '1' : '0',
              }}
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
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
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
