/**
 * Beratung & Planung Icon
 * Sprechblase mit zwei Textlinien = Beratungsgespräch / Planung
 * Schwanz unten-links = persönliches Gespräch
 */
export default function BeratungIcon({ size = 24, className = '', style = {} }) {
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
      {/* Sprechblase */}
      <path d="M 6,3 Q 3,3 3,6 L 3,15 Q 3,18 6,18 L 8,18 L 7,22 L 12,18 L 18,18 Q 21,18 21,15 L 21,6 Q 21,3 18,3 Z" />

      {/* Planungslinien (Titel + Inhalt) */}
      <line x1="7" y1="9"  x2="17" y2="9"  strokeWidth="1.75" />
      <line x1="7" y1="13" x2="13" y2="13" strokeWidth="1.75" />
    </svg>
  )
}
