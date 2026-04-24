import React, { useState } from 'react';

// Glastyp-Visuals – IDs aus productCatalog.js
const GLASS_VISUAL = {
  klarglas:    { bg: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(235,245,255,0.92))', border: '#D4E2EF', label: 'Kristallklar',   tint: false },
  ultraclear:  { bg: 'linear-gradient(145deg, rgba(250,255,252,0.99), rgba(240,252,248,0.95))', border: '#C8E4DB', label: 'Ultra-klar',     tint: false },
  grauglas:    { bg: 'linear-gradient(145deg, #A8B0B8, #7E868E)',                               border: '#6A7078', label: 'Grau getönt',    tint: true },
  graphitglas: { bg: 'linear-gradient(145deg, #525A62, #3A4048)',                               border: '#2E3640', label: 'Graphit',        tint: true },
  braunglas:   { bg: 'linear-gradient(145deg, #B8876A, #8C6048)',                               border: '#7A4E38', label: 'Bronze-Ton',     tint: true },
  spiegelglas: { bg: 'linear-gradient(145deg, #D8E8F0, #B0C8DC, #D8E8F0)',                     border: '#90B0C8', label: 'Spiegelnd',      tint: false },
};

export default function StepDesign({ config, setField, options, corrections }) {
  const [hoveredProfil, setHoveredProfil] = useState(null);

  return (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-eyebrow">Schritt 5</div>
        <h2>Design</h2>
        <p>Glasfarbe und Profilfarbe wählen.</p>
      </div>

      {corrections.length > 0 && (
        <div className="corrections-list">
          {corrections.map((c, i) => (
            <div key={i} className="correction-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6" stroke="#B45309" strokeWidth="1.2"/>
                <path d="M7 4.5v3" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="0.6" fill="#B45309"/>
              </svg>
              <span>{c.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Glasfarbe ─────────────────────────── */}
      <div className="design-group">
        <div className="design-group-label">Glasfarbe</div>
        <div className="glass-grid">
          {options.glastypen.map(g => {
            const vis    = GLASS_VISUAL[g.id] || GLASS_VISUAL.klarglas;
            const active = config.glastyp === g.id;
            return (
              <button
                key={g.id}
                className={`glass-tile${active ? ' active' : ''}`}
                onClick={() => setField('glastyp', g.id)}
                title={g.description}
              >
                <div className="glass-tile-preview" style={{ background: vis.bg, borderColor: vis.border }}>
                  {!vis.tint && (
                    <div className="glass-tile-shine" />
                  )}
                  <span className="glass-tile-sublabel">{vis.label}</span>
                </div>
                <div className="glass-tile-name">{g.name}</div>
                {active && (
                  <div className="tile-check">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Profilfarbe ───────────────────────── */}
      <div className="design-group">
        <div className="design-group-label">Profilfarbe</div>
        <div className="profil-swatch-grid">
          {options.profilfarben.map(p => {
            const active = config.profilfarbe === p.id;
            return (
              <button
                key={p.id}
                className={`profil-swatch${active ? ' active' : ''}`}
                onClick={() => setField('profilfarbe', p.id)}
                onMouseEnter={() => setHoveredProfil(p.id)}
                onMouseLeave={() => setHoveredProfil(null)}
                title={p.name}
              >
                <div
                  className="profil-swatch-dot"
                  style={{ background: p.swatch }}
                />
                {active && (
                  <div className="profil-swatch-check">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <path d="M1 3.5l2 2L6 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="profil-selected-name">
          {hoveredProfil
            ? options.profilfarben.find(p => p.id === hoveredProfil)?.name
            : config.profilfarbe
              ? `Gewählt: ${options.profilfarben.find(p => p.id === config.profilfarbe)?.name}`
              : '\u00A0'}
        </div>
      </div>
    </div>
  );
}
