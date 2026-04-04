/**
 * Garantie / Vertrauen Icon
 * Schild mit Häkchen — klassisch, clean, Apple-inspiriert
 * Schild: oben leicht gewölbt, Spitze unten (Wappenform)
 */
export default function GarantieIcon({ size = 24, className = '', style = {} }) {
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
      {/* Schild */}
      <path d="M 12,2 L 20,5.5 L 20,12 Q 20,19 12,22 Q 4,19 4,12 L 4,5.5 Z" />

      {/* Häkchen */}
      <path d="M 8.5,12 L 11,14.5 L 15.5,9.5" />
    </svg>
  )
}
