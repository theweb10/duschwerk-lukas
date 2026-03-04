const express = require('express')
const { body } = require('express-validator')
const nodemailer = require('nodemailer')
const db = require('../models/db')
const { handleValidationErrors } = require('../middleware/validate')
const { contactLimiter } = require('../middleware/rateLimiter')
const { pushToCRM } = require('../services/crm')

const router = express.Router()

// --- Validation ---
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name ist erforderlich.').isLength({ max: 200 }),
  body('email').trim().isEmail().withMessage('Ungültige E-Mail-Adresse.').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Betreff ist erforderlich.').isLength({ max: 300 }),
  body('message').trim().notEmpty().withMessage('Nachricht ist erforderlich.').isLength({ min: 10, max: 5000 }),
  body('privacyConsent').equals('true').withMessage('Datenschutz-Zustimmung erforderlich.').toBoolean(),
]

// --- Nodemailer ---
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

async function sendNotificationEmail(inquiry) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] Credentials not configured, skipping.')
    return
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    subject: `Neue Anfrage: ${inquiry.subject} – ${inquiry.name}`,
    html: `
      <h2 style="color:#222222;font-family:-apple-system,Helvetica,sans-serif;font-weight:600">
        Neue Anfrage – Duschwerk Bayern
      </h2>
      <table style="border-collapse:collapse;width:100%;font-family:-apple-system,Helvetica,sans-serif;font-size:14px;margin-top:16px">
        <tr><td style="padding:10px 12px;border:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.05em;background:#fafafa">Name</td><td style="padding:10px 12px;border:1px solid #eee">${inquiry.name}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.05em;background:#fafafa">E-Mail</td><td style="padding:10px 12px;border:1px solid #eee"><a href="mailto:${inquiry.email}" style="color:#222">${inquiry.email}</a></td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.05em;background:#fafafa">Betreff</td><td style="padding:10px 12px;border:1px solid #eee">${inquiry.subject}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.05em;background:#fafafa">Nachricht</td><td style="padding:10px 12px;border:1px solid #eee">${inquiry.message.replace(/\n/g, '<br>')}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.05em;background:#fafafa">Datum</td><td style="padding:10px 12px;border:1px solid #eee">${new Date().toLocaleString('de-DE')}</td></tr>
      </table>
    `,
  })
}

// POST /api/contact
router.post('/', contactLimiter, contactValidation, handleValidationErrors, async (req, res) => {
  const { name, email, subject, message } = req.body

  try {
    const insert = db.prepare(`
      INSERT INTO inquiries (name, email, subject, message)
      VALUES (@name, @email, @subject, @message)
    `)
    const result = insert.run({ name, email, subject, message })

    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(result.lastInsertRowid)

    sendNotificationEmail(inquiry).catch((err) => {
      console.error('[Email] Failed:', err.message)
    })

    pushToCRM(inquiry).then((synced) => {
      if (synced) {
        db.prepare('UPDATE inquiries SET crm_synced = 1 WHERE id = ?').run(inquiry.id)
      }
    }).catch((err) => {
      console.error('[CRM] Push error:', err.message)
    })

    return res.status(201).json({
      success: true,
      message: 'Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden.',
    })
  } catch (err) {
    console.error('[Contact] Error:', err)
    return res.status(500).json({ success: false, message: 'Interner Serverfehler.' })
  }
})

module.exports = router
