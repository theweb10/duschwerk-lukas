import { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useScrollProgress } from '../../hooks/useScrollProgress'

// Lazy-load the 3D scene so Three.js doesn't block initial render
const GlassShardScene = lazy(() => import('../3d/GlassShardScene'))

/* ─── Scene definitions ─────────────────────────── */
const SCENES = [
  {
    num: '01',
    label: 'Präzisionsaufmaß',
    title: ['Präzisions-', 'aufmaß.'],
    sub: 'Jeder Millimeter zählt. Wir messen präzise bei Ihnen vor Ort – für eine Duschabtrennung, die auf den Punkt passt.',
    stat: '100 %',
    statLabel: 'Passgenauigkeit',
    bg: '#F0F5FF',
    text: '#1A2E5A',
    accent: '#2B5AA8',
  },
  {
    num: '02',
    label: 'Sicherheitsglas',
    title: ['Premium', 'Sicherheitsglas.'],
    sub: 'Nur geprüftes Sicherheitsglas nach DIN – klar, bruchsicher und langlebig. Kein Kompromiss bei Materialien.',
    stat: 'DIN',
    statLabel: 'Geprüft',
    bg: '#E6EEF8',
    text: '#1A2E5A',
    accent: '#1A2E5A',
  },
  {
    num: '03',
    label: 'Montage',
    title: ['Fachgerechte', 'Montage.'],
    sub: 'Unser Team montiert sauber, termintreu und ohne Folgeschäden – vom ersten Schrauben bis zur Einweisung.',
    stat: '100 %',
    statLabel: 'Termintreu',
    bg: '#1A3570',
    text: '#FFFFFF',
    accent: '#E53935',
  },
  {
    num: '04',
    label: 'Ergebnis',
    title: ['Ihr perfektes', 'Bad.'],
    sub: 'Maßgeschneidert. Hochwertig. Dauerhaft. Das ist Duschwerk Bayern.',
    stat: '300 +',
    statLabel: 'Projekte',
    bg: '#0D1F45',
    text: '#FFFFFF',
    accent: '#E53935',
  },
]

