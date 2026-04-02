import { useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import RegensburgSilhouette from './RegensburgSilhouette'
import { useParallax } from '../../hooks/useParallax'
import { GlassPanel } from '../glass'

export default function Hero() {
  const parallax   = useParallax()
  const sectionRef = useRef(null)

  // Update CSS custom props for the hero glow spot
  const onMouseMove = useCallback((e) => {
    const el = sectionRef.current
    if (!el) return
    const { left, top } = el.getBoundingClientRect()
    el.style.setProperty('--gx', `${e.clientX - left}px`)
    el.style.setProperty('--gy', `${e.clientY - top}px`)
  }, [])

  // Parallax helpers – different depth per layer
  const t = (dx, dy) =>
    `translate3d(${parallax.x * dx}px, ${parallax.y * dy}px, 0)`

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="hero-glow relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(170deg, #FFFFFF 0%, #FAFAFA 60%, #F2F2F2 100%)',
      }}
      aria-label="Hero"
    >
      {/* Regensburg Silhouette – parallax layer 0 (slowest) */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none select-none"
        style={{ transform: t(3, 1.5), transition: 'transform 0.1s ease-out' }}
      >
        <RegensburgSilhouette variant="light" />
      </div>

      {/* Subtle radial tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(46,76,125,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center pt-20 pb-56 sm:pb-72">
        <div className="max-w-3xl mx-auto">

          {/* Location badge – layer 1 */}
          <div
            data-reveal
            style={{ transform: t(5, 3) }}
            className="inline-flex items-center gap-2 mb-10"
          >
            {/* Location badge — GlassPanel (light, pill shape) */}
            <GlassPanel
              variant="light"
              blur={14}
              radius={100}
              shimmer={false}
              gleam={false}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#2E4C7D' }}
              />
              <span className="text-gray-500 text-xs font-medium tracking-widest uppercase">
                Regensburg &amp; ganz Bayern
              </span>
            </GlassPanel>
          </div>

          {/* H1 – layer 2 (most depth) */}
          <div
            style={{ transform: t(7, 5), transition: 'transform 0.1s ease-out' }}
          >
            <h1
              data-reveal
              data-reveal-delay="80"
              className="font-headline text-5xl sm:text-6xl lg:text-[72px] text-primary leading-none mb-6"
              style={{ letterSpacing: '-0.04em' }}
            >
              Ihre Experten für<br />
              <span style={{ color: '#2E4C7D' }}>maßgeschneiderte</span><br />
              Badverglasungen
            </h1>
          </div>

          {/* Subtext – layer 3 */}
          <div
            style={{ transform: t(4, 3), transition: 'transform 0.1s ease-out' }}
          >
            <p
              data-reveal
              data-reveal-delay="160"
              className="text-gray-500 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed"
            >
              Präzise aufgemessen. Hochwertige Materialien.<br className="hidden sm:block" />
              Fachgerecht montiert – aus einer Hand.
            </p>
          </div>

          {/* CTAs – layer 4 (least depth) */}
          <div
            data-reveal
            data-reveal-delay="240"
            style={{ transform: t(2, 1.5), transition: 'transform 0.1s ease-out' }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/kontakt" className="btn-primary px-10 py-4 text-sm">
              Jetzt Aufmaß buchen
            </Link>
            <Link to="/leistungen" className="btn-outline px-10 py-4 text-sm">
              Unsere Leistungen →
            </Link>
          </div>

          {/* Trust strip */}
          <div
            data-reveal
            data-reveal-delay="320"
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-xl mx-auto pt-10"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            {[
              { value: '300+', label: 'Projekte' },
              { value: '100%', label: 'Maßanfertigung' },
              { value: '24h',  label: 'Reaktionszeit' },
              { value: '5 ★',  label: 'Bewertung' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div
                  className="font-headline text-2xl text-primary font-semibold"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {value}
                </div>
                <div className="text-gray-400 text-xs mt-1 tracking-wider uppercase font-medium">
                  {label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
