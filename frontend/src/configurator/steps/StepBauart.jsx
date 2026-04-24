import React from 'react';

function BauartIcon({ typ, active }) {
  const c = active ? '#1F2E4A' : '#8892A4';
  const g = active ? '#2E7FBF' : '#A8BFCF';
  const s = { width: '100%', height: '100%' };

  switch (typ) {
    case 'vollgerahmt':
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          <rect x="10" y="8" width="36" height="40" rx="2" stroke={c} strokeWidth="3"/>
          <rect x="13" y="11" width="30" height="34" rx="1" stroke={g} strokeWidth="1.5" fill={active ? 'rgba(46,127,191,0.06)' : 'rgba(0,0,0,0.02)'}/>
        </svg>
      );
    case 'teilgerahmt':
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          <rect x="13" y="8" width="30" height="40" rx="1" stroke={g} strokeWidth="1.5" fill={active ? 'rgba(46,127,191,0.06)' : 'rgba(0,0,0,0.02)'}/>
          <line x1="10" y1="8" x2="46" y2="8" stroke={c} strokeWidth="3" strokeLinecap="round"/>
          <line x1="10" y1="8" x2="10" y2="48" stroke={c} strokeWidth="3" strokeLinecap="round"/>
          <line x1="46" y1="8" x2="46" y2="48" stroke={c} strokeWidth="3" strokeLinecap="round"/>
          {/* Kein Rahmen unten */}
          <line x1="10" y1="48" x2="18" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          <line x1="38" y1="48" x2="46" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
        </svg>
      );
    case 'rahmenlos':
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          <rect x="13" y="8" width="30" height="40" rx="1" stroke={g} strokeWidth="2.5" fill={active ? 'rgba(46,127,191,0.06)' : 'rgba(0,0,0,0.02)'}/>
          <line x1="13" y1="8" x2="13" y2="48" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="43" y1="8" x2="43" y2="48" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function StepBauart({ config, setField, options }) {
  return (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-eyebrow">Schritt 3</div>
        <h2>Bauart</h2>
        <p>Wie soll die Duschabtrennung gerahmt sein?</p>
      </div>

      <div className="choice-grid choice-grid--3col">
        {options.rahmentypen.map(r => {
          const active = config.rahmentyp === r.id;
          return (
            <button
              key={r.id}
              className={`choice-card choice-card--bauart${active ? ' active' : ''}`}
              onClick={() => setField('rahmentyp', r.id)}
            >
              <div className="choice-bauart-icon">
                <BauartIcon typ={r.id} active={active} />
              </div>
              <div className="choice-bauart-name">{r.name}</div>
              <div className="choice-bauart-desc">{r.description}</div>
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

      {config.rahmentyp === 'rahmenlos' && (
        <div className="notice-box notice-box--info" style={{ marginTop: 16 }}>
          <div className="notice-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#1F2E4A" strokeWidth="1.4"/>
              <path d="M9 8v5" stroke="#1F2E4A" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="9" cy="5.5" r="0.8" fill="#1F2E4A"/>
            </svg>
          </div>
          <div>
            <div className="notice-title">Rahmenlos – nur auf Anfrage</div>
            <div className="notice-desc">Rahmenlose Ausführungen werden individuell geplant und sind ausschließlich auf Anfrage erhältlich.</div>
          </div>
        </div>
      )}

      <div className="notice-box notice-box--info" style={{ marginTop: 16 }}>
        <div className="notice-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#1F2E4A" strokeWidth="1.4"/>
            <path d="M9 8v5" stroke="#1F2E4A" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="9" cy="5.5" r="0.8" fill="#1F2E4A"/>
          </svg>
        </div>
        <div>
          <div className="notice-title">Fixteil & Stabilisationsstange</div>
          <div className="notice-desc">Wenn Sie ein Fixteil haben (festes Glasteil zwischen Türe und Wand), ist stets eine Stabilisationsstange erforderlich. Es gibt Modelle sowohl mit Fixteil als auch mit Türe direkt an der Wand.</div>
        </div>
      </div>
    </div>
  );
}
