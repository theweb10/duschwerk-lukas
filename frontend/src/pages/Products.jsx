import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const artwegerProducts = [
  {
    id: 'artweger-one',
    name: 'Artweger ONE',
    desc: 'Vielseitige Duschlösung für unterschiedlichste Einbausituationen mit modernem Design, stabiler Konstruktion und langlebiger Technik. Ideal für Neubau sowie Renovierung.',
    url: 'https://www.artweger.at/de/product-line/artweger-one_70714',
  },
  {
    id: 'artweger-prestige',
    name: 'Artweger PRESTIGE',
    desc: 'Designorientierte Duschabtrennungen mit eleganter Profilgestaltung und hochwertigen Glasflächen. Entwickelt in Zusammenarbeit mit Studio F. A. Porsche für gehobene Badkonzepte.',
    url: 'https://www.artweger.at/de/product-line/prestige_69623',
  },
  {
    id: 'artweger-dynamic',
    name: 'Artweger DYNAMIC',
    desc: 'Flexible Pendeltür- und Walk-In-Lösungen mit robuster Technik, moderner Optik und vielseitigen Anpassungsmöglichkeiten an unterschiedliche Raumgrößen.',
    url: 'https://www.artweger.at/de/product-line/dynamic_18671',
  },
  {
    id: 'artweger-move',
    name: 'Artweger MOVE',
    desc: 'Platzsparende Schiebetürsysteme mit leichtgängiger Lauftechnik. Besonders geeignet für kleinere Badezimmer oder schwierige Grundrisse.',
    url: 'https://www.artweger.at/de/product-line/artweger-move_37352',
  },
  {
    id: 'artweger-joice',
    name: 'Artweger JOICE Walk-In',
    desc: 'Offene und großzügige Duschlösungen mit reduzierter Formensprache. Unterstützt moderne, barrierearme und minimalistische Badgestaltung.',
    url: 'https://www.artweger.at/de/product-line/joice_59822',
  },
  {
    id: 'artstone',
    name: 'ARTSTONE Duschwannen',
    desc: 'Hochwertige Mineralguss-Duschwannen mit angenehmer Oberfläche, hoher Stabilität und moderner flacher Bauweise für bodennahe Einbaulösungen.',
    url: 'https://www.artweger.at/de/produkte/duschwannen-acryl-undmineralguss/artstone-duschwannen-aus-mineralguss',
  },
  {
    id: 'artwall',
    name: 'Artwall Wandpaneele',
    desc: 'Pflegeleichte Wandverkleidungssysteme zur schnellen und sauberen Renovierung von Duschbereichen. Häufig können bestehende Fliesen überdeckt werden.',
    url: 'https://www.artweger.at/de/product-line/artwall-neu_70780',
  },
]

const radawayProducts = [
  {
    id: 'radaway-modo',
    name: 'Radaway Modo New II',
    desc: 'Moderne Walk-In- und Rahmendusch­lösungen mit klarer Linienführung und stabiler Bauweise für stilvolle Badkonzepte.',
    url: 'https://www.radaway.de/kategoria/modo-new-ii/',
  },
  {
    id: 'radaway-nes6',
    name: 'Radaway Nes 6',
    desc: 'Zeitlose Duschabtrennungen mit vielfältigen Einbaumöglichkeiten und funktionalen Türvarianten für individuelle Raumlösungen. In mehreren Farben erhältlich (u.a. Chrom und Schwarz).',
    url: 'https://www.radaway.de/typ/prostokatne-wejscie-z-boku/',
  },
  {
    id: 'radaway-wannen',
    name: 'Radaway Duschwannen',
    desc: 'Breites Sortiment an Duschwannen in verschiedenen Materialien, Formen und Einbauhöhen zur Umsetzung klassischer oder bodengleicher Duschen.',
    url: 'https://www.radaway.de/typ/brodziki-kwadratowe/',
  },
]

const partners = [
  { name: 'Artweger', url: 'https://www.artweger.at/de', desc: 'Österreichischer Hersteller hochwertiger Duschsysteme' },
  { name: 'Radaway', url: 'https://www.radaway.de', desc: 'Europäischer Anbieter moderner Duschabtrennungen' },
  { name: 'Haustechnik Preissler', url: 'https://www.haustechnik-preissler.de', desc: 'Regionaler Partner im Bereich Sanitärtechnik' },
]

