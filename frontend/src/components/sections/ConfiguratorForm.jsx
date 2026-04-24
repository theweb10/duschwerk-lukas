import { useState } from 'react'
import { submitContact } from '../../utils/api'

function buildMessage(config) {
  const extras = config.extras && config.extras.length > 0
    ? config.extras.join(', ')
    : 'Keine'

  return `Meine Konfiguration:
• Typ: ${config.typ || '—'}
• Glas: ${config.glas || '—'}, ${config.staerke || '—'}
• Profil: ${config.profil || '—'}
• Maße: ${config.breite || '—'} × ${config.hoehe || '—'} cm
• Extras: ${extras}

Bitte kontaktieren Sie mich für ein kostenloses Aufmaß.`
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!form.email.trim()) {
    errors.email = 'Bitte geben Sie Ihre E-Mail-Adresse an.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  }
  if (!form.message.trim()) errors.message = 'Bitte geben Sie eine Nachricht ein.'
  if (!form.privacyConsent) errors.privacyConsent = 'Bitte stimmen Sie der Datenschutzerklärung zu.'
  return errors
}

function Field({ label, id, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        {label}{required && <span className="text-gray-300 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default function ConfiguratorForm({ config }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: buildMessage(config),
    privacyConsent: false,
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstKey = Object.keys(validationErrors)[0]
      document.getElementById(firstKey)?.focus()
      return
    }
    setStatus('loading')
    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: `Konfigurator-Anfrage: ${config.typ || 'Dusche'}`,
        message: form.message.trim(),
        phone: form.phone.trim(),
        privacyConsent: form.privacyConsent,
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-14 text-center">
        <div
          className="w-14 h-14 flex items-center justify-center mx-auto mb-5"
          style={{ background: '#F5F5F5', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-headline text-xl text-primary mb-2" style={{ letterSpacing: '-0.02em' }}>
          Vielen Dank.
        </h3>
        <p className="text-gray-400 text-sm font-light">
          Ihre Anfrage ist eingegangen.<br />Wir melden uns so schnell wie möglich bei Ihnen.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === 'error' && (
        <div
          className="px-4 py-3 text-xs text-red-500 flex items-start gap-2"
          style={{ background: '#fff5f5', borderRadius: '8px', border: '1px solid #fecaca' }}
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an info@duschwerk-bayern.de
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" id="name" required error={errors.name}>
          <input
            id="name" name="name" type="text" autoComplete="name"
            value={form.name} onChange={handleChange}
            className={`input-apple ${errors.name ? 'input-apple-error' : ''}`}
            placeholder="Max Mustermann"
          />
        </Field>
        <Field label="E-Mail" id="email" required error={errors.email}>
          <input
            id="email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={handleChange}
            className={`input-apple ${errors.email ? 'input-apple-error' : ''}`}
            placeholder="max@beispiel.de"
          />
        </Field>
      </div>

      <Field label="Telefon" id="phone" error={errors.phone}>
        <input
          id="phone" name="phone" type="tel" autoComplete="tel"
          value={form.phone} onChange={handleChange}
          className="input-apple"
          placeholder="+49 941 123456 (optional)"
        />
      </Field>

      <Field label="Ihre Konfiguration" id="message" required error={errors.message}>
        <textarea
          id="message" name="message" rows={8}
          value={form.message} onChange={handleChange}
          className={`input-apple resize-none font-mono text-xs ${errors.message ? 'input-apple-error' : ''}`}
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            id="privacyConsent" name="privacyConsent" type="checkbox"
            checked={form.privacyConsent} onChange={handleChange}
            className="mt-0.5 w-4 h-4 border-gray-300 text-primary focus:ring-0 flex-shrink-0"
            style={{ borderRadius: '4px' }}
          />
          <span className="text-xs text-gray-400 leading-relaxed font-light">
            Ich stimme der{' '}
            <a href="/datenschutz" target="_blank" rel="noopener noreferrer"
               className="text-primary underline transition-colors" style={{ textUnderlineOffset: '2px' }}>
              Datenschutzerklärung
            </a>{' '}
            zu. <span className="text-gray-300">*</span>
          </span>
        </label>
        {errors.privacyConsent && (
          <p className="mt-1.5 text-xs text-red-400 ml-7" role="alert">{errors.privacyConsent}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Wird gesendet...
          </span>
        ) : 'Anfrage absenden'}
      </button>

      <p className="text-xs text-gray-300 text-center font-light">
        * Pflichtfelder · Nur nach Terminabsprache
      </p>
    </form>
  )
}
