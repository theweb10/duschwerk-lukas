import React from 'react';

export default function StepMasse({ config, setField, options }) {
  const { massConstraints } = options;
  const { breite, hoehe } = massConstraints;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Maße eingeben</h2>
        <p>Geben Sie die exakten Maße Ihrer Duschkabine ein (millimetergenau).</p>
      </div>

      <div className="masse-controls">
        {/* Breite */}
        <div className="mass-input-group">
          <div className="mass-label-row">
            <label>Breite</label>
            <div className="mass-value-display">
              <input
                type="number"
                className="mass-number-input"
                value={config.breite}
                min={breite.min}
                max={breite.max}
                onChange={e => {
                  const v = Math.min(breite.max, Math.max(breite.min, Number(e.target.value) || breite.min));
                  setField('breite', v);
                }}
              />
              <span className="mass-unit">cm</span>
            </div>
          </div>
          <input
            type="range"
            className="dim-slider wizard-slider"
            min={breite.min}
            max={breite.max}
            step={breite.step}
            value={config.breite}
            onChange={e => setField('breite', Number(e.target.value))}
          />
          <div className="mass-range-labels">
            <span>{breite.min} cm</span>
            <span>{breite.max} cm</span>
          </div>
        </div>

        {/* Höhe */}
        <div className="mass-input-group">
          <div className="mass-label-row">
            <label>Höhe</label>
            <div className="mass-value-display">
              <input
                type="number"
                className="mass-number-input"
                value={config.hoehe}
                min={hoehe.min}
                max={hoehe.max}
                onChange={e => {
                  const v = Math.min(hoehe.max, Math.max(hoehe.min, Number(e.target.value) || hoehe.min));
                  setField('hoehe', v);
                }}
              />
              <span className="mass-unit">cm</span>
            </div>
          </div>
          <input
            type="range"
            className="dim-slider wizard-slider"
            min={hoehe.min}
            max={hoehe.max}
            step={hoehe.step}
            value={config.hoehe}
            onChange={e => setField('hoehe', Number(e.target.value))}
          />
          <div className="mass-range-labels">
            <span>{hoehe.min} cm</span>
            <span>{hoehe.max} cm</span>
          </div>
        </div>

        {/* Live Preview Chips */}
        <div className="mass-preview">
          <div className="dimension-chip">
            <span className="dimension-chip-label">B</span>
            <span className="dimension-chip-value">
              {config.breite * 10}
              <span className="dimension-chip-unit"> mm</span>
            </span>
          </div>
          <div className="dimension-chip">
            <span className="dimension-chip-label">H</span>
            <span className="dimension-chip-value">
              {config.hoehe * 10}
              <span className="dimension-chip-unit"> mm</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