export default function Products() {
  return (
    <>
      <Helmet>
        <title>Produkte unserer Partnerfirmen | Duschwerk Bayern</title>
        <meta name="description" content="Hochwertige Duschabtrennungen und Duschwannen von Artweger und Radaway – erhältlich bei Duschwerk Bayern in Regensburg." />
        <link rel="canonical" href="https://www.duschwerk-bayern.de/produkte" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container-max">
          <p className="eyebrow mb-3">Produkte</p>
          <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-4" style={{ letterSpacing: '-0.03em' }}>
            Produkte unserer Partnerfirmen.
          </h1>
          <p className="text-gray-500 max-w-lg text-base font-light leading-relaxed">
            Durch die Zusammenarbeit mit ausgewählten Herstellern können für nahezu jede Einbausituation passende, hochwertige und langlebige Lösungen realisiert werden.
          </p>
        </div>
      </div>

      <main>

        {/* Artweger */}
        <section className="section-padding" style={{ background: '#ECEEF2' }}>
          <div className="container-max">
            <header className="mb-10">
              <p className="eyebrow mb-2">Partnerfirma</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>Artweger</h2>
              <p className="text-gray-500 text-sm font-light mt-2 max-w-xl">
                Österreichischer Hersteller hochwertiger Dusch- und Badlösungen mit jahrzehntelanger Erfahrung in Design und Technik. <span className="font-medium text-gray-600">Made in Austria.</span>
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {artwegerProducts.map(({ id, name, desc, url }) => (
                <article key={id} className="card-3d p-7 flex flex-col">
                  <h3 className="font-headline text-base text-primary font-semibold tracking-tight mb-3">{name}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">{desc}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto text-xs font-medium transition-colors duration-200"
                    style={{ color: '#C62828' }}
                  >
                    Zum Hersteller →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Radaway */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <header className="mb-10">
              <p className="eyebrow mb-2">Partnerfirma</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>Radaway</h2>
              <p className="text-gray-500 text-sm font-light mt-2 max-w-xl">
                Europäischer Anbieter moderner Duschabtrennungen mit vielfältigen Einbaumöglichkeiten und breitem Produktsortiment. <span className="font-medium text-gray-600">Made in Poland.</span>
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {radawayProducts.map(({ id, name, desc, url }) => (
                <article key={id} className="card-3d p-7 flex flex-col">
                  <h3 className="font-headline text-base text-primary font-semibold tracking-tight mb-3">{name}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">{desc}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto text-xs font-medium transition-colors duration-200"
                    style={{ color: '#C62828' }}
                  >
                    Zum Hersteller →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Hinweise */}
        <section className="section-padding bg-white">
          <div className="container-max space-y-4">
            <div className="card-3d p-7">
              <p className="font-semibold text-primary text-sm mb-2">Ausstellungsprodukte & Verfügbarkeit</p>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Die aufgelisteten Produkte sind die Modelle, die in unserer Ausstellung ausgestellt sind. Selbstverständlich sind alle weiteren Kabinen, Wannen, Wandpaneele und anderes Zubehör, die auf den jeweiligen Herstellerseiten aufgeführt sind, ebenfalls über uns erhältlich – allerdings nicht zum Live-Anschauen.
              </p>
            </div>
            <div className="card-3d p-7">
              <p className="font-semibold text-primary text-sm mb-2">Integrierter Handtuchhalter</p>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Einige ausgewählte Modelle sind mit einem integrierten Handtuchhalter im Glas erhältlich. Sprechen Sie uns gerne darauf an.
              </p>
            </div>
          </div>
        </section>

        {/* Partnerlinks */}
        <section className="section-padding" style={{ background: '#ECEEF2' }}>
          <div className="container-max">
            <header className="mb-10">
              <p className="eyebrow mb-3">Partner</p>
              <h2 className="font-headline text-3xl text-primary" style={{ letterSpacing: '-0.03em' }}>
                Unsere Partnerlinks.
              </h2>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {partners.map(({ name, url, desc }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-3d p-7 block group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-headline text-base text-primary font-semibold tracking-tight">{name}</h3>
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5 transition-colors duration-200"
                      style={{ color: '#8892A4' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">{desc}</p>
                  <p
                    className="text-xs font-medium tracking-wide transition-colors duration-200"
                    style={{ color: '#C62828' }}
                  >
                    {url.replace('https://', '')} →
                  </p>
                </a>
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
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Beratung</p>
          <h2 className="font-headline text-3xl text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Welches Produkt passt zu Ihnen?
          </h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto font-light text-sm">
            Wir beraten Sie persönlich – in unserer Ausstellung oder direkt bei Ihnen vor Ort.
          </p>
          <Link to="/kontakt" className="btn-silver px-10 py-4 text-sm">Beratung anfragen</Link>
        </div>
      </section>
    </>
  )
}
