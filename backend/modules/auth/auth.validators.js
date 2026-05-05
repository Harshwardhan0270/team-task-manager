const { body } = require('express-validator');

/**
 * Validation chain for POST /register
 * Requirements: 1.3, 9.1
 */
const registerValidators = [
  body('email')
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('email must be a valid email address')
    .isLength({ max: 255 }).withMessage('email must be at most 255 characters'),

  body('displayName')
    .notEmpty().withMessage('displayName is required')
    .isString().withMessage('displayName must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('displayName must be between 1 and 255 characters'),

  body('password')
    .notEmpty().withMessage('password is required')
    .isLength({ min: 8 }).withMessage('password must be at least 8 characters')
    .isLength({ max: 255 }).withMessage('password must be at most 255 characters'),

  body('role')
    .optional()
    .isIn(['Admin', 'Member']).withMessage('role must be either Admin or Member'),
];

/**
 * Validation chain for POST /login
 * Requirements: 1.3
 */
const loginValidators = [
  body('email')
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('email must be a valid email address'),

  body('password')
    .notEmpty().withMessage('password is required'),
];

module.exports = { registerValidators, loginValidators };
