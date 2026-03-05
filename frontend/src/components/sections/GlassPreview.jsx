const glassFill = {
  'Klarglas':      { fill: '#3B62A8', opacity: 0.18 },
  'Satinato':      { fill: '#D8DCE8', opacity: 0.50 },
  'Parsol Bronze': { fill: '#8B6914', opacity: 0.40 },
  'Parsol Grau':   { fill: '#5A5A6A', opacity: 0.38 },
}

const profilStroke = {
  'Chrom poliert':        '#E0E0E0',
  'Edelstahl gebürstet':  '#A8A8A8',
  'Schwarz matt':         '#222222',
}

function WalkInShape({ fill, opacity, stroke }) {
  return (
    <g>
      {/* Back wall panel */}
      <rect x="60" y="30" width="8" height="190" fill={stroke} rx="2" />
      {/* Main glass panel */}
      <rect x="68" y="30" width="120" height="190" fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2.5" />
      {/* Bottom profile */}
      <rect x="60" y="218" width="128" height="7" fill={stroke} rx="2" />
      {/* Side return panel */}
      <rect x="188" y="30" width="60" height="7" fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2" />
      <rect x="188" y="30" width="8" height="80" fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2" />
      {/* Top profile on main */}
      <rect x="60" y="23" width="128" height="7" fill={stroke} rx="2" />
    </g>
  )
}

function DrehtuerShape({ fill, opacity, stroke }) {
  return (
    <g>
      {/* Frame */}
      <rect x="50" y="20" width="8" height="205" fill={stroke} rx="2" />
      <rect x="50" y="20" width="160" height="7" fill={stroke} rx="2" />
      <rect x="202" y="20" width="8" height="205" fill={stroke} rx="2" />
      <rect x="50" y="218" width="160" height="7" fill={stroke} rx="2" />
      {/* Door glass */}
      <rect x="58" y="27" width="152" height="191" fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="1.5" />
      {/* Hinge indicators */}
      <circle cx="62" cy="70" r="4" fill={stroke} />
      <circle cx="62" cy="175" r="4" fill={stroke} />
      {/* Handle */}
      <rect x="192" y="108" width="5" height="40" fill={stroke} rx="2.5" />
      {/* Open arc hint */}
      <path d="M 210 225 Q 270 220 270 150" fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
    </g>
  )
}

function SchiebetuerShape({ fill, opacity, stroke }) {
  return (
    <g>
      {/* Track top */}
      <rect x="45" y="20" width="180" height="5" fill={stroke} rx="2" />
      {/* Track bottom */}
      <rect x="45" y="220" width="180" height="5" fill={stroke} rx="2" />
      {/* Panel 1 (back) */}
      <rect x="50" y="25" width="100" height="195" fill={fill} fillOpacity={opacity * 0.7} stroke={stroke} strokeWidth="1.5" />
      {/* Panel 2 (front, overlapping) */}
      <rect x="110" y="25" width="100" height="195" fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2" />
      {/* Handle on front panel */}
      <rect x="115" y="108" width="5" height="40" fill={stroke} rx="2.5" />
    </g>
  )
}

function NischeShape({ fill, opacity, stroke }) {
  return (
    <g>
      {/* Left side wall */}
      <rect x="40" y="20" width="8" height="205" fill={stroke} rx="2" />
      <rect x="48" y="20" width="55" height="195" fill={fill} fillOpacity={opacity * 0.6} stroke={stroke} strokeWidth="1.5" />
      {/* Right side wall */}
      <rect x="222" y="20" width="8" height="205" fill={stroke} rx="2" />
      <rect x="167" y="20" width="55" height="195" fill={fill} fillOpacity={opacity * 0.6} stroke={stroke} strokeWidth="1.5" />
      {/* Main front glass */}
      <rect x="103" y="20" width="64" height="195" fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth="2.5" />
      {/* Top profile */}
      <rect x="40" y="13" width="190" height="7" fill={stroke} rx="2" />
      {/* Bottom profile */}
      <rect x="40" y="218" width="190" height="7" fill={stroke} rx="2" />
    </g>
  )
}

const shapes = {
  'Walk-in':    WalkInShape,
  'Drehtür':    DrehtuerShape,
  'Schiebetür': SchiebetuerShape,
  'Nische':     NischeShape,
}

export default function GlassPreview({ config }) {
  const { fill, opacity } = glassFill[config.glas] || glassFill['Klarglas']
  const stroke = profilStroke[config.profil] || profilStroke['Chrom poliert']
  const Shape = shapes[config.typ] || WalkInShape

  const w = config.breite || 120
  const h = config.hoehe || 200

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        style={{
          perspective: '700px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 270 260"
          width="100%"
          style={{
            maxWidth: '340px',
            transform: 'rotateY(-8deg)',
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Floor */}
          <ellipse cx="135" cy="248" rx="100" ry="8" fill="rgba(0,0,0,0.06)" />
          <Shape fill={fill} opacity={opacity} stroke={stroke} />
        </svg>
      </div>

      {/* Dimensions badge */}
      <div
        className="flex items-center gap-2 text-xs font-light"
        style={{ color: '#6B7280' }}
      >
        <span
          style={{
            background: '#F3F4F6',
            borderRadius: '6px',
            padding: '4px 10px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.02em',
          }}
        >
          {w} × {h} cm
        </span>
        <span
          style={{
            background: '#F3F4F6',
            borderRadius: '6px',
            padding: '4px 10px',
          }}
        >
          {config.staerke || '8mm'}
        </span>
      </div>

      {/* Config summary chips */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {[config.typ, config.glas, config.profil].filter(Boolean).map((val) => (
          <span
            key={val}
            style={{
              background: '#EEF2FF',
              color: '#1F2E4A',
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: '500',
            }}
          >
            {val}
          </span>
        ))}
        {(config.extras || []).map((ex) => (
          <span
            key={ex}
            style={{
              background: '#FEF2F2',
              color: '#C62828',
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: '500',
            }}
          >
            {ex}
          </span>
        ))}
      </div>
    </div>
  )
}
