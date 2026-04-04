import React from 'react';

export default function StepEinstieg({ onNext }) {
  return (
    <div className="wizard-step step-einstieg">
      <div className="step-header">
        <h2>Duschkabine konfigurieren</h2>
        <p>
          Planen Sie Ihre individuelle Duschkabine in wenigen Schritten.
          Der Konfigurator führt Sie durch alle Optionen und zeigt nur
          technisch mögliche Kombinationen.
        </p>
      </div>

      <div className="einstieg-features">
        <div className="einstieg-feature">
          <div className="einstieg-icon">◇</div>
          <h3>3D-Vorschau</h3>
          <p>Sehen Sie Ihre Konfiguration in Echtzeit</p>
        </div>
        <div className="einstieg-feature">
          <div className="einstieg-icon">⬡</div>
          <h3>Millimetergenau</h3>
          <p>Individuelle Maße für Ihre Einbausituation</p>
        </div>
        <div className="einstieg-feature">
          <div className="einstieg-icon">▣</div>
          <h3>Technisch validiert</h3>
          <p>Nur machbare Kombinationen sind wählbar</p>
        </div>
      </div>

      <button className="btn-primary wizard-cta" onClick={onNext}>
        Konfiguration starten
      </button>
    </div>
  );
}
