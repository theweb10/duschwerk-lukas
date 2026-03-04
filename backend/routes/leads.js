const express = require('express')
const { body } = require('express-validator')
const db = require('../models/db')
const { handleValidationErrors } = require('../middleware/validate')
const { contactLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

const leadValidation = [
  body('email').trim().isEmail().withMessage('Ungültige E-Mail-Adresse.').normalizeEmail(),
  body('name').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('source').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
]

// POST /api/leads
router.post('/', contactLimiter, leadValidation, handleValidationErrors, (req, res) => {
  const { email, name, source } = req.body

  try {
    const insert = db.prepare(`
      INSERT INTO leads (email, name, source)
      VALUES (@email, @name, @source)
      ON CONFLICT(email) DO NOTHING
    `)
    insert.run({ email, name: name || null, source: source || 'website' })

    return res.status(201).json({
      success: true,
      message: 'Erfolgreich registriert.',
    })
  } catch (err) {
    console.error('[Leads] Error:', err)
    return res.status(500).json({ success: false, message: 'Interner Serverfehler.' })
  }
})

module.exports = router
