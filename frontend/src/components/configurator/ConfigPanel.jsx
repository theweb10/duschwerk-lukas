import React from 'react';

const PROFILES = [
  { value: 'Chrom poliert',       swatch: '#E8E8E8' },
  { value: 'Edelstahl gebürstet', swatch: '#AAAAAA' },
  { value: 'Schwarz matt',        swatch: '#222222' },
];

export default function ConfigPanel({ config, onChange }) {
  const set = (key, value) => onChange(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      {/* Brand */}
      <div className="config-brand">
        DUSCHWERK <span>BAYERN</span>
      </div>

      {/* Abmessungen */}
      <div className="config-section">
        <h3>Abmessungen</h3>
        <div className="dimension-grid">
          <div className="dimension-chip">
            <span className="dimension-chip-label">B</span>
            <span className="dimension-chip-value">
              {(config.breite ?? 120) * 10}
              <span className="dimension-chip-unit"> mm</span>
            </span>
          </div>
          <div className="dimension-chip">
            <span className="dimension-chip-label">H</span>
            <span className="dimension-chip-value">
              {(config.hoehe ?? 200) * 10}
              <span className="dimension-chip-unit"> mm</span>
            </span>
          </div>
          <div className="dimension-chip">
            <span className="dimension-chip-label">T</span>
            <span className="dimension-chip-value">
              900
              <span className="dimension-chip-unit"> mm</span>
            </span>
          </div>
        </div>
      </div>

      {/* Duschtyp */}
      <div className="config-section">
        <h3>Duschtyp</h3>
        <div className="option-chips">
          {['Walk-in', 'Drehtür', 'Schiebetür', 'Nische'].map(v => (
            <button
              key={v}
              className={`option-chip${config.typ === v ? ' active' : ''}`}
              onClick={() => set('typ', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Glas */}
      <div className="config-section">
        <h3>Glas</h3>
        <div className="option-chips">
          {['Klarglas', 'Satinato', 'Parsol Bronze', 'Parsol Grau'].map(v => (
            <button
              key={v}
              className={`option-chip${config.glas === v ? ' active' : ''}`}
              onClick={() => set('glas', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Glasstärke */}
      <div className="config-section">
        <h3>Glasstärke</h3>
        <div className="option-chips">
          {['6mm', '8mm', '10mm'].map(v => (
            <button
              key={v}
              className={`option-chip${config.staerke === v ? ' active' : ''}`}
              onClick={() => set('staerke', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Profil */}
      <div className="config-section">
        <h3>Profil</h3>
        <div className="profile-options">
          {PROFILES.map(({ value, swatch }) => (
            <button
              key={value}
              className={`profile-option${config.profil === value ? ' active' : ''}`}
              onClick={() => set('profil', value)}
            >
              <span className="profile-swatch" style={{ background: swatch }} />
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Breite */}
      <div className="config-section">
        <h3>Breite</h3>
        <div className="dim-slider-row">
          <span className="dim-slider-label">Breite</span>
          <span className="dim-slider-value">{(config.breite ?? 120) * 10} mm</span>
        </div>
        <input
          type="range"
          className="dim-slider"
          min={60}
          max={200}
          value={config.breite ?? 120}
          onChange={e => set('breite', Number(e.target.value))}
        />
      </div>

      {/* Höhe */}
      <div className="config-section">
        <h3>Höhe</h3>
        <div className="dim-slider-row">
          <span className="dim-slider-label">Höhe</span>
          <span className="dim-slider-value">{(config.hoehe ?? 200) * 10} mm</span>
        </div>
        <input
          type="range"
          className="dim-slider"
          min={150}
          max={220}
          value={config.hoehe ?? 200}
          onChange={e => set('hoehe', Number(e.target.value))}
        />
      </div>

      {/* CTA */}
      <div className="config-section">
        <button className="btn-primary" style={{ width: '100%' }}>
          Angebot anfragen
        </button>
      </div>
    </div>
  );
}
