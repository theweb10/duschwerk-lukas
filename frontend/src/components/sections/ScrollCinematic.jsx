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
                {/* Glasdicke */}
                <text x="214" y="34" textAnchor="middle" opacity="0.65">⬡ ESG Sicherheitsglas</text>
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

  return (
    /* Outer: tall scroll container */
    <div ref={containerRef} style={{ height: `${total * 80}vh` }}>

      {/* Inner: sticky viewport */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ background: bg, willChange: 'background' }}
      >
        {/* ── Layout (zoom wrapper) ── */}
        <div
          className="h-full grid grid-cols-1 lg:grid-cols-2 items-center container-max px-4 sm:px-6 lg:px-8 gap-8"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', willChange: 'transform' }}
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
            {/* Chapter label */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="font-headline text-[10px] tracking-widest uppercase font-semibold"
                style={{ color: accentColor, opacity: 0.7 }}
              >
                {scene.num}
              </span>
              <div className="h-px flex-1 max-w-[40px]" style={{ background: accentColor, opacity: 0.3 }} />
              <span
                className="font-body text-[10px] tracking-widest uppercase"
                style={{ color: textColor, opacity: 0.4 }}
              >
                {scene.label}
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-headline leading-none mb-6"
              style={{
                fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                letterSpacing: '-0.04em',
                color: textColor,
              }}
            >
              {scene.title[0]}<br />
              <span style={{ color: accentColor }}>{scene.title[1]}</span>
            </h2>

            {/* Sub */}
            <p
              className="font-body font-light leading-relaxed mb-8 max-w-md"
              style={{ fontSize: '1rem', color: textColor, opacity: 0.65 }}
            >
              {scene.sub}
            </p>

            {/* Stat */}
            <div className="flex items-end gap-3 mb-10">
              <span
                className="font-headline leading-none"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  letterSpacing: '-0.04em',
                  color: accentColor,
                }}
              >
                {scene.stat}
              </span>
              <span
                className="font-body text-xs uppercase tracking-widest pb-1.5 font-medium"
                style={{ color: textColor, opacity: 0.45 }}
              >
                {scene.statLabel}
              </span>
            </div>

            {/* CTA (only last scene) */}
            {sceneIdx === total - 1 && (
              <div style={{ opacity: ease(clamp((sceneP - 0.5) * 2, 0, 1)) }}>
                <Link to="/kontakt" className="btn-primary text-sm px-8 py-3">
                  Jetzt Aufmaß buchen
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

        {/* ── Progress Dots ────────────────────────── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {SCENES.map((s, i) => {
            const active = i === sceneIdx
            const done   = i < sceneIdx
            return (
              <div
                key={s.num}
                className="rounded-full transition-all duration-500"
                style={{
                  width:  active ? 24 : 6,
                  height: 6,
                  background: active || done ? accentColor : textColor,
                  opacity: active ? 1 : done ? 0.5 : 0.2,
                }}
              />
            )
          })}
        </div>

        {/* ── Vertical progress bar (right edge) ────── */}
        <div
          className="absolute right-0 top-0 w-0.5 origin-top"
          style={{
            height: `${(p) * 100}%`,
            background: accentColor,
            opacity: 0.4,
            transition: 'height 0.05s linear',
          }}
        />

        {/* ── Scroll hint (fades after first scene) ─── */}
        <div
          className="absolute bottom-8 right-8 flex flex-col items-center gap-2"
          style={{ opacity: clamp(1 - p * 8, 0, 1) }}
        >
          <span
            className="font-body text-[10px] uppercase tracking-widest"
            style={{ color: textColor, opacity: 0.4 }}
          >
            Scroll
          </span>
          <div
            className="w-px h-8 origin-top"
            style={{
              background: textColor,
              opacity: 0.25,
              animation: 'scroll-hint 1.6s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}
