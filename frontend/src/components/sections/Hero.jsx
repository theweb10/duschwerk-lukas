import { useRef, useCallback, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import RegensburgSilhouette from './RegensburgSilhouette'
import { useParallax } from '../../hooks/useParallax'

function StarRating() {
  const [step, setStep] = useState(0) // 0 = hidden, 1–5 = stars popping, 6 = final "5 ★"
  const elRef = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let i = 1
        const next = () => {
          setStep(i)
          i++
          if (i <= 6) setTimeout(next, i <= 5 ? 350 : 500)
        }
        setTimeout(next, 100)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (step === 6) return <span ref={elRef}>5 <span style={{ color: '#F59E0B' }}>★</span></span>

  return (
    <span ref={elRef} style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14" height="14" viewBox="0 0 20 20" fill={i < step ? '#F59E0B' : 'transparent'}
          style={{
            transition: 'fill 0.15s, transform 0.2s',
            transform: i < step ? 'scale(1)' : 'scale(0.4)',
          }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function CountUp({ target, suffix = '', duration = 1300, delay = 0 }) {
  const [count, setCount] = useState(0)
  const elRef = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        setTimeout(() => {
          let t0 = null
          const step = (ts) => {
            if (!t0) t0 = ts
            const p = Math.min((ts - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setCount(Math.round(eased * target))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }, delay)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration, delay])
  return <span ref={elRef}>{count}{suffix}</span>
}

function FadeInText({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const elRef = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        setTimeout(() => setVisible(true), delay)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return (
    <span ref={elRef} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
      {children}
    </span>
  )
}

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
        background: 'linear-gradient(170deg, #FFFFFF 0%, #F5F6FA 60%, #ECEEF2 100%)',
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
            {/* Location badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 14px',
                borderRadius: 100,
                background: '#EEF1F8',
                border: '1px solid #DDE3EE',
              }}
            >
              <span className="eyebrow" style={{ letterSpacing: '0.14em' }}>
                Regensburg &amp; Umgebung
              </span>
            </div>
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
              Duschabtrennungen
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
              Präzisionsaufmaß. Hochwertige Materialien.<br className="hidden sm:block" />
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
            className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto pt-10"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            {[
              { label: 'Projekte',       num: 300, suffix: '+', delay: 700 },
              { label: 'Maßanfertigung', num: 100, suffix: '%', delay: 700 },
              { label: 'Bewertung',      stars: true },
            ].map(({ label, num, suffix, text, stars, delay }) => (
              <div key={label} className="text-center">
                <div
                  className="font-headline text-2xl text-primary font-semibold"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {stars
                    ? <StarRating />
                    : num != null
                      ? <CountUp target={num} suffix={suffix} delay={delay} />
                      : <FadeInText delay={delay}>{text}</FadeInText>}
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
