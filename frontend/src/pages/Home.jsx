import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import ScrollCinematic from '../components/sections/ScrollCinematic'
import ServicesPreview from '../components/sections/ServicesPreview'
import Testimonials from '../components/sections/Testimonials'

const usps = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M16 3h5m0 0v5m0-5l-7 7" />
      </svg>
    ),
    title: 'Präzisionsaufmaß vor Ort',
    desc: 'Exakte Maßaufnahme bei Ihnen – für eine passgenaue Duschabtrennung ohne Kompromisse.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Hochwertige Materialien',
    desc: 'Nur geprüftes Sicherheitsglas und zertifizierte Beschläge – für langlebige Qualität.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Fachgerechte Montage',
    desc: 'Unser Team montiert sauber und termintreu – ohne Folgeschäden, ohne Nacharbeit.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Persönliche Beratung',
    desc: 'Kostenlos und ohne Verkaufsdruck – wir finden gemeinsam die beste Lösung.',
  },
]

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Duschwerk Bayern – Maßgeschneiderte Duschabtrennungen Regensburg</title>
        <meta name="description" content="Maßgeschneiderte Duschabtrennungen vom Experten in Regensburg. Präzise Aufmessung, hochwertige Materialien, fachgerechte Montage. Jetzt Aufmaß buchen." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/" />
      </Helmet>

      <Hero />
      <ScrollCinematic />
      <ServicesPreview />

      {/* USP Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>
              <p className="eyebrow mb-3">
                Warum Duschwerk Bayern
              </p>
              <h2
                className="font-headline text-3xl sm:text-4xl text-primary mb-10"
                style={{ letterSpacing: '-0.03em' }}
              >
                Qualität, die man sieht<br />und fühlt.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usps.map(({ icon, title, desc }) => (
                  <div key={title} className="card-3d p-5 group cursor-default">
                    <div
                      className="w-9 h-9 flex items-center justify-center mb-3 text-gray-400 group-hover:text-primary transition-colors duration-200"
                      style={{ background: '#EEF1F6', borderRadius: '8px' }}
                    >
                      {icon}
                    </div>
                    <p className="font-semibold text-primary text-sm mb-1" style={{ letterSpacing: '-0.01em' }}>
                      {title}
                    </p>
                    <p className="text-gray-500 text-xs font-light leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo */}
            <div
              className="aspect-square rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=85"
                alt="Hochwertige Duschabtrennung – Duschwerk Bayern"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

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
