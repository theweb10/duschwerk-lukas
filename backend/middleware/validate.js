const { validationResult } = require('express-validator')

/**
 * Runs after express-validator chains.
 * Returns 422 with structured errors if validation fails.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    })
  }
  next()
}

module.exports = { handleValidationErrors }
