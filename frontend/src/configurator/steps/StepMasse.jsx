import React from 'react';

export default function StepMasse({ config, setField, options }) {
  const { massConstraints } = options;
  const { breite, hoehe } = massConstraints;
  const isEcke = config.einbausituation === 'ecke';

  const breitePercent = ((config.breite - breite.min) / (breite.max - breite.min)) * 100;
  const tiefePct      = ((config.tiefe  - breite.min) / (breite.max - breite.min)) * 100;
  const hoehePercent  = ((config.hoehe  - hoehe.min)  / (hoehe.max  - hoehe.min))  * 100;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-eyebrow">Schritt 4</div>
        <h2>Maße</h2>
        <p>Geben Sie die Maße Ihrer Einbausituation ein.</p>
      </div>

      {/* Dimension-Karten */}
      <div className="dim-cards">
        <div className="dim-card">
          <div className="dim-card-label">Breite</div>
          <div className="dim-card-value-row">
            <input
              type="number"
              className="dim-number-input"
              value={config.breite}
              min={breite.min}
              max={breite.max}
              onChange={e => {
                const v = Math.min(breite.max, Math.max(breite.min, Number(e.target.value) || breite.min));
                setField('breite', v);
              }}
            />
            <span className="dim-unit">cm</span>
          </div>
          <div className="dim-slider-wrapper">
            <input
              type="range"
              className="dim-slider"
              min={breite.min}
              max={breite.max}
              step={breite.step}
              value={config.breite}
              style={{ '--pct': `${breitePercent}%` }}
              onChange={e => setField('breite', Number(e.target.value))}
            />
          </div>
          <div className="dim-range-row">
            <span>{breite.min} cm</span>
            <span>{breite.max} cm</span>
          </div>
        </div>

        {isEcke && (
          <div className="dim-card">
            <div className="dim-card-label">Tiefe</div>
            <div className="dim-card-value-row">
              <input
                type="number"
                className="dim-number-input"
                value={config.tiefe}
                min={breite.min}
                max={breite.max}
                onChange={e => {
                  const v = Math.min(breite.max, Math.max(breite.min, Number(e.target.value) || breite.min));
                  setField('tiefe', v);
                }}
              />
              <span className="dim-unit">cm</span>
            </div>
            <div className="dim-slider-wrapper">
              <input
                type="range"
                className="dim-slider"
                min={breite.min}
                max={breite.max}
                step={breite.step}
                value={config.tiefe}
                style={{ '--pct': `${tiefePct}%` }}
                onChange={e => setField('tiefe', Number(e.target.value))}
              />
            </div>
            <div className="dim-range-row">
              <span>{breite.min} cm</span>
              <span>{breite.max} cm</span>
            </div>
          </div>
        )}

        <div className="dim-card">
          <div className="dim-card-label">Höhe</div>
          <div className="dim-card-value-row">
            <input
              type="number"
              className="dim-number-input"
              value={config.hoehe}
              min={hoehe.min}
              max={hoehe.max}
              onChange={e => {
                const v = Math.min(hoehe.max, Math.max(hoehe.min, Number(e.target.value) || hoehe.min));
                setField('hoehe', v);
              }}
            />
            <span className="dim-unit">cm</span>
          </div>
          <div className="dim-slider-wrapper">
            <input
              type="range"
              className="dim-slider"
              min={hoehe.min}
              max={hoehe.max}
              step={hoehe.step}
              value={config.hoehe}
              style={{ '--pct': `${hoehePercent}%` }}
              onChange={e => setField('hoehe', Number(e.target.value))}
            />
          </div>
          <div className="dim-range-row">
            <span>{hoehe.min} cm</span>
            <span>{hoehe.max} cm</span>
          </div>
        </div>
      </div>

      {/* Live-Anzeige in mm */}
      <div className="dim-live-row">
        <div className="dim-live-chip">
          <span className="dim-live-label">Breite</span>
          <span className="dim-live-value">{config.breite * 10} <span className="dim-live-unit">mm</span></span>
        </div>
        {isEcke && (
          <>
            <div className="dim-live-sep">×</div>
            <div className="dim-live-chip">
              <span className="dim-live-label">Tiefe</span>
              <span className="dim-live-value">{config.tiefe * 10} <span className="dim-live-unit">mm</span></span>
            </div>
          </>
        )}
        <div className="dim-live-sep">×</div>
        <div className="dim-live-chip">
          <span className="dim-live-label">Höhe</span>
          <span className="dim-live-value">{config.hoehe * 10} <span className="dim-live-unit">mm</span></span>
        </div>
      </div>

      {config.hoehe > 180 && (
        <div className="notice-box notice-box--warn" style={{ marginTop: 16 }}>
          <div className="notice-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16.5 15H1.5L9 2z" stroke="#B45309" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
              <path d="M9 7v4" stroke="#B45309" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="9" cy="12.5" r="0.8" fill="#B45309"/>
            </svg>
          </div>
          <div>
            <div className="notice-title">Hinweis</div>
            <div className="notice-desc">Bei größeren Höhen entscheidet der Hersteller über die erforderliche Glasstärke zur Gewährleistung der Stabilität.</div>
          </div>
        </div>
      )}

      <p className="step-hint-small" style={{ marginTop: 20 }}>
        Das finale Aufmaß erfolgt immer durch unser Fachpersonal vor Ort.
      </p>
    </div>
  );
}
