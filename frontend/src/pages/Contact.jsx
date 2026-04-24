import { Helmet } from 'react-helmet-async'
import ContactForm from '../components/sections/ContactForm'

const contactItems = [
  {
    label: 'Adresse',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    content: <p className="text-gray-600 font-light text-sm">Prüfeninger Straße 73<br />93049 Regensburg</p>,
  },
  {
    label: 'Telefon',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    content: (
      <a href="tel:+4915163373563" className="text-primary hover:text-gray-500 transition-colors font-light text-sm">
        +49 151 63373563
      </a>
    ),
  },
  {
    label: 'E-Mail',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <a href="mailto:info@duschwerk-bayern.de" className="text-primary hover:text-gray-500 transition-colors font-light text-sm break-all">
        info@duschwerk-bayern.de
      </a>
    ),
  },
]

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Kontakt & Aufmaß | Duschwerk Bayern Regensburg</title>
        <meta name="description" content="Kostenloses Aufmaß für Ihre maßgeschneiderte Duschabtrennung buchen. Duschwerk Bayern Regensburg – nur nach Terminabsprache." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/kontakt" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="eyebrow mb-3">Kontakt</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Jetzt Aufmaß buchen.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Kostenloses und unverbindliches Aufmaß – Beratung nur nach Terminabsprache.
          </p>
        </div>
      </div>

      <main className="section-padding" style={{ background: '#ECEEF2' }}>
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Info sidebar */}
            <aside className="space-y-4">
              {/* Contact cards */}
              {contactItems.map(({ label, icon, content }) => (
                <div
                  key={label}
                  className="card-3d p-5 flex items-start gap-4"
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-400"
                    style={{ background: '#EEF1F6', borderRadius: '8px' }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-medium mb-1">{label}</p>
                    {content}
                  </div>
                </div>
              ))}

              {/* Hours */}
              <div className="card-3d p-5">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-medium mb-3">Öffnungszeiten</p>
                <dl className="space-y-2 text-sm font-light">
                  {[
                    { day: 'Mo – Fr', time: '08:00 – 17:00' },
                    { day: 'Samstag', time: 'Nach Vereinbarung' },
                    { day: 'Sonntag', time: 'Geschlossen' },
                  ].map(({ day, time }) => (
                    <div key={day} className="flex justify-between items-baseline">
                      <dt className="text-gray-500">{day}</dt>
                      <dd className={time === 'Geschlossen' ? 'text-gray-300 text-xs' : 'text-primary font-medium text-xs'}>{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Note */}
              <div
                className="p-5"
                style={{
                  background: 'linear-gradient(135deg, #1F2E4A 0%, #2E4C7D 100%)',
                  borderRadius: '12px',
                }}
              >
                <p className="text-xs font-semibold text-white mb-1.5">Kostenloses Aufmaß</p>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Beratung und Aufmaß kostenlos und unverbindlich – bei Ihnen vor Ort in Regensburg und Umgebung.
                </p>
              </div>

              {/* Ausstellung Hinweis */}
              <div className="card-3d p-5">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-medium mb-2">Ausstellung</p>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  Unsere Ausstellung ist nicht immer besetzt. Besichtigung und Beratung erfolgen ausschließlich nach Terminabsprache.
                </p>
              </div>
            </aside>

            {/* Form */}
            <div
              className="lg:col-span-2 bg-white p-8 sm:p-10"
              style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <h2 className="font-headline text-xl text-primary mb-8" style={{ letterSpacing: '-0.02em' }}>
                Anfrage senden
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
