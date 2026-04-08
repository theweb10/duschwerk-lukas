const testimonials = [
  {
    name: 'Maria K.',
    location: 'Regensburg',
    text: 'Absolut professionelle Arbeit. Die Duschabtrennung wurde exakt nach unseren Wünschen gefertigt und montiert. Das Ergebnis übertrifft alle Erwartungen.',
    rating: 5,
  },
  {
    name: 'Thomas B.',
    location: 'Augsburg',
    text: 'Schnelle Terminvereinbarung, faire Preise und Top-Ergebnis. Saubere Montage, keinerlei Nacharbeiten nötig – sehr empfehlenswert.',
    rating: 5,
  },
  {
    name: 'Familie Schuster',
    location: 'Nürnberg',
    text: 'Von der Beratung bis zur Montage – alles aus einer Hand und absolut stressfrei. Klare Empfehlung für jeden, der Qualität schätzt.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">

        <header className="mb-14">
          <p className="eyebrow mb-3">Kundenstimmen</p>
          <h2
            className="font-headline text-3xl sm:text-4xl text-primary"
            style={{ letterSpacing: '-0.03em' }}
          >
            Das sagen unsere Kunden.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, location, text, rating }) => (
            <blockquote
              key={name}
              className="card-3d p-7 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5" aria-label={`${rating} von 5 Sternen`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5"
                    fill="#F59E0B"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-light flex-grow mb-6">
                „{text}"
              </p>
              <footer className="flex items-center gap-3 mt-auto">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#EEF1F8' }}
                >
                  <span className="text-xs font-semibold text-gray-400">
                    {name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary leading-none">{name}</p>
                  <p className="text-xs text-gray-400 font-light mt-0.5">{location}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
