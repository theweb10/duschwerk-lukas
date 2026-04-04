/**
 * Maßanfertigung Icon
 * Glasscheibe mit Maßpfeilen (Bemaßungslinien rechts + unten)
 * Stroke-only, currentColor — CSS-färbbar
 */
export default function MassIcon({ size = 24, className = '', style = {} }) {
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
      {/* Glasscheibe */}
      <rect x="3" y="2" width="12" height="15" rx="1.5" />

      {/* Bemaßungslinie rechts (Höhe) */}
      <line x1="18.5" y1="2"  x2="18.5" y2="17" />
      <line x1="17"   y1="2"  x2="18.5" y2="2"  />
      <line x1="17"   y1="17" x2="18.5" y2="17" />

      {/* Bemaßungslinie unten (Breite) */}
      <line x1="3"  y1="21" x2="15" y2="21" />
      <line x1="3"  y1="19.5" x2="3"  y2="21" />
      <line x1="15" y1="19.5" x2="15" y2="21" />
    </svg>
  )
}
