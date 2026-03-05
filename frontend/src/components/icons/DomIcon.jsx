/**
 * Duschwerk Bayern – Brand Mark  v4
 *
 * Architektonische Silhouette des Regensburger Doms St. Peter:
 *   – Linker Turm: 4 gestufte Absätze → gotische Verjüngung, Spitze bei (10, 2)
 *   – Rechter Turm: 3 gestufte Absätze, 2 Einheiten kürzer (wie beim Original)
 *   – Mittelschiff-Fassade mit Rosettenfenster und drei Lanzett-Portalen
 *   – Profil-Schiene als architektonischer Übergang zur Glasfläche
 *   – Blaue Glasfläche = Duschabtrennung
 *
 * Farben:
 *   #1F2E4A  Dunkelblau  – Türme, Fassade
 *   #C62828  Signalrot   – Turmspitzen
 *   #3B62A8  Blau        – Glasfläche (Gradient)
 *
 * viewBox 0 0 44 50
 */
export default function DomIcon({ size = 36, className = '' }) {
  const h = Math.round(size * 50 / 44)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 44 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`dom-icon ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Glasfläche: blauer Tiefengradient */}
        <linearGradient id="dwb-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3B62A8" />
          <stop offset="100%" stopColor="#1C3870" />
        </linearGradient>

        {/* Turmkörper: dezenter Tiefengradient */}
        <linearGradient id="dwb-spire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2D4062" />
          <stop offset="100%" stopColor="#1F2E4A" />
        </linearGradient>

        {/* Rotspitze: leuchtend oben, satt unten */}
        <linearGradient id="dwb-tip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#EF5350" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>
      </defs>

      {/* ════════════════════════════════════════════════
          LINKER TURM
          Vier Absätze (je 1 px Schulter), Spitze bei (10, 2)
          Breite: 14 px Basis → 12 → 10 → 8 → 4 (Spitzensect.)
          ════════════════════════════════════════════════ */}
      <path
        className="dom-spire"
        d="
          M 3,35
          L 3,28  L 4,28
          L 4,20  L 5,20
          L 5,14  L 6,14
          L 6,8
          L 10,2
          L 14,8
          L 14,14 L 15,14
          L 15,20 L 16,20
          L 16,28 L 17,28
          L 17,35
          Z
        "
        fill="url(#dwb-spire)"
      />

      {/* Linke Rotspitze (oberes Drittel des Turms) */}
      <polygon
        className="dom-tip dom-tip-l"
        points="10,2 6,8 14,8"
        fill="url(#dwb-tip)"
      />

      {/* Linkes Finial (Kreuzblume – kleines Quadrat) */}
      <rect x="9" y="1" width="2" height="2" rx="0.5"
        fill="#EF5350" opacity="0.92"
      />

      {/* Lanzettfenster Spitzenbereich (linker Turm) */}
      <rect x="8.5" y="10" width="3" height="4.5" rx="1.5"
        fill="rgba(255,255,255,0.09)"
      />
      {/* Lanzettfenster Hauptkörper (linker Turm) */}
      <rect x="8" y="21.5" width="4" height="5.5" rx="2"
        fill="rgba(255,255,255,0.07)"
      />

      {/* Gesims-Linie an erster Schulter (linker Turm) */}
      <rect x="4" y="19.5" width="12" height="0.5" rx="0.25"
        fill="rgba(255,255,255,0.13)"
      />
      {/* Gesims-Linie an zweiter Schulter (linker Turm) */}
      <rect x="3" y="27.5" width="14" height="0.5" rx="0.25"
        fill="rgba(255,255,255,0.10)"
      />


      {/* ════════════════════════════════════════════════
          RECHTER TURM
          Drei Absätze, Spitze bei (34, 4) – 2 Einh. kürzer
          Breite: 14 px Basis → 12 → 10 → 4 (Spitzensect.)
          ════════════════════════════════════════════════ */}
      <path
        className="dom-spire"
        d="
          M 27,35
          L 27,30  L 28,30
          L 28,22  L 29,22
          L 29,16  L 30,16
          L 30,10
          L 34,4
          L 38,10
          L 38,16  L 39,16
          L 39,22  L 40,22
          L 40,30  L 41,30
          L 41,35
          Z
        "
        fill="url(#dwb-spire)"
      />

      {/* Rechte Rotspitze */}
      <polygon
        className="dom-tip dom-tip-r"
        points="34,4 30,10 38,10"
        fill="url(#dwb-tip)"
      />

      {/* Rechtes Finial */}
      <rect x="33" y="3" width="2" height="2" rx="0.5"
        fill="#EF5350" opacity="0.92"
      />

      {/* Lanzettfenster Spitzenbereich (rechter Turm) */}
      <rect x="32.5" y="12" width="3" height="4.5" rx="1.5"
        fill="rgba(255,255,255,0.09)"
      />
      {/* Lanzettfenster Hauptkörper (rechter Turm) */}
      <rect x="32" y="23" width="4" height="5.5" rx="2"
        fill="rgba(255,255,255,0.07)"
      />

      {/* Gesims-Linie an erster Schulter (rechter Turm) */}
      <rect x="28" y="21.5" width="12" height="0.5" rx="0.25"
        fill="rgba(255,255,255,0.11)"
      />
      {/* Gesims-Linie an zweiter Schulter (rechter Turm) */}
      <rect x="27" y="29.5" width="14" height="0.5" rx="0.25"
        fill="rgba(255,255,255,0.09)"
      />


      {/* ════════════════════════════════════════════════
          MITTELSCHIFF-FASSADE
          Verbindet die Türme, enthält Rosette + Portale
          ════════════════════════════════════════════════ */}
      <rect x="17" y="26" width="10" height="9"
        fill="url(#dwb-spire)"
      />

      {/* Rosettenfenster (äußerer Ring) */}
      <circle cx="22" cy="29"  r="2.4"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.7"
      />
      {/* Rosettenfenster (innerer Ring) */}
      <circle cx="22" cy="29" r="1.0"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.5"
      />

      {/* Drei Portal-Bögen am Fuß der Fassade */}
      <rect x="18"   y="31.5" width="2.5" height="3.5" rx="1.25"
        fill="rgba(255,255,255,0.07)"
      />
      <rect x="21"   y="30.5" width="2"   height="4.5" rx="1.00"
        fill="rgba(255,255,255,0.10)"
      />
      <rect x="23.5" y="31.5" width="2.5" height="3.5" rx="1.25"
        fill="rgba(255,255,255,0.07)"
      />


      {/* ════════════════════════════════════════════════
          PROFIL-SCHIENE
          Architektonischer Übergang Dom → Glasfläche
          Repräsentiert Ober-Profil der Duschabtrennung
          ════════════════════════════════════════════════ */}
      <rect x="0" y="35" width="44" height="3" fill="#142033" />


      {/* ════════════════════════════════════════════════
          GLASFLÄCHE
          Blaues Rechteck = Duschabtrennung aus Glas
          ════════════════════════════════════════════════ */}
      <rect x="0" y="38" width="44" height="12" rx="1"
        fill="url(#dwb-glass)"
      />

      {/* Obere Glaskante – helle Reflexionslinie */}
      <rect x="0" y="38" width="44" height="1.3" rx="0.65"
        fill="white" fillOpacity="0.22"
      />

      {/* Horizontale Innenhighlight-Linie (Lichteinfall) */}
      <rect x="5" y="43.5" width="34" height="0.6" rx="0.3"
        fill="white" fillOpacity="0.10"
      />

      {/* Vertikales Trennprofil (Glashalterung, mittig) */}
      <rect x="21" y="38" width="2" height="12"
        fill="#1F2E4A" fillOpacity="0.25"
      />
    </svg>
  )
}
