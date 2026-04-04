import React from 'react';

// Visuelle Grundriss-SVGs für jede Einbausituation
function GrundrissIcon({ typ, active }) {
  const color = active ? '#1F2E4A' : '#888';
  const glass = active ? '#4ECDC4' : '#aaa';
  const wall = active ? '#1F2E4A' : '#bbb';
  const style = { width: '100%', height: '100%' };

  switch (typ) {
    case 'ecke':
      return (
        <svg viewBox="0 0 80 80" style={style}>
          {/* Wände */}
          <line x1="10" y1="10" x2="10" y2="70" stroke={wall} strokeWidth="4" />
          <line x1="10" y1="70" x2="70" y2="70" stroke={wall} strokeWidth="4" />
          {/* Glas-Front */}
          <line x1="10" y1="10" x2="55" y2="10" stroke={glass} strokeWidth="2.5" />
          {/* Glas-Seite */}
          <line x1="55" y1="10" x2="55" y2="45" stroke={glass} strokeWidth="2.5" />
          {/* Boden-Fläche */}
          <rect x="12" y="12" width="41" height="56" fill={active ? 'rgba(78,205,196,0.08)' : 'rgba(0,0,0,0.02)'} />
          {/* Duschkopf */}
          <circle cx="30" cy="35" r="3" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'nische':
      return (
        <svg viewBox="0 0 80 80" style={style}>
          <line x1="10" y1="10" x2="10" y2="70" stroke={wall} strokeWidth="4" />
          <line x1="70" y1="10" x2="70" y2="70" stroke={wall} strokeWidth="4" />
          <line x1="10" y1="70" x2="70" y2="70" stroke={wall} strokeWidth="4" />
          {/* Glas-Front */}
          <line x1="10" y1="10" x2="70" y2="10" stroke={glass} strokeWidth="2.5" />
          <rect x="12" y="12" width="56" height="56" fill={active ? 'rgba(78,205,196,0.08)' : 'rgba(0,0,0,0.02)'} />
          <circle cx="40" cy="40" r="3" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'walkin':
      return (
        <svg viewBox="0 0 80 80" style={style}>
          <line x1="10" y1="10" x2="10" y2="70" stroke={wall} strokeWidth="4" />
          <line x1="10" y1="70" x2="70" y2="70" stroke={wall} strokeWidth="4" />
          {/* Glas — offen (keine Tür) */}
          <line x1="10" y1="10" x2="45" y2="10" stroke={glass} strokeWidth="2.5" />
          {/* Offener Bereich */}
          <line x1="50" y1="10" x2="55" y2="10" stroke={glass} strokeWidth="1" strokeDasharray="3 3" />
          <rect x="12" y="12" width="33" height="56" fill={active ? 'rgba(78,205,196,0.08)' : 'rgba(0,0,0,0.02)'} />
          {/* Pfeil (offener Zugang) */}
          <path d="M55 25 L65 18 L65 32 Z" fill={active ? glass : '#ccc'} opacity="0.5" />
          <circle cx="28" cy="38" r="3" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'badewanne':
      return (
        <svg viewBox="0 0 80 80" style={style}>
          {/* Badewanne (Draufsicht) */}
          <rect x="10" y="25" width="60" height="40" rx="8" fill="none" stroke={wall} strokeWidth="2.5" />
          {/* Glaswand */}
          <line x1="10" y1="25" x2="70" y2="25" stroke={glass} strokeWidth="2.5" />
          {/* Wasser-Andeut */}
          <ellipse cx="40" cy="48" rx="18" ry="8" fill={active ? 'rgba(78,205,196,0.12)' : 'rgba(0,0,0,0.03)'} />
          {/* Armatur */}
          <circle cx="55" cy="35" r="2.5" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'sonder':
      return (
        <svg viewBox="0 0 80 80" style={style}>
          {/* Schräge Wand (Dachschräge) */}
          <line x1="10" y1="10" x2="10" y2="70" stroke={wall} strokeWidth="4" />
          <line x1="10" y1="70" x2="70" y2="70" stroke={wall} strokeWidth="4" />
          <line x1="10" y1="10" x2="60" y2="30" stroke={wall} strokeWidth="2" strokeDasharray="4 3" />
          {/* Glas (angepasst) */}
          <line x1="55" y1="28" x2="55" y2="55" stroke={glass} strokeWidth="2.5" />
          <rect x="12" y="32" width="41" height="36" fill={active ? 'rgba(78,205,196,0.08)' : 'rgba(0,0,0,0.02)'} />
          {/* Schräge Markierung */}
          <text x="35" y="22" fontSize="10" fill={color} opacity="0.5">∠</text>
        </svg>
      );
    default:
      return <div />;
  }
}

export default function StepEinbausituation({ config, setField, options }) {
  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Einbausituation</h2>
        <p>Wie ist Ihre Dusche im Badezimmer angeordnet?</p>
      </div>

      <div className="einbau-grid-premium">
        {options.einbausituationen.map(einbau => {
          const active = config.einbausituation === einbau.id;
          return (
            <button
              key={einbau.id}
              className={`einbau-card-premium${active ? ' active' : ''}`}
              onClick={() => setField('einbausituation', einbau.id)}
            >
              <div className="einbau-grundriss">
                <GrundrissIcon typ={einbau.id} active={active} />
              </div>
              <div className="einbau-info">
                <h3>{einbau.name}</h3>
                <p>{einbau.description}</p>
              </div>
              {active && <div className="einbau-check">&#10003;</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
