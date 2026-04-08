import React from 'react';
import { EINBAUSITUATIONEN } from '../data/productCatalog';

function TuerIcon({ typ, active }) {
  const c = active ? '#1F2E4A' : '#8892A4';
  const s = { width: '100%', height: '100%' };

  switch (typ) {
    case 'drehtuer':
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          <rect x="6" y="6" width="44" height="44" rx="2" stroke={c} strokeWidth="1.5" opacity="0.2"/>
          <line x1="6" y1="6" x2="6" y2="50" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="6" y1="50" x2="50" y2="50" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="6" y="8" width="28" height="40" rx="1" stroke={c} strokeWidth="1.8"/>
          <path d="M34 8 Q50 8 50 28" stroke={c} strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round" fill="none"/>
          <circle cx="32" cy="28" r="2" fill={c} opacity="0.6"/>
        </svg>
      );
    case 'schiebe':
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          <rect x="6" y="6" width="44" height="44" rx="2" stroke={c} strokeWidth="1.5" opacity="0.2"/>
          <line x1="6" y1="6" x2="6" y2="50" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="6" y1="50" x2="50" y2="50" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="8" y="8" width="18" height="40" rx="1" stroke={c} strokeWidth="1.5" opacity="0.35"/>
          <rect x="20" y="8" width="18" height="40" rx="1" stroke={c} strokeWidth="1.8"/>
          <path d="M30 24 L36 28 L30 32" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="23" cy="28" r="1.5" fill={c} opacity="0.6"/>
        </svg>
      );
    case 'falt':
      return (
        <svg viewBox="0 0 56 56" style={s} fill="none">
          <rect x="6" y="6" width="44" height="44" rx="2" stroke={c} strokeWidth="1.5" opacity="0.2"/>
          <line x1="6" y1="6" x2="6" y2="50" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="6" y1="50" x2="50" y2="50" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <polyline points="10,8 16,28 10,48" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="16,8 22,28 16,48" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22,8 28,28 22,48" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function StepTuersystem({ config, setField, options }) {
  const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  const keineTuer = !einbau || einbau.kompatibleTuersysteme.length === 0;

  if (keineTuer) {
    return (
      <div className="wizard-step">
        <div className="step-header">
          <div className="step-eyebrow">Schritt 2</div>
          <h2>Türart</h2>
          <p>Für diese Einbausituation ist kein Türsystem erforderlich.</p>
        </div>
        <div className="notice-box notice-box--info">
          <div className="notice-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#1F2E4A" strokeWidth="1.4"/>
              <path d="M9 8v5" stroke="#1F2E4A" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="9" cy="5.5" r="0.8" fill="#1F2E4A"/>
            </svg>
          </div>
          <div>
            <div className="notice-title">Offener Einstieg</div>
            <div className="notice-desc">
              {einbau?.name === 'Walk-In Dusche'
                ? 'Walk-In-Duschen haben keinen Türrahmen – der Einstieg ist offen und barrierefrei.'
                : 'Diese Einbausituation benötigt kein Türsystem.'}
            </div>
          </div>
        </div>
        <p className="step-skip-hint">Dieser Schritt wird automatisch übersprungen.</p>
      </div>
    );
  }

  return (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-eyebrow">Schritt 2</div>
        <h2>Türart</h2>
        <p>Wie soll die Tür Ihrer Dusche öffnen?</p>
      </div>

      <div className="choice-grid choice-grid--2col">
        {options.tuersysteme.map(t => {
          const active = config.tuersystem === t.id;
          return (
            <button
              key={t.id}
              className={`choice-card choice-card--door${active ? ' active' : ''}`}
              onClick={() => setField('tuersystem', t.id)}
            >
              <div className="choice-door-icon">
                <TuerIcon typ={t.id} active={active} />
              </div>
              <div className="choice-door-info">
                <div className="choice-door-name">{t.name}</div>
                <div className="choice-door-desc">{t.description}</div>
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
