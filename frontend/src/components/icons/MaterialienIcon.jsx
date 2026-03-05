/**
 * Hochwertige Materialien Icon
 * Zwei diagonal versetzte Glasscheiben (Schichtung = Qualität)
 * + Sparkle-Stern als Qualitäts-Akzent (Rot optional)
 */
export default function MaterialienIcon({ size = 24, className = '', style = {}, accentColor = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Hintere Glasscheibe */}
      <rect x="7" y="7" width="13" height="13" rx="1.5" strokeOpacity="0.45" />

      {/* Vordere Glasscheibe */}
      <rect x="3" y="3" width="13" height="13" rx="1.5" />

      {/* Sparkle – 4 kurze Strahlen + Mittelpunkt */}
      <circle cx="20" cy="5"  r="1"   fill={accentColor}   stroke="none" />
      <line x1="20" y1="2"   x2="20" y2="3.5" stroke={accentColor} strokeWidth="1.5" />
      <line x1="20" y1="6.5" x2="20" y2="8"   stroke={accentColor} strokeWidth="1.5" />
      <line x1="17" y1="5"   x2="18.5" y2="5" stroke={accentColor} strokeWidth="1.5" />
      <line x1="21.5" y1="5" x2="23"  y2="5"  stroke={accentColor} strokeWidth="1.5" />
    </svg>
  )
}
