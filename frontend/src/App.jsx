import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CookieConsent from 'react-cookie-consent'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import References from './pages/References'
import About from './pages/About'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leistungen" element={<Services />} />
            <Route path="/referenzen" element={<References />} />
            <Route path="/ueber-uns" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent
          location="bottom"
          buttonText="Akzeptieren"
          declineButtonText="Ablehnen"
          enableDeclineButton
          style={{ background: '#222222', fontSize: '13px', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}
          buttonStyle={{ background: '#FFFFFF', color: '#222222', fontWeight: '500', borderRadius: '4px', padding: '8px 20px', fontSize: '12px', letterSpacing: '0.05em' }}
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
