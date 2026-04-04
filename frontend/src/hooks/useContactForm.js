import { useState } from 'react'
import { submitContact } from '../utils/api'

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  privacyConsent: false,
}

function validate(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Bitte geben Sie Ihren Namen an.'
  }

  if (!form.email.trim()) {
    errors.email = 'Bitte geben Sie Ihre E-Mail-Adresse an.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  }

  if (!form.subject.trim()) {
    errors.subject = 'Bitte geben Sie einen Betreff an.'
  }

  if (!form.message.trim()) {
    errors.message = 'Bitte geben Sie eine Nachricht ein.'
  } else if (form.message.trim().length < 10) {
    errors.message = 'Bitte beschreiben Sie Ihr Anliegen etwas ausführlicher (min. 10 Zeichen).'
  }

  if (!form.privacyConsent) {
    errors.privacyConsent = 'Bitte stimmen Sie der Datenschutzerklärung zu.'
  }

  return errors
}

export function useContactForm() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstErrorKey = Object.keys(validationErrors)[0]
      document.getElementById(firstErrorKey)?.focus()
      return
    }

    setStatus('loading')
    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        privacyConsent: form.privacyConsent,
      })
      setStatus('success')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  return { form, errors, status, handleChange, handleSubmit }
}
