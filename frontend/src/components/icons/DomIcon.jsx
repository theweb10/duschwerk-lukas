/**
 * Duschwerk Bayern – Brand Mark  v5
 *
 * Zwei ineinandergreifende Blatt-/Teardrop-Formen im quadratischen Rahmen.
 * Inspiriert vom bereitgestellten Logo-Referenzbild (Yin-Yang-Komposition).
 *
 * Farben:
 *   #1F2E4A / #2E4C7D  Navyblau  – obere Blattform (links oben)
 *   #C62828 / #EF5350  Signalrot – untere Blattform (rechts unten)
 *
 * viewBox 0 0 44 44
 */
export default function DomIcon({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`dom-icon ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Navy-Gradient: heller oben-links, dunkel unten-rechts */}
        <linearGradient id="dwb-navy" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#2E4C7D" />
          <stop offset="100%" stopColor="#1F2E4A" />
        </linearGradient>

        {/* Rot-Gradient: hell unten-rechts, dunkel oben-links */}
        <linearGradient id="dwb-red" x1="1" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#C62828" />
          <stop offset="100%" stopColor="#EF5350" />
        </linearGradient>
      </defs>

      {/* ── Blaue Blattform (links oben) ─────────────────────────────
          S-Kurve von (40,4) über Mitte (22,22) nach (4,40).
          Linke und obere Kante schließen die Form.
          ─────────────────────────────────────────────────────────── */}
      <path
        d="M 4,4 L 40,4 C 40,22 22,4 22,22 C 22,40 4,22 4,40 L 4,4 Z"
        fill="url(#dwb-navy)"
      />

      {/* ── Rote Blattform (rechts unten) ────────────────────────────
          Spiegelform: exakt komplementär zur blauen Form.
          Zusammen füllen beide den gesamten Rahmeninnenraum.
          ─────────────────────────────────────────────────────────── */}
      <path
        d="M 40,40 L 4,40 C 4,22 22,40 22,22 C 22,4 40,22 40,4 L 40,40 Z"
        fill="url(#dwb-red)"
      />

      {/* Dezente Glanzlinie auf der blauen Form */}
      <path
        d="M 12,6 C 6,10 5,18 8,24"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Quadratischer Rahmen (oben, damit er die Formen überlagert) */}
      <rect x="3" y="3" width="38" height="38" rx="2.5"
        fill="none"
        stroke="#1F2E4A"
        strokeWidth="2"
      />
    </svg>
  )
}
