const { body } = require('express-validator');

/**
 * Validation chain for POST /projects/:id/tasks
 * Requirements: 5.1, 5.2, 5.3, 5.4, 9.1
 */
const createTaskValidators = [
  body('title')
    .notEmpty().withMessage('title is required')
    .isString().withMessage('title must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('title must be between 1 and 255 characters'),

  body('assigneeId')
    .notEmpty().withMessage('assigneeId is required')
    .isInt().withMessage('assigneeId must be an integer'),

  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done'])
    .withMessage('status must be one of: Todo, In Progress, Done'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('priority must be one of: Low, Medium, High'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .isLength({ max: 2000 }).withMessage('description must be at most 2000 characters'),
];

/**
 * Validation chain for PATCH /projects/:id/tasks/:taskId
 * Requirements: 6.1, 6.2, 6.3
 */
const updateTaskValidators = [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['Todo', 'In Progress', 'Done'])
    .withMessage('status must be one of: Todo, In Progress, Done'),
];

module.exports = { createTaskValidators, updateTaskValidators };
