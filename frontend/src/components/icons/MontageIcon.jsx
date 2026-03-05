/**
 * Montage Icon
 * Montageschiene oben + herabhängende Glasscheibe
 * Zwei gefüllte Kreise = Befestigungspunkte
 */
export default function MontageIcon({ size = 24, className = '', style = {} }) {
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
      {/* Montageschiene (oben) */}
      <rect x="3" y="2" width="18" height="3.5" rx="1.75" />

      {/* Glasscheibe */}
      <rect x="7" y="5.5" width="10" height="16" rx="1" />

      {/* Befestigungspunkte auf Schiene */}
      <circle cx="9"  cy="3.75" r="1"  fill="currentColor" stroke="none" />
      <circle cx="15" cy="3.75" r="1"  fill="currentColor" stroke="none" />

      {/* Anschraubmarken unten (kleine Bolzen-Indikatoren) */}
      <line x1="7"  y1="19.5" x2="9"  y2="19.5" strokeWidth="1.5" />
      <line x1="15" y1="19.5" x2="17" y2="19.5" strokeWidth="1.5" />
    </svg>
  )
}
