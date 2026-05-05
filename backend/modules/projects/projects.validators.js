const { body } = require('express-validator');

/**
 * Validation chain for POST /projects and PUT /projects/:id
 * Requirements: 3.1, 3.2, 9.1
 */
const projectValidators = [
  body('name')
    .notEmpty().withMessage('name is required')
    .isString().withMessage('name must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .isLength({ max: 2000 }).withMessage('description must be at most 2000 characters'),
];

module.exports = { projectValidators };
