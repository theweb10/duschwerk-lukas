import React, { useState } from 'react';
import { EINBAUSITUATIONEN } from '../data/productCatalog';

// Visuelle Glastyp-Darstellung — simuliert echte Glaswirkung via CSS
const GLASS_VISUAL = {
  klarglas:       { bg: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,245,255,0.9))', border: '#e0e8f0', label: 'Kristallklar', reflection: true },
  satinato:       { bg: 'linear-gradient(135deg, #e8eaf0, #d5d8e0)', border: '#c8ccd5', label: 'Milchig-Weich', reflection: false },
  parsol_bronze:  { bg: 'linear-gradient(135deg, #C8956C, #A0724E)', border: '#8B5E3C', label: 'Warm Getönt', reflection: true },
  parsol_grau:    { bg: 'linear-gradient(135deg, #909090, #686868)', border: '#555', label: 'Kühl Getönt', reflection: true },
  strukturglas:   { bg: 'repeating-linear-gradient(90deg, #e8e8e0 0px, #f0f0ea 4px, #e2e2da 8px)', border: '#ccc', label: 'Texturiert', reflection: false },
};

// Metall-Profil visuelle Darstellung
const METAL_VISUAL = {
  chrom:     { bg: 'linear-gradient(135deg, #f0f0f0, #d8d8d8, #f0f0f0)', shine: true },
  edelstahl: { bg: 'linear-gradient(180deg, #c0c0c0 0%, #a8a8a8 40%, #b8b8b8 60%, #a0a0a0 100%)', shine: false },
  schwarz:   { bg: 'linear-gradient(135deg, #333, #1a1a1a)', shine: false },
  gold:      { bg: 'linear-gradient(180deg, #d4a855 0%, #c59a48 40%, #d4a855 60%, #b8893d 100%)', shine: true },
  kupfer:    { bg: 'linear-gradient(180deg, #c07040 0%, #a85c30 40%, #b86838 60%, #985228 100%)', shine: false },
};

