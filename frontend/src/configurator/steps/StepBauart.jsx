import React from 'react';

function BauartIcon({ typ, active }) {
  const wall  = active ? '#8892A4' : '#C0C8D4';
  const frame = active ? '#1F2E4A' : '#8892A4';
  const glass = active ? 'rgba(46,127,191,0.10)' : 'rgba(180,210,235,0.12)';
  const glassStroke = active ? '#2E7FBF' : '#A8BFCF';
  const bracket = active ? '#1F2E4A' : '#8892A4';
  const s = { width: '100%', height: '100%' };

  switch (typ) {
    case 'vollgerahmt':
      // Vollständiger Rahmen rund um das Glas
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          {/* Wand links */}
          <rect x="4" y="4" width="7" height="48" fill={wall} rx="1" opacity="0.5"/>
          {/* Kompletter Rahmen */}
          <rect x="11" y="6" width="38" height="44" rx="2" stroke={frame} strokeWidth="3.5" fill={glass}/>
          {/* Glasfläche innen */}
          <rect x="15" y="10" width="30" height="36" rx="1" stroke={glassStroke} strokeWidth="1" fill={glass} strokeDasharray="0"/>
        </svg>
      );
    case 'teilgerahmt':
      // Profil NUR an der Wand (links), freie Seite (rechts) ohne Rahmen
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          {/* Wand links */}
          <rect x="4" y="4" width="7" height="48" fill={wall} rx="1" opacity="0.5"/>
          {/* Wandprofil – U-Schiene nur an der Wandseite */}
          <rect x="11" y="6" width="5" height="44" fill={frame} rx="1"/>
          {/* Oben: Profil nur bis zur Wand (kurzer Riegel) */}
          <rect x="11" y="6" width="30" height="4" fill={frame} rx="1"/>
          {/* Unten: Profil nur bis zur Wand (kurzer Riegel) */}
          <rect x="11" y="46" width="30" height="4" fill={frame} rx="1"/>
          {/* Glas – freie rechte Seite KEIN Rahmen */}
          <rect x="16" y="10" width="28" height="36" fill={glass} stroke={glassStroke} strokeWidth="1"/>
          {/* Freie rechte Kante (nur Glaskante, kein Profil) */}
          <line x1="44" y1="10" x2="44" y2="46" stroke={glassStroke} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'rahmenlos':
      // Nur Befestigungswinkel an der Wand – kein sichtbarer Rahmen
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          {/* Wand links */}
          <rect x="4" y="4" width="7" height="48" fill={wall} rx="1" opacity="0.5"/>
          {/* Winkel oben (Glashalter) */}
          <rect x="10" y="9" width="10" height="5" fill={bracket} rx="1"/>
          <rect x="10" y="9" width="5" height="10" fill={bracket} rx="1"/>
          {/* Winkel unten (Glashalter) */}
          <rect x="10" y="42" width="10" height="5" fill={bracket} rx="1"/>
          <rect x="10" y="37" width="5" height="10" fill={bracket} rx="1"/>
          {/* Glas völlig rahmenlos */}
          <rect x="15" y="10" width="32" height="36" fill={glass} stroke={glassStroke} strokeWidth="1.5" rx="0.5"/>
          {/* Stabilisationsstange oben (typisch bei rahmenlos) */}
          <line x1="15" y1="14" x2="47" y2="14" stroke={frame} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
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
