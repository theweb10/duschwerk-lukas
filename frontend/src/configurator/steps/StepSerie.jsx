import React from 'react';
import { SERIEN } from '../data/productCatalog';

const PREISKLASSE_BADGE = {
  premium: { label: 'Premium', color: '#C5A55A' },
  komfort: { label: 'Komfort', color: '#2E7D32' },
  klassik: { label: 'Klassik', color: '#1565C0' },
  basis:   { label: 'Basis',   color: '#757575' },
};

// Visuelle Serien-Ikonen (SVG-basiert, inline)
const SERIE_VISUALS = {
  '5000': { gradient: ['#1a1a2e', '#16213e'], accent: '#C5A55A', icon: '◇' },
  '4000': { gradient: ['#1b3a4b', '#144552'], accent: '#4ECDC4', icon: '◆' },
  '3000': { gradient: ['#2d3436', '#636e72'], accent: '#74b9ff', icon: '▣' },
  '2000': { gradient: ['#3d3d3d', '#555555'], accent: '#dfe6e9', icon: '□' },
  'walkin':    { gradient: ['#0c2461', '#1e3799'], accent: '#48dbfb', icon: '⊏' },
  'badewanne': { gradient: ['#2c3e50', '#34495e'], accent: '#a29bfe', icon: '⊔' },
};

export default function StepSerie({ config, setField }) {
  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Serie wählen</h2>
        <p>Jede Serie definiert Materialqualität, Design und verfügbare Optionen.</p>
      </div>

      <div className="serie-grid-premium">
        {SERIEN.map(serie => {
          const vis = SERIE_VISUALS[serie.id] || SERIE_VISUALS['3000'];
          const badge = PREISKLASSE_BADGE[serie.preisklasse];
          const active = config.serie === serie.id;

          return (
            <button
              key={serie.id}
              className={`serie-card-premium${active ? ' active' : ''}`}
              onClick={() => setField('serie', serie.id)}
            >
              {/* Visual Header */}
              <div
                className="serie-visual"
                style={{ background: `linear-gradient(135deg, ${vis.gradient[0]}, ${vis.gradient[1]})` }}
              >
                <span className="serie-icon" style={{ color: vis.accent }}>{vis.icon}</span>
                <div className="serie-badge" style={{ background: badge.color }}>
                  {badge.label}
                </div>
              </div>

              {/* Content */}
              <div className="serie-body">
                <h3>{serie.name}</h3>
                <p className="serie-desc">{serie.description}</p>

                {/* Feature-Chips */}
                <div className="serie-features">
                  <div className="serie-feature-chip">
                    <span className="feature-dot" style={{ background: vis.accent }} />
                    {serie.glasOptionen.length} Gläser
                  </div>
                  <div className="serie-feature-chip">
                    <span className="feature-dot" style={{ background: vis.accent }} />
                    {serie.profilFarben.length} Profile
                  </div>
                  {serie.beschichtung && (
                    <div className="serie-feature-chip serie-feature-highlight">
                      Pflegeleicht
                    </div>
                  )}
                </div>

                {/* Rahmentypen als Mini-Swatches */}
                <div className="serie-rahmen">
                  {serie.rahmentypen.map(r => (
                    <span key={r} className="rahmen-tag">{r}</span>
                  ))}
                </div>
              </div>

              {/* Selection Indicator */}
              {active && <div className="serie-selected-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
