const { validationResult } = require('express-validator');

/**
 * handleValidationErrors middleware
 * Reads express-validator results from the request.
 * If there are errors, returns 400 with:
 *   { error: 'Validation failed', details: ['message 1', 'message 2'] }
 * Otherwise calls next().
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => e.msg);
    return res.status(400).json({ error: 'Validation failed', details });
  }

  next();
}

module.exports = { handleValidationErrors };
