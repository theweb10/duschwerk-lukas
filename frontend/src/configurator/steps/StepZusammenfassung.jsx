import React, { useState, useCallback } from 'react';

const SUMMARY_LABELS = {
  einbausituation: 'Einbausituation',
  tuersystem:      'Türart',
  rahmentyp:       'Bauart',
  breite:          'Breite',
  tiefe:           'Tiefe',
  hoehe:           'Höhe',
  glastyp:         'Glasfarbe',
  profilfarbe:     'Profilfarbe',
};

export default function StepZusammenfassung({ summary, validation, onSubmit, onReset }) {
  const [contact, setContact]  = useState({ name: '', email: '', telefon: '', nachricht: '' });
  const [sending, setSending]  = useState(false);
  const [sent,    setSent]     = useState(false);
  const [error,   setError]    = useState('');

  const rows = Object.entries(SUMMARY_LABELS).map(([key, label]) => [label, summary[key]]);

  const printConfig = useCallback(() => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Konfiguration – Duschwerk Bayern</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 400px; margin: 48px auto; color: #1F2E4A; }
        h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
        .sub { font-size: 11px; color: #999; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; }
        td:first-child { color: #888; width: 40%; }
        td:last-child { font-weight: 600; }
        .footer { margin-top: 32px; font-size: 10px; color: #ccc; }
      </style></head><body>
      <h1>Duschwerk Bayern</h1>
      <div class="sub">Konfiguration · ${new Date().toLocaleDateString('de-DE')}</div>
      <table>${rows.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      <div class="footer">Prüfeninger Straße 73 · 93049 Regensburg · info@duschwerk-bayern.de</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  }, [rows]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!contact.name || !contact.email) return;
    setSending(true);
    setError('');
    try {
      const payload = {
        name:          contact.name,
        email:         contact.email,
        subject:       `Konfigurator: ${summary.einbausituation} – ${summary.rahmentyp}`,
        message:       [
          'Konfiguration:',
          ...rows.map(([k, v]) => `  ${k}: ${v}`),
          '',
          `Telefon: ${contact.telefon || '—'}`,
          `Nachricht: ${contact.nachricht || '—'}`,
        ].join('\n'),
        privacyConsent: true,
      };
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok) { setSent(true); onSubmit(); }
      else { setError('Fehler beim Senden. Bitte versuchen Sie es erneut.'); }
    } catch {
      setError('Verbindungsfehler. Bitte prüfen Sie Ihre Verbindung.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="wizard-step success-state">
        <div className="success-circle">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7L26 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="success-title">Anfrage gesendet!</h2>
        <p className="success-sub">Wir melden uns so schnell wie möglich mit einem persönlichen Angebot.</p>
        <div className="success-actions">
          <button className="btn-outline-sm" onClick={printConfig}>Drucken</button>
          <button className="btn-primary-sm" onClick={onReset}>Neu konfigurieren</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-eyebrow">Zusammenfassung</div>
        <h2>Ihre Konfiguration.</h2>
        <p>Alles auf einen Blick – und dann direkt Angebot anfragen.</p>
      </div>

      {/* Config overview card */}
      {validation.valid && summary.einbausituation && (
        <div className="summary-overview">
          <div className="summary-overview-icon">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="summary-overview-title">{summary.einbausituation}</div>
            <div className="summary-overview-chips">
              {summary.rahmentyp && <span className="summary-chip">{summary.rahmentyp}</span>}
              {summary.tuersystem && summary.tuersystem !== '—' && <span className="summary-chip">{summary.tuersystem}</span>}
              {summary.profilfarbe && <span className="summary-chip">{summary.profilfarbe}</span>}
            </div>
          </div>
        </div>
      )}

      {!validation.valid && (
        <div className="corrections-list">
          {validation.errors.map((err, i) => (
            <div key={i} className="correction-item correction-item--error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6" stroke="#C62828" strokeWidth="1.2"/>
                <path d="M5 5l4 4M9 5l-4 4" stroke="#C62828" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer generierte Modelle */}
      <div className="notice-box notice-box--info" style={{ marginBottom: 12 }}>
        <div className="notice-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#1F2E4A" strokeWidth="1.4"/>
            <path d="M9 8v5" stroke="#1F2E4A" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="9" cy="5.5" r="0.8" fill="#1F2E4A"/>
          </svg>
        </div>
        <div>
          <div className="notice-title">Hinweis zum 3D-Modell</div>
          <div className="notice-desc">Die Darstellung ist ein generiertes Modell. Scharniere, Profile und Farben können vom echten Produkt abweichen. Bei einem Fixteil (festes Glasteil zwischen Tür und Wand) ist stets eine Stabilisationsstange erforderlich.</div>
        </div>
      </div>

      {/* Summary Tabelle */}
      <div className="summary-card">
        {rows.map(([label, value]) => value && value !== '—' && (
          <div key={label} className="summary-row">
            <span className="summary-row-label">{label}</span>
            <span className="summary-row-value">{value}</span>
          </div>
        ))}
      </div>

      {/* Aktionen */}
      <div className="summary-action-row">
        <button className="summary-print-btn" onClick={printConfig}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5V2h8v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <rect x="1" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M3 8h8M3 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Drucken
        </button>
      </div>

      {/* Kontaktformular */}
      <form className="summary-form" onSubmit={handleSubmit}>
        <div className="summary-form-section-header">
          <span className="summary-form-section-title">Angebot anfragen</span>
          <span className="summary-form-divider" />
        </div>

        {error && (
          <div className="correction-item correction-item--error">
            <span>{error}</span>
          </div>
        )}

        <div className="form-row-2col">
          <div className="form-field">
            <label className="form-label">Name <span style={{ color: '#C62828' }}>*</span></label>
            <input
              className="form-input"
              placeholder="Vor- und Nachname"
              value={contact.name}
              onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Telefon</label>
            <input
              className="form-input"
              type="tel"
              placeholder="Optional"
              value={contact.telefon}
              onChange={e => setContact(p => ({ ...p, telefon: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">E-Mail <span style={{ color: '#C62828' }}>*</span></label>
          <input
            className="form-input"
            type="email"
            placeholder="ihre@email.de"
            value={contact.email}
            onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">Anmerkungen</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Besonderheiten, Fragen, Terminwunsch …"
            rows={3}
            value={contact.nachricht}
            onChange={e => setContact(p => ({ ...p, nachricht: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          className={`submit-btn${sending || !validation.valid || !contact.name || !contact.email ? ' disabled' : ''}`}
          disabled={sending || !validation.valid || !contact.name || !contact.email}
        >
          {sending ? (
            <>
              <div className="submit-spinner" />
              Wird gesendet…
            </>
          ) : (
            <>
              Angebot anfragen
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>

        <p className="privacy-note">
          Mit dem Absenden stimmen Sie unserer{' '}
          <a href="/datenschutz" className="privacy-link">Datenschutzerklärung</a> zu.
        </p>
      </form>
    </div>
  );
}