/* ─── Utilities ─────────────────────────────────── */
const lerp  = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const ease  = (t) => 1 - Math.pow(1 - t, 3)  // ease-out cubic

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function blendHex(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`
}

/* ─── Walk-in Badverglasung (3D) ────────────────── */
/*
  Layout: Draufsicht-Perspektive einer Walk-in Dusche
  ┌─── Wandprofil (links) ───┐
  │  Seitenscheibe (links)   │
  │  Hauptscheibe (vorne)    │
  │  Bodenprofil             │
  │  Duschkopf (oben links)  │
  └──────────────────────────┘
  Die Seitenscheibe ist perspektivisch verkürzt dargestellt.
*/
// Legacy SVG panel — used as Suspense fallback while 3D scene loads
function GlassPanel({ sceneP, sceneIdx, p }) {
  const isLight = sceneIdx < 2

  // Rotation: Walk-in von leicht rechts-oben betrachtet
  const rotYBase = [-22, -16, -28, -10][sceneIdx] ?? -16
  const rotYEnd  = [-14,  -8,   2,  -5][sceneIdx] ?? -8
  const rotY     = lerp(rotYBase, rotYEnd, ease(sceneP))
  const rotX     = lerp(5, -2, ease(p))

  // Materialfortschritt
  const draw     = clamp(sceneP * 3, 0, 1)
  const fill     = clamp(sceneIdx * 0.28 + sceneP * 0.22, 0, 0.9)
  const shine    = clamp(fill * 1.3 - 0.1, 0, 1)
  const hw       = clamp((fill - 0.12) * 5, 0, 1)
  const drops    = sceneIdx === 3 ? ease(clamp(sceneP * 2.5, 0, 1)) : 0

  const stroke   = isLight ? 'rgba(26,46,90,0.5)' : 'rgba(180,210,245,0.65)'
  const gBlue    = isLight ? '#2B5AB8' : '#90C4F0'

  return (
    <div style={{ perspective: '700px', perspectiveOrigin: '55% 42%' }}>
      <div style={{
        transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}>
        {/* viewBox: 300×360 – Platz für Seiten- + Hauptscheibe */}
        <svg viewBox="0 0 300 360" width="100%" height="100%">
          <defs>
            {/* Hauptscheibe: blau-klares Glas */}
            <linearGradient id="gMain" x1="0.05" y1="0" x2="0.95" y2="1">
              <stop offset="0%"   stopColor={gBlue} stopOpacity={fill * 0.28} />
              <stop offset="30%"  stopColor={gBlue} stopOpacity={fill * 0.07} />
              <stop offset="65%"  stopColor={gBlue} stopOpacity={fill * 0.12} />
              <stop offset="100%" stopColor={gBlue} stopOpacity={fill * 0.22} />
            </linearGradient>
            {/* Seitenscheibe: etwas dunkler */}
            <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={gBlue} stopOpacity={fill * 0.35} />
              <stop offset="100%" stopColor={gBlue} stopOpacity={fill * 0.15} />
            </linearGradient>
            {/* Fresnel Linke Kante */}
            <linearGradient id="gFL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="white" stopOpacity={shine * 0.65} />
              <stop offset="28%"  stopColor="white" stopOpacity={shine * 0.08} />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Fresnel Oberkante */}
            <linearGradient id="gFT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="white" stopOpacity={shine * 0.5} />
              <stop offset="22%"  stopColor="white" stopOpacity={shine * 0.05} />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Spiegellicht diagonal */}
            <linearGradient id="gSpec" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="white" stopOpacity="0" />
              <stop offset="38%"  stopColor="white" stopOpacity={shine * 0.22} />
              <stop offset="55%"  stopColor="white" stopOpacity={shine * 0.08} />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Chrome */}
            <linearGradient id="gChr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#B8C8D8" />
              <stop offset="35%"  stopColor="#ECF2F7" />
              <stop offset="65%"  stopColor="#A8BAC8" />
              <stop offset="100%" stopColor="#D0DCE8" />
            </linearGradient>
            <linearGradient id="gChrV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#D8E8F2" />
              <stop offset="45%"  stopColor="#F2F8FC" />
              <stop offset="100%" stopColor="#8AAABB" />
            </linearGradient>
            {/* Wand-Fliesen Hintergrund */}
            <pattern id="pTile" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill={isLight ? '#E8EDF5' : '#1E3060'} />
              <rect x="0.5" y="0.5" width="18.5" height="18.5"
                fill={isLight ? '#F0F4FA' : '#243878'} />
            </pattern>
            {/* Schatten */}
            <filter id="fSh" x="-15%" y="-8%" width="145%" height="130%">
              <feDropShadow dx="5" dy="8" stdDeviation="10"
                floodColor="#000" floodOpacity={0.2 * fill} />
            </filter>
            <filter id="fGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Wand links (Fliesen-Hintergrund) ────── */}
          <rect x="0" y="0" width="70" height="330"
            fill="url(#pTile)"
            opacity={clamp(fill * 1.5, 0, 0.6)} />
          {/* Wandprofil Übergang */}
          <rect x="68" y="0" width="5" height="330"
            fill="url(#gChrV)" opacity={hw * 0.9} />

          {/* ── Seitenscheibe (links, perspektivisch verkürzt) */}
          {/* Parallelogramm: oben-links(73,30) oben-rechts(145,20) unten-rechts(145,310) unten-links(73,310) */}
          <polygon
            points="73,30 145,20 145,310 73,310"
            fill="url(#gSide)"
            filter="url(#fSh)"
          />
          {/* Outline Seitenscheibe */}
          <polygon
            points="73,30 145,20 145,310 73,310"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
            strokeDasharray={clamp(draw, 0, 1) > 0.5 ? 'none' : `${700 * draw},700`}
          />
          {/* Fresnel Seitenscheibe oben */}
          <polygon points="73,30 145,20 145,42 73,52"
            fill="white" opacity={shine * 0.18} />
          {/* Spiegellicht Seitenscheibe */}
          <polygon points="73,30 105,26 105,200 73,200"
            fill="white" opacity={shine * 0.09} />

          {/* ── Bodenprofil ─────────────────────────── */}
          <rect x="73" y="308" width="210" height="9" rx="2"
            fill="url(#gChr)" opacity={hw * 0.9} />
          <rect x="73" y="308" width="210" height="2.5" rx="1"
            fill="white" opacity={hw * 0.35} />
          {/* Seitenprofil unten (verbindet Wand mit Boden) */}
          <polygon points="73,308 145,308 145,317 73,317"
            fill="url(#gChr)" opacity={hw * 0.7} />

          {/* ── Hauptscheibe (frontal, groß) ─────────── */}
          <rect x="145" y="20" width="138" height="290" rx="2"
            fill="url(#gMain)"
            filter="url(#fSh)"
          />
          {/* Outline Hauptscheibe – zeichnet sich ein */}
          <rect x="145" y="20" width="138" height="290" rx="2"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeDasharray={916}
            strokeDashoffset={916 * (1 - draw)}
          />
          {/* Fresnel Links */}
          <rect x="145" y="20" width="30" height="290"
            fill="url(#gFL)" />
          {/* Fresnel Oben */}
          <rect x="145" y="20" width="138" height="30"
            fill="url(#gFT)" />
          {/* Spiegellicht diagonal */}
          <rect x="145" y="20" width="138" height="290" rx="2"
            fill="url(#gSpec)" />
          {/* Subtile Refraktionslinien */}
          {[80, 155, 225].map(y => (
            <line key={y} x1="146" y1={y} x2="282" y2={y}
              stroke="white" strokeWidth="0.5" opacity={shine * 0.07} />
          ))}

          {/* ── Vertikales Chrome-Profil (Ecke Seite↔Front) */}
          <rect x="142" y="18" width="6" height="294" rx="2"
            fill="url(#gChrV)" opacity={hw * 0.95} />
          <rect x="143" y="18" width="2" height="294" rx="1"
            fill="white" opacity={hw * 0.3} />

          {/* ── Oberprofil Hauptscheibe ──────────────── */}
          <rect x="142" y="16" width="141" height="7" rx="2"
            fill="url(#gChr)" opacity={hw * 0.85} />

          {/* ── Wandhalterung oben (links) ───────────── */}
          <g opacity={hw}>
            <rect x="60" y="25" width="16" height="30" rx="3"
              fill="url(#gChrV)" />
            <rect x="62" y="27" width="12" height="26" rx="2"
              fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            {[0,1,2].map(i => (
              <circle key={i} cx="68" cy={31 + i * 8} r="1.5"
                fill="rgba(90,110,130,0.8)" />
            ))}
          </g>
          {/* Wandhalterung unten */}
          <g opacity={hw}>
            <rect x="60" y="270" width="16" height="30" rx="3"
              fill="url(#gChrV)" />
            {[0,1,2].map(i => (
              <circle key={i} cx="68" cy={274 + i * 8} r="1.5"
                fill="rgba(90,110,130,0.8)" />
            ))}
          </g>

          {/* ── Duschkopf (oben links an der Wand) ──── */}
          <g opacity={clamp((fill - 0.4) * 3, 0, 1)}>
            {/* Arm */}
            <line x1="20" y1="15" x2="48" y2="40"
              stroke="url(#gChr)" strokeWidth="5" strokeLinecap="round" />
            {/* Kopf */}
            <circle cx="52" cy="44" r="12" fill="url(#gChr)" />
            <circle cx="52" cy="44" r="9" fill={isLight ? '#D8E8F4' : '#1C3B72'} />
            {/* Düsen */}
            {[[48,40],[52,40],[56,40],[48,44],[52,44],[56,44],[50,48],[54,48]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="0.8"
                fill="rgba(100,160,210,0.7)" />
            ))}
          </g>

          {/* ── Scene 1: Blaupause / Maßlinien ─────── */}
          {sceneIdx === 0 && (() => {
            const ao = clamp((0.65 - sceneP) * 4, 0, 1)
            const ac = 'rgba(43,90,168,0.75)'
            return (
              <g opacity={ao} fontFamily="DM Sans" fontSize="8" fill={ac}>
                {/* Breite Hauptscheibe */}
                <line x1="145" y1="9" x2="283" y2="9" stroke={ac} strokeWidth="0.8" strokeDasharray="3,2"/>
                <line x1="145" y1="6" x2="145" y2="12" stroke={ac} strokeWidth="0.8"/>
                <line x1="283" y1="6" x2="283" y2="12" stroke={ac} strokeWidth="0.8"/>
                <text x="214" y="7" textAnchor="middle">120 cm</text>
                {/* Höhe */}
                <line x1="290" y1="20" x2="290" y2="308" stroke={ac} strokeWidth="0.8" strokeDasharray="3,2"/>
                <line x1="287" y1="20"  x2="293" y2="20"  stroke={ac} strokeWidth="0.8"/>
                <line x1="287" y1="308" x2="293" y2="308" stroke={ac} strokeWidth="0.8"/>
                <text x="294" y="168" textAnchor="start" transform="rotate(90,294,168)">200 cm</text>
              </g>
            )
          })()}

          {/* ── Scene 3: Montagelinie ────────────────── */}
          {sceneIdx === 2 && (
            <g opacity={clamp(sceneP * 3, 0, 0.65)}>
              <line x1="73" y1="315" x2="283" y2="315"
                stroke="rgba(229,57,53,0.7)" strokeWidth="1.5" strokeDasharray="5,3"/>
              <text x="178" y="328" textAnchor="middle"
                fill="rgba(229,57,53,0.55)" fontSize="7" fontFamily="DM Sans">
                Montagelinie ± 0 mm
              </text>
            </g>
          )}

          {/* ── Scene 4: Wassertropfen ───────────────── */}
          {drops > 0 && [
            [180,70],[210,110],[165,165],[245,85],[225,200],[190,245],[260,145],
          ].map(([x,y], i) => {
            const o = clamp(drops - i * 0.09, 0, 0.75)
            return (
              <g key={i} opacity={o}>
                <ellipse cx={x} cy={y+5} rx="3.5" ry="5.5"
                  fill="rgba(160,210,245,0.38)"/>
                <ellipse cx={x-1} cy={y+3} rx="1.1" ry="1.7"
                  fill="rgba(255,255,255,0.6)"/>
                <line x1={x} y1={y-3} x2={x} y2={y+1}
                  stroke="rgba(160,210,245,0.22)" strokeWidth="1.2"/>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────── */
export default function ScrollCinematic() {
  const containerRef = useRef(null)

  // Canonical scroll controller — replaces 25 lines of manual RAF + listener
  const { smooth: p } = useScrollProgress(containerRef)

  // Pause GPU when section is off-screen
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Respect prefers-reduced-motion
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ── Derive scene state from p ───────────────── */
  const total      = SCENES.length
  const rawScene   = p * total
  const sceneIdx   = clamp(Math.floor(rawScene), 0, total - 1)
  const sceneP     = rawScene - Math.floor(rawScene) // 0→1 within scene

  const scene      = SCENES[sceneIdx]
  const nextScene  = SCENES[Math.min(sceneIdx + 1, total - 1)]

  // Blend only in last 25% of each scene
  const blendT     = ease(clamp((sceneP - 0.75) / 0.25, 0, 1))
  const bg         = blendHex(scene.bg, nextScene.bg, blendT)
  const textColor  = blendT > 0.5 ? nextScene.text : scene.text
  const accentColor= blendT > 0.5 ? nextScene.accent : scene.accent

  // Text: slam in on [0→0.15], stable on [0.15→0.7], fade on [0.7→1]
  const textIn     = ease(clamp(sceneP / 0.15, 0, 1))
  const textOut    = ease(clamp((sceneP - 0.72) / 0.28, 0, 1))
  const textOpacity= textIn * (1 - textOut * 0.9)
  const textY      = lerp(32, 0, textIn) - textOut * 24 // px

  // Zoom: scale grows 1.0 → 1.08 over the whole cinematic
  // Applied to inner content so background stays full-bleed
  const zoom = lerp(1.0, 1.08, ease(p))

  // Whether current scene is light background
  const isLight = sceneIdx < 2

  return (
    /* Outer: tall scroll container */
    <div ref={containerRef} style={{ height: `${total * 80}vh` }}>

      {/* Inner: sticky viewport */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ background: bg, willChange: 'background' }}
      >
        {/* ── Grain overlay for premium texture ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: isLight ? 0.028 : 0.045,
            mixBlendMode: 'overlay',
          }}
        />

        {/* ── Ghost numeral behind content ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-0.15em',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(18rem, 38vw, 32rem)',
            fontFamily: 'var(--font-headline, serif)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            color: isLight ? '#000' : '#fff',
            opacity: isLight ? 0.032 : 0.05,
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.4s ease',
          }}
        >
          {scene.num}
        </div>

        {/* ── Layout (zoom wrapper) ── */}
        <div
          className="relative h-full grid grid-cols-1 lg:grid-cols-2 items-center container-max px-8 sm:px-12 lg:px-16 gap-8"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            zIndex: 2,
          }}
        >

          {/* ── Left: Text ── */}
          <div
            className="flex flex-col justify-center"
            style={{
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
              willChange: 'transform, opacity',
            }}
          >
            {/* Chapter label row */}
            <div className="flex items-center gap-4 mb-8">
              <span
                style={{
                  fontFamily: 'var(--font-headline, serif)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: accentColor,
                  fontWeight: 600,
                  opacity: 0.9,
                }}
              >
                {scene.num}
              </span>
              {/* Accent line — draws in */}
              <div style={{
                width: `${ease(clamp(sceneP * 4, 0, 1)) * 48}px`,
                height: '1px',
                background: accentColor,
                opacity: 0.45,
                transition: 'width 0.3s ease',
                flexShrink: 0,
              }} />
              <span
                style={{
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: textColor,
                  opacity: 0.35,
                  fontWeight: 500,
                }}
              >
                {scene.label}
              </span>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontFamily: 'var(--font-headline, serif)',
                fontSize: 'clamp(3rem, 5.5vw, 5.8rem)',
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: '-0.045em',
                color: textColor,
                marginBottom: '1.75rem',
              }}
            >
              {scene.title[0]}<br />
              <span style={{ color: accentColor, fontStyle: 'italic' }}>{scene.title[1]}</span>
            </h2>

            {/* Thin divider */}
            <div style={{
              width: 40,
              height: 1,
              background: accentColor,
              opacity: 0.3,
              marginBottom: '1.5rem',
            }} />

            {/* Sub */}
            <p
              style={{
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '0.975rem',
                fontWeight: 300,
                lineHeight: 1.7,
                color: textColor,
                opacity: 0.6,
                maxWidth: '26rem',
                marginBottom: '2.5rem',
                letterSpacing: '0.01em',
              }}
            >
              {scene.sub}
            </p>

            {/* Stat block */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.75rem',
              marginBottom: '2.5rem',
              paddingTop: '1.25rem',
              borderTop: `1px solid ${accentColor}22`,
            }}>
              <span
                style={{
                  fontFamily: 'var(--font-headline, serif)',
                  fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.05em',
                  color: accentColor,
                }}
              >
                {scene.stat}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  color: textColor,
                  opacity: 0.4,
                  paddingBottom: '0.4rem',
                  fontWeight: 500,
                }}
              >
                {scene.statLabel}
              </span>
            </div>

            {/* CTA (only last scene) */}
            {sceneIdx === total - 1 && (
              <div style={{ opacity: ease(clamp((sceneP - 0.5) * 2, 0, 1)) }}>
                <Link
                  to="/kontakt"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontFamily: 'var(--font-body, sans-serif)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: textColor,
                    border: `1px solid ${accentColor}`,
                    padding: '0.9rem 2rem',
                    transition: 'background 0.3s, color 0.3s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = accentColor
                    e.currentTarget.style.color = isLight ? '#fff' : '#0E0C0A'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = textColor
                  }}
                >
                  Jetzt Aufmaß buchen
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ opacity: 0.7 }}>
                    <path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* ── Right: 3D Glass Scene (desktop) ── */}
          <div
            className="hidden lg:flex items-center justify-center h-full"
            style={{
              opacity: clamp(textOpacity + 0.2, 0.1, 1),
              willChange: 'opacity',
            }}
          >
            {/* Height capped — full column height caused 630K+ px/frame */}
            <div style={{ width: '100%', height: 'clamp(320px, 44vh, 480px)' }}>
              <Suspense
                fallback={
                  // SVG panel while Three.js is downloading
                  <div className="w-64 xl:w-72 mx-auto">
                    <GlassPanel sceneP={sceneP} sceneIdx={sceneIdx} p={p} />
                  </div>
                }
              >
                <GlassShardScene scrollP={p} active={inView} reducedMotion={reducedMotion} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ── Side chapter navigation (right edge) ── */}
        <div
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1.2rem',
            zIndex: 10,
          }}
        >
          {SCENES.map((s, i) => {
            const active = i === sceneIdx
            const done   = i < sceneIdx
            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.4s ease',
                  opacity: active ? 1 : done ? 0.35 : 0.18,
                }}
              >
                {active && (
                  <span style={{
                    fontFamily: 'var(--font-body, sans-serif)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: textColor,
                    opacity: 0.55,
                  }}>
                    {s.label}
                  </span>
                )}
                <div style={{
                  width: active ? 20 : 4,
                  height: 1,
                  background: active ? accentColor : textColor,
                  transition: 'width 0.4s ease, background 0.4s ease',
                }} />
              </div>
            )
          })}
        </div>

        {/* ── Vertical progress track (far right) ── */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: `${textColor}0a`,
          zIndex: 9,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${p * 100}%`,
            background: accentColor,
            opacity: 0.5,
            transition: 'height 0.06s linear',
          }} />
        </div>

        {/* ── Bottom: scene counter ── */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-headline, serif)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            color: accentColor,
            opacity: 0.8,
            fontWeight: 600,
          }}>
            {scene.num}
          </span>
          <div style={{
            width: 60,
            height: 1,
            background: `${textColor}20`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: `${((sceneIdx + sceneP) / total) * 100}%`,
              background: accentColor,
              opacity: 0.6,
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-headline, serif)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            color: textColor,
            opacity: 0.25,
            fontWeight: 600,
          }}>
            {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* ── Scroll hint (fades after first scene) ─── */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: clamp(1 - p * 9, 0, 1),
            zIndex: 10,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '0.58rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: textColor,
            opacity: 0.35,
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
          }}>
            Scroll
          </span>
          <div style={{
            width: 1,
            height: 32,
            background: accentColor,
            opacity: 0.3,
            animation: 'scroll-hint 1.6s ease-in-out infinite',
          }} />
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ opacity: 0.3, color: accentColor }}>
            <path d="M4 0v10M1 7l3 4 3-4" stroke={accentColor} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
