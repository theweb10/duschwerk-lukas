import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import ScrollCinematic from '../components/sections/ScrollCinematic'
import ServicesPreview from '../components/sections/ServicesPreview'
import Testimonials from '../components/sections/Testimonials'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Duschwerk Bayern – Maßgeschneiderte Duschabtrennungen Regensburg</title>
        <meta name="description" content="Maßgeschneiderte Duschabtrennungen vom Experten in Regensburg. Präzisionsaufmaß vor Ort, hochwertige Materialien, fachgerechte Montage. Jetzt Aufmaß buchen." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/" />
      </Helmet>

      <Hero />
      <ScrollCinematic />
      <ServicesPreview />

      <Testimonials />

      {/* CTA Banner */}
      <section
        className="section-padding relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1F2E4A 0%, #2E4C7D 100%)' }}
      >
        {/* Subtle silhouette in CTA too */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-10">
          <svg viewBox="0 0 1200 120" className="w-full h-auto block" style={{ color: '#C0C0C0' }}>
            <path fill="currentColor" d="M0,120 L0,80 C300,40 600,100 900,60 C1050,40 1150,70 1200,60 L1200,120 Z" />
          </svg>
        </div>
        <div className="container-max text-center relative">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
            Nächster Schritt
          </p>
          <h2
            className="font-headline text-3xl sm:text-4xl text-white mb-4"
            style={{ letterSpacing: '-0.03em' }}
          >
            Bereit für Ihre neue Duschabtrennung?
          </h2>
          <p className="text-white/50 max-w-md mx-auto mb-10 font-light text-sm leading-relaxed">
            Kostenloses und unverbindliches Aufmaß –<br />wir beraten Sie persönlich vor Ort.
          </p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">
            Jetzt Aufmaß buchen
          </Link>
        </div>
      </section>
    </>
  )
}