export default function StepDesign({ config, setField, options, corrections }) {
  const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  const brauchtTuer = einbau && einbau.kompatibleTuersysteme.length > 0;
  const [hoveredGlass, setHoveredGlass] = useState(null);
  const [hoveredMetal, setHoveredMetal] = useState(null);

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Design & Ausstattung</h2>
        <p>Materialien und Oberflächen für Ihre Duschkabine.</p>
      </div>

      {/* Auto-Korrektur Hinweise */}
      {corrections.length > 0 && (
        <div className="wizard-corrections">
          {corrections.map((c, i) => (
            <div key={i} className="correction-hint">
              <span className="correction-icon">i</span>
              <span>{c.reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className="design-sections">
        {/* ── Türsystem ──────────────────────── */}
        {brauchtTuer && (
          <div className="design-group">
            <h3>Türsystem</h3>
            <div className="tuer-grid">
              {options.tuersysteme.map(t => (
                <button
                  key={t.id}
                  className={`tuer-card${config.tuersystem === t.id ? ' active' : ''}`}
                  onClick={() => setField('tuersystem', t.id)}
                >
                  <div className="tuer-icon-area">
                    <TuerIcon typ={t.id} />
                  </div>
                  <span className="tuer-name">{t.name}</span>
                  <span className="tuer-desc">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!brauchtTuer && (
          <div className="design-group">
            <div className="walkin-notice">
              <span className="walkin-icon">⊏</span>
              Walk-In — Offener Einstieg ohne Tür
            </div>
          </div>
        )}

        {/* ── Glastyp (KRITISCH — Visual Cards) ── */}
        <div className="design-group">
          <h3>Glastyp</h3>
          <div className="glass-cards-grid">
            {options.glastypen.map(g => {
              const vis = GLASS_VISUAL[g.id] || GLASS_VISUAL.klarglas;
              const isActive = config.glastyp === g.id;
              const isHovered = hoveredGlass === g.id;

              return (
                <button
                  key={g.id}
                  className={`glass-card-select${isActive ? ' active' : ''}`}
                  onClick={() => setField('glastyp', g.id)}
                  onMouseEnter={() => setHoveredGlass(g.id)}
                  onMouseLeave={() => setHoveredGlass(null)}
                >
                  {/* Material-Preview */}
                  <div
                    className="glass-preview"
                    style={{ background: vis.bg, borderColor: vis.border }}
                  >
                    {vis.reflection && <div className="glass-reflection" />}
                    <span className="glass-type-label">{vis.label}</span>
                  </div>

                  {/* Info */}
                  <div className="glass-card-info">
                    <span className="glass-card-name">{g.name}</span>
                    {(isActive || isHovered) && (
                      <span className="glass-card-desc">{g.description}</span>
                    )}
                  </div>

                  {isActive && <div className="selection-check">&#10003;</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Glasstärke ─────────────────────── */}
        <div className="design-group">
          <h3>Glasstärke</h3>
          <div className="staerke-bar">
            {options.glasstaerken.map(gs => (
              <button
                key={gs.id}
                className={`staerke-option${config.glasstaerke === gs.id ? ' active' : ''}`}
                onClick={() => setField('glasstaerke', gs.id)}
              >
                <div className="staerke-visual">
                  <div
                    className="staerke-line"
                    style={{ width: `${gs.dicke * 0.7}px` }}
                  />
                </div>
                <span>{gs.name}</span>
              </button>
            ))}
          </div>
          {config.hoehe > 180 && (
            <p className="safety-hint">
              Bei Höhen über 180 cm ist mindestens 10 mm Glasstärke erforderlich.
            </p>
          )}
        </div>

        {/* ── Profilfarbe (Material-Swatches) ── */}
        <div className="design-group">
          <h3>Profilfarbe</h3>
          <div className="metal-swatches">
            {options.profilfarben.map(p => {
              const vis = METAL_VISUAL[p.id] || METAL_VISUAL.chrom;
              const isActive = config.profilfarbe === p.id;
              const isHovered = hoveredMetal === p.id;

              return (
                <button
                  key={p.id}
                  className={`metal-swatch${isActive ? ' active' : ''}`}
                  onClick={() => setField('profilfarbe', p.id)}
                  onMouseEnter={() => setHoveredMetal(p.id)}
                  onMouseLeave={() => setHoveredMetal(null)}
                >
                  <div className="metal-preview" style={{ background: vis.bg }}>
                    {vis.shine && <div className="metal-shine" />}
                  </div>
                  <span className="metal-name">{p.name}</span>
                  {isActive && <div className="metal-check">&#10003;</div>}

                  {/* Hover-Detail Tooltip */}
                  {isHovered && !isActive && (
                    <div className="metal-tooltip">Vorschau in 3D</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini-SVG Türsystem-Ikonen
function TuerIcon({ typ }) {
  const style = { width: 36, height: 36, strokeWidth: 1.5, stroke: 'currentColor', fill: 'none' };
  switch (typ) {
    case 'pendel':
      return (
        <svg viewBox="0 0 36 36" style={style}>
          <rect x="4" y="4" width="28" height="28" rx="1" />
          <line x1="18" y1="4" x2="18" y2="32" />
          <path d="M18 18 L28 12" strokeDasharray="2 2" />
          <path d="M18 18 L28 24" strokeDasharray="2 2" />
        </svg>
      );
    case 'schiebe':
      return (
        <svg viewBox="0 0 36 36" style={style}>
          <rect x="4" y="4" width="28" height="28" rx="1" />
          <rect x="8" y="6" width="12" height="24" rx="0.5" opacity="0.3" />
          <rect x="14" y="6" width="12" height="24" rx="0.5" />
          <path d="M20 16 L24 18 L20 20" />
        </svg>
      );
    case 'falt':
      return (
        <svg viewBox="0 0 36 36" style={style}>
          <rect x="4" y="4" width="28" height="28" rx="1" />
          <polyline points="10,6 14,18 10,30" />
          <polyline points="14,6 18,18 14,30" />
          <polyline points="18,6 22,18 18,30" />
        </svg>
      );
    case 'dreh':
      return (
        <svg viewBox="0 0 36 36" style={style}>
          <rect x="4" y="4" width="28" height="28" rx="1" />
          <line x1="6" y1="4" x2="6" y2="32" strokeWidth="2" />
          <rect x="6" y="6" width="18" height="24" rx="0.5" />
          <circle cx="22" cy="18" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return <div style={{ width: 36, height: 36 }} />;
  }
}
