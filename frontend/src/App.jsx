import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import CookieConsent from 'react-cookie-consent'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollToTopButton from './components/layout/ScrollToTopButton'
import Home from './pages/Home'
import Services from './pages/Services'
import References from './pages/References'
import About from './pages/About'
import Contact from './pages/Contact'
import Configurator from './pages/Configurator'
import Products from './pages/Products'
import { useScrollReveal } from './hooks/useScrollReveal'
import { usePageTransition } from './hooks/usePageTransition'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Global card mouse-glow: update --cx/--cy per card via event delegation
function CardGlow() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const onMove = (e) => {
      const card = e.target.closest('.card-3d')
      if (!card) return
      const { left, top } = card.getBoundingClientRect()
      card.style.setProperty('--cx', `${e.clientX - left}px`)
      card.style.setProperty('--cy', `${e.clientY - top}px`)
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMove)
  }, [])
  return null
}

// Wires up scroll-reveal + 3D page transitions for every route
function AppEffects() {
  useScrollReveal()
  usePageTransition()
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppEffects />
      <CardGlow />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leistungen" element={<Services />} />
            <Route path="/referenzen" element={<References />} />
            <Route path="/ueber-uns" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/konfigurator" element={<Configurator />} />
            <Route path="/produkte" element={<Products />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTopButton />
        <CookieConsent
          location="bottom"
          buttonText="Akzeptieren"
          declineButtonText="Ablehnen"
          enableDeclineButton
          style={{ background: '#1F2E4A', fontSize: '13px', alignItems: 'center', fontFamily: 'DM Sans, sans-serif' }}
          buttonStyle={{ background: '#C62828', color: '#FFFFFF', fontWeight: '500', borderRadius: '4px', padding: '8px 20px', fontSize: '12px', letterSpacing: '0.05em' }}
          declineButtonStyle={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', borderRadius: '4px', padding: '8px 20px', fontSize: '12px' }}
          expires={365}
        >
          Diese Website verwendet Cookies.{' '}
          <a href="/datenschutz" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Datenschutz</a>
        </CookieConsent>
      </div>
    </BrowserRouter>
  )
}
