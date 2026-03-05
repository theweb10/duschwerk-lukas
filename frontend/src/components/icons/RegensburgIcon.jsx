/**
 * Regensburg Icon (abstrakter Dom)
 * Zwei gotische Türme mit spitzen Bögen + Rosettenfenster
 * Linker Turm etwas höher (wie beim echten Regensburger Dom)
 * Stroke-only, currentColor — unterscheidet sich vom Logo-DomIcon
 */
export default function RegensburgIcon({ size = 24, className = '', style = {} }) {
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
      {/* Linker Turm – Körper (höher) */}
      <rect x="2" y="8" width="7" height="14" rx="1" />

      {/* Linke Turmspitze (gotischer Bogen) */}
      <path d="M 2,8 Q 5.5,2 9,8" />

      {/* Rechter Turm – Körper (etwas kürzer) */}
      <rect x="13" y="10" width="7" height="12" rx="1" />

      {/* Rechte Turmspitze */}
      <path d="M 13,10 Q 16.5,4 20,10" />

      {/* Rosettenfenster zwischen den Türmen */}
      <circle cx="11.5" cy="15" r="2" />

      {/* Basis-Plattform */}
      <line x1="1" y1="22" x2="23" y2="22" />
    </svg>
  )
}
