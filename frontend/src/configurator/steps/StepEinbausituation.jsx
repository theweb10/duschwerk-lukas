import React from 'react';

function GrundrissIcon({ typ, active }) {
  const wall  = active ? '#1F2E4A' : '#C8CDD6';
  const glass = active ? '#2E7FBF' : '#8FADC8';
  const fill  = active ? 'rgba(46,127,191,0.08)' : 'rgba(0,0,0,0.02)';
  const s = { width: '100%', height: '100%' };

  switch (typ) {
    case 'nische':
      return (
        <svg viewBox="0 0 72 72" style={s}>
          <rect x="12" y="12" width="48" height="48" fill={fill} rx="1"/>
          <line x1="12" y1="12" x2="12" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="60" y1="12" x2="60" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="60" x2="60" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="12" x2="60" y2="12" stroke={glass} strokeWidth="3" strokeLinecap="round"/>
          <line x1="36" y1="12" x2="36" y2="24" stroke={glass} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
          <circle cx="36" cy="36" r="3" fill="none" stroke={wall} strokeWidth="1.2" opacity="0.4"/>
        </svg>
      );
    case 'ecke':
      return (
        <svg viewBox="0 0 72 72" style={s}>
          <rect x="12" y="12" width="44" height="44" fill={fill} rx="1"/>
          <line x1="12" y1="12" x2="12" y2="56" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="56" x2="56" y2="56" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="12" x2="46" y2="12" stroke={glass} strokeWidth="3" strokeLinecap="round"/>
          <line x1="46" y1="12" x2="46" y2="46" stroke={glass} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="28" cy="36" r="3" fill="none" stroke={wall} strokeWidth="1.2" opacity="0.4"/>
          {/* Breite-Bemaßung */}
          <line x1="12" y1="8" x2="46" y2="8" stroke={glass} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.7"/>
          <text x="29" y="6.5" textAnchor="middle" fontSize="5" fill={glass} opacity="0.8">Breite</text>
          {/* Tiefe-Bemaßung */}
          <line x1="48" y1="12" x2="48" y2="46" stroke={glass} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.7"/>
          <text x="54" y="31" textAnchor="middle" fontSize="5" fill={glass} opacity="0.8" transform="rotate(90,54,31)">Tiefe</text>
        </svg>
      );
    case 'walkin':
      return (
        <svg viewBox="0 0 72 72" style={s}>
          <rect x="12" y="12" width="32" height="48" fill={fill} rx="1"/>
          <line x1="12" y1="12" x2="12" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="60" x2="60" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="12" x2="40" y2="12" stroke={glass} strokeWidth="3" strokeLinecap="round"/>
          <path d="M44 18 L58 12" stroke={glass} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round"/>
          <path d="M54 8 L60 12 L54 16" fill="none" stroke={glass} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          <circle cx="26" cy="36" r="3" fill="none" stroke={wall} strokeWidth="1.2" opacity="0.4"/>
        </svg>
      );
    case 'glaswand':
      return (
        <svg viewBox="0 0 72 72" style={s}>
          <line x1="12" y1="12" x2="12" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="60" x2="60" y2="60" stroke={wall} strokeWidth="4" strokeLinecap="round"/>
          <line x1="12" y1="36" x2="52" y2="36" stroke={glass} strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="30" x2="52" y2="42" stroke={glass} strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="14" y="38" width="36" height="20" fill={fill} rx="1"/>
          <path d="M26 44 L26 52" stroke={wall} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.3"/>
        </svg>
      );
    case 'badewanne':
      return (
        <svg viewBox="0 0 72 72" style={s}>
          <rect x="10" y="28" width="52" height="34" rx="8" fill={fill} stroke={wall} strokeWidth="2.5"/>
          <line x1="10" y1="28" x2="62" y2="28" stroke={glass} strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="36" cy="48" rx="14" ry="7" fill={active ? 'rgba(46,127,191,0.12)' : 'rgba(0,0,0,0.03)'}/>
          <circle cx="52" cy="36" r="2.5" fill="none" stroke={wall} strokeWidth="1.2" opacity="0.5"/>
          <line x1="36" y1="14" x2="36" y2="24" stroke={wall} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
          <path d="M30 14 L36 14 L42 14" stroke={wall} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
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
        <div className="step-eyebrow">Schritt 1</div>
        <h2>Einbausituation</h2>
        <p>Wie ist Ihre Dusche im Badezimmer angeordnet?</p>
      </div>

      <div className="choice-grid choice-grid--2col">
        {options.einbausituationen.map(einbau => {
          const active = config.einbausituation === einbau.id;
          return (
            <button
              key={einbau.id}
              className={`choice-card choice-card--plan${active ? ' active' : ''}`}
              onClick={() => setField('einbausituation', einbau.id)}
            >
              <div className="choice-plan-icon">
                <GrundrissIcon typ={einbau.id} active={active} />
              </div>
              <div className="choice-plan-info">
                <div className="choice-plan-name">{einbau.name}</div>
                <div className="choice-plan-desc">{einbau.description}</div>
              </div>
              {active && (
                <div className="choice-check">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
