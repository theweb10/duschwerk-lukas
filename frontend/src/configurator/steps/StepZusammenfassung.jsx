import React, { useState, useCallback } from 'react';

export default function StepZusammenfassung({ summary, validation, onSubmit, onReset }) {
  const [contact, setContact] = useState({ name: '', email: '', telefon: '', nachricht: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const rows = [
    ['Serie',          summary.serie],
    ['Einbausituation',summary.einbausituation],
    ['Türsystem',      summary.tuersystem],
    ['Breite',         summary.breite],
    ['Höhe',           summary.hoehe],
    ['Glastyp',        summary.glastyp],
    ['Glasstärke',     summary.glasstaerke],
    ['Profilfarbe',    summary.profilfarbe],
    ['Beschichtung',   summary.beschichtung],
  ];

  const configText = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const copyConfig = useCallback(() => {
    const text = `DUSCHWERK BAYERN — Konfiguration\n${'─'.repeat(36)}\n${configText}\n${'─'.repeat(36)}\n\nhttps://duschwerk-bayern.de/konfigurator`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [configText]);

  const printConfig = useCallback(() => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Konfiguration – Duschwerk Bayern</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 420px; margin: 40px auto; color: #222; }
        h1 { font-size: 20px; color: #1F2E4A; margin-bottom: 4px; }
        .sub { font-size: 12px; color: #888; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        td:first-child { color: #888; width: 45%; }
        td:last-child { font-weight: 600; color: #1F2E4A; }
        .footer { margin-top: 32px; font-size: 11px; color: #bbb; }
      </style></head><body>
      <h1>DUSCHWERK BAYERN</h1>
      <div class="sub">Konfiguration — ${new Date().toLocaleDateString('de-DE')}</div>
      <table>${rows.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      <div class="footer">duschwerk-bayern.de · Regensburg</div>
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
        name: contact.name,
        email: contact.email,
        subject: `Konfigurator: ${summary.serie} – ${summary.einbausituation}`,
        message: [
          'Konfiguration:',
          ...rows.map(([k, v]) => `  ${k}: ${v}`),
          '',
          `Telefon: ${contact.telefon || '—'}`,
          `Nachricht: ${contact.nachricht || '—'}`,
        ].join('\n'),
        privacyConsent: true,
      };
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSent(true);
        onSubmit();
      } else {
        setError('Fehler beim Senden. Bitte versuchen Sie es erneut.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte prüfen Sie Ihre Verbindung.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="wizard-step step-success">
        <div className="success-icon">✓</div>
        <h2>Anfrage gesendet</h2>
        <p>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn-outline" onClick={onReset}>Neu konfigurieren</button>
          <button className="btn-primary" onClick={printConfig}>Drucken</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Zusammenfassung</h2>
        <p>Ihre Konfiguration auf einen Blick.</p>
      </div>

      {!validation.valid && (
        <div className="wizard-corrections">
          {validation.errors.map((err, i) => (
            <div key={i} className="correction-hint correction-error">
              <span className="correction-icon">!</span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Konfigurations-Tabelle */}
      <div className="summary-table">
        {rows.map(([label, value]) => (
          <div key={label} className="summary-row">
            <span className="summary-label">{label}</span>
            <span className="summary-value">{value}</span>
          </div>
        ))}
      </div>

      {/* Export-Aktionen */}
      <div className="summary-actions">
        <button className="summary-action-btn" onClick={copyConfig}>
          <span className="action-icon">{copied ? '✓' : '⎘'}</span>
          {copied ? 'Kopiert' : 'Kopieren'}
        </button>
        <button className="summary-action-btn" onClick={printConfig}>
          <span className="action-icon">⎙</span>
          Drucken
        </button>
      </div>

      {/* Kontaktformular */}
      <form className="summary-contact" onSubmit={handleSubmit}>
        <h3>Angebot anfragen</h3>

        {error && (
          <div className="correction-hint correction-error">
            <span className="correction-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        <input
          className="input-apple"
          placeholder="Name *"
          value={contact.name}
          onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
          required
        />
        <input
          className="input-apple"
          type="email"
          placeholder="E-Mail *"
          value={contact.email}
          onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
          required
        />
        <input
          className="input-apple"
          type="tel"
          placeholder="Telefon (optional)"
          value={contact.telefon}
          onChange={e => setContact(p => ({ ...p, telefon: e.target.value }))}
        />
        <textarea
          className="input-apple"
          placeholder="Anmerkungen (optional)"
          rows={3}
          value={contact.nachricht}
          onChange={e => setContact(p => ({ ...p, nachricht: e.target.value }))}
        />
        <button
          type="submit"
          className="btn-primary wizard-cta"
          disabled={sending || !validation.valid || !contact.name || !contact.email}
        >
          {sending ? 'Wird gesendet…' : 'Angebot anfragen →'}
        </button>
        <p className="privacy-note">
          Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
        </p>
      </form>
    </div>
  );
}
