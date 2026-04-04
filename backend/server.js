require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { generalLimiter } = require('./middleware/rateLimiter')

const app = express()
const PORT = process.env.PORT || 3001

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman) in development
    if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS policy: origin ${origin} not allowed`))
  },
  credentials: true,
}))

// --- Body parsing ---
app.use(express.json({ limit: '50kb' }))
app.use(express.urlencoded({ extended: true, limit: '50kb' }))

// --- General rate limiting ---
app.use('/api', generalLimiter)

// --- Routes ---
app.use('/api/contact', require('./routes/contact'))
app.use('/api/leads', require('./routes/leads'))
app.use('/api/configurations', require('./routes/configurations'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// --- 404 for unknown API routes ---
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// --- Global error handler ---
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Interner Serverfehler.' })
})

app.listen(PORT, () => {
  console.log(`\n✓ Duschwerk Bayern Backend läuft auf http://localhost:${PORT}`)
  console.log(`  Health: http://localhost:${PORT}/api/health`)
  console.log(`  Env: ${process.env.NODE_ENV || 'development'}\n`)
})

module.exports = app
