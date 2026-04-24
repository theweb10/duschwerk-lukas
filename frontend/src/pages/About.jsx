import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const values = [
  { title: 'Persönliche Betreuung', desc: 'Vom ersten Gespräch bis zur fertigen Montage – immer ein direkter Ansprechpartner.' },
  { title: 'Maßgefertigte Planung', desc: 'Jede Lösung wird individuell auf die räumlichen Gegebenheiten abgestimmt.' },
  { title: 'Hochwertige Ausführung', desc: 'Ausgewählte Partnerfirmen und Hersteller für langlebige, technisch ausgereifte Lösungen.' },
  { title: 'Langlebige Qualität', desc: 'Nur geprüfte Materialien – für Duschlösungen, die dauerhaft überzeugen.' },
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>Über uns | Duschwerk Bayern Regensburg</title>
        <meta name="description" content="Duschwerk Bayern – Ihr Fachbetrieb für maßgefertigte Duschabtrennungen in Regensburg. Über 20 Jahre Erfahrung, persönliche Beratung, Komplettservice aus einer Hand." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/ueber-uns" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="eyebrow mb-3">Über uns</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Duschwerk Bayern.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Fachbetrieb für maßgefertigte Duschabtrennungen – mit über 20 Jahren Erfahrung und persönlichem Komplettservice aus einer Hand.
          </p>
        </div>
      </div>

      <main>

        {/* Firmenbeschreibung */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="eyebrow mb-3">Wer wir sind</p>
                <h2 className="font-headline text-3xl sm:text-4xl text-primary mb-8" style={{ letterSpacing: '-0.03em' }}>
                  Ihr Spezialist im Duschbereich.
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed font-light text-sm">
                  <p>
                    Duschwerk Bayern ist ein junges, modernes Unternehmen mit Sitz in Regensburg, das sich auf maßgeschneiderte Lösungen im Duschbereich spezialisiert hat. Trotz der noch jungen Unternehmensstruktur bringt das Team über 20 Jahre Erfahrung aus der Duschkabinen-Branche mit und verbindet dieses Know-how mit zeitgemäßen Konzepten und kundenorientiertem Service.
                  </p>
                  <p>
                    Ziel des Unternehmens ist es, für jede bauliche Situation sowie für jeden individuellen Wunsch eine optimale, funktionale und optisch ansprechende Lösung zu schaffen. Dabei begleitet Duschwerk Bayern seine Kunden von der ersten Beratung über das exakte Aufmaß bis hin zur zuverlässigen und sauberen Montage.
                  </p>
                  <p>
                    Das Haupteinsatzgebiet liegt in Regensburg und im umliegenden Großraum. Darüber hinaus werden auf Anfrage auch Projekte in ganz Bayern realisiert.
                  </p>
                </div>
              </div>

              {/* Ausstellung + Fakten */}
              <div>
                <div
                  className="rounded-2xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)', height: '260px' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1613685703305-a5e3da9b3a3d?auto=format&fit=crop&w=700&q=80"
                    alt="Duschwerk Bayern – Ausstellung Regensburg"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-0">
                  {[
                    { label: 'Erfahrung', value: 'Über 20 Jahre im Bereich Duschkabinen' },
                    { label: 'Ausstellung', value: 'Prüfeninger Straße 73, 93049 Regensburg' },
                    { label: 'Beratung', value: 'Beim Kunden oder in der Ausstellung' },
                    { label: 'Einsatzgebiet', value: 'Großraum Regensburg & Umgebung' },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className={`flex gap-5 py-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <span className="font-semibold text-gray-300 text-xs w-24 flex-shrink-0 pt-0.5">{label}</span>
                      <p className="text-gray-500 text-sm font-light">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Komplettservice */}
        <section className="section-padding" style={{ background: '#ECEEF2' }}>
          <div className="container-max">
            <header className="mb-12">
              <p className="eyebrow mb-3">Unser Angebot</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>
                Komplettservice aus einer Hand.
              </h2>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  title: 'Beratung',
                  desc: 'Persönliche Beratung direkt beim Kunden zu Hause oder in unserer Ausstellung in Regensburg – flexibel und unverbindlich.',
                },
                {
                  title: 'Aufmaß vor Ort',
                  desc: 'Präzises Aufmaß durch unser Fachpersonal – damit jede Duschabtrennung exakt passt und technisch einwandfrei ist.',
                },
                {
                  title: 'Montage',
                  desc: 'Fachgerechte Montage durch langjährige, erfahrene Subunternehmer – sauber, termintreu und zuverlässig.',
                },
              ].map(({ title, desc }) => (
                <article key={title} className="card-3d p-7">
                  <div
                    className="w-8 h-8 flex items-center justify-center mb-4"
                    style={{ background: '#EEF1F6', borderRadius: '8px' }}
                  >
                    <span className="font-headline text-sm text-gray-400 font-semibold">{title[0]}</span>
                  </div>
                  <h3 className="font-semibold text-primary text-sm tracking-tight mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Werte */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <header className="mb-12">
              <p className="eyebrow mb-3">Werte</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>
                Wofür Duschwerk Bayern steht.
              </h2>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map(({ title, desc }) => (
                <div key={title} className="card-3d p-7">
                  <div
                    className="w-8 h-8 flex items-center justify-center mb-4"
                    style={{ background: '#EEF1F6', borderRadius: '8px' }}
                  >
                    <span className="font-headline text-sm text-gray-400 font-semibold">{title[0]}</span>
                  </div>
                  <h3 className="font-semibold text-primary text-sm tracking-tight mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section
        className="section-padding text-center"
        style={{ background: 'linear-gradient(135deg, #1F2E4A 0%, #2E4C7D 100%)' }}
      >
        <div className="container-max">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Kontakt</p>
          <h2 className="font-headline text-3xl text-white mb-4" style={{ letterSpacing: '-0.03em' }}>Lernen Sie uns kennen.</h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto font-light text-sm">Wir beraten Sie gerne – kostenlos und unverbindlich, bei Ihnen vor Ort oder in unserer Ausstellung.</p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">Kontakt aufnehmen</Link>
        </div>
      </section>
    </>
  )
}
