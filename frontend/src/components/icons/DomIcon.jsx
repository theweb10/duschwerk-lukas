/**
 * Regensburg Dom St. Peter Icon
 * Inspiriert von der Regensburg-Skyline: zwei gotische Spitztürme + Kirchenschiff
 * Verwendung: als Logo / Home-Button im Header und Footer
 */
export default function DomIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 20 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Linker Turm – etwas schlanker, leicht höher */}
      <path d="M5.5 0 L4 5.5 L4 17 L7 17 L7 5.5 Z" />

      {/* Rechter Turm */}
      <path d="M14.5 0.5 L13 6 L13 17 L16 17 L16 6 Z" />

      {/* Verbindungsschiff zwischen den Türmen */}
      <rect x="7" y="12" width="6" height="5" />

      {/* Basis / Sockel */}
      <rect x="2" y="17" width="16" height="2.5" rx="0.5" />

      {/* Kleines Kreuz auf linkem Turm */}
      <rect x="5.1" y="0" width="0.8" height="2.5" />
      <rect x="4.3" y="0.8" width="2.4" height="0.7" />

      {/* Kleines Kreuz auf rechtem Turm */}
      <rect x="14.1" y="0.5" width="0.8" height="2.5" />
      <rect x="13.3" y="1.3" width="2.4" height="0.7" />
    </svg>
  )
}
