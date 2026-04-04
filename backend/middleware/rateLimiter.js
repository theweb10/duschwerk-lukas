const rateLimit = require('express-rate-limit')

/**
 * Strict limiter for contact/lead submission endpoints.
 * Max 5 requests per 15 minutes per IP.
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte versuchen Sie es in 15 Minuten erneut.',
  },
})

/**
 * General API limiter – 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
  },
})

module.exports = { contactLimiter, generalLimiter }
