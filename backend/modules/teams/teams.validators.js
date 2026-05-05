const { body } = require('express-validator');

/**
 * Validation chain for POST /projects/:id/members
 * Requirements: 4.1, 4.3, 4.4
 */
const addMemberValidators = [
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isInt().withMessage('userId must be an integer'),
];

module.exports = { addMemberValidators };
