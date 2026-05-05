const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { handleValidationErrors } = require('../../middleware/validate');
const { addMemberValidators } = require('./teams.validators');
const { getMembers, addMember, removeMember } = require('./teams.service');

const router = Router();

/**
 * GET /projects/:id/members
 * Returns all members of a project. Any project member can view.
 * Requirements: 4.1, 4.5
 */
router.get('/:id/members', authenticate, requireRole('Member'), async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const members = getMembers(projectId);
    return res.status(200).json(members);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * POST /projects/:id/members
 * Adds a user to the project as a Member. Admin only.
 * Requirements: 4.1, 4.3, 4.4, 4.5
 */
router.post(
  '/:id/members',
  authenticate,
  requireRole('Admin'),
  addMemberValidators,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const projectId = Number(req.params.id);
      const userId = Number(req.body.userId);
      const members = addMember(projectId, userId);
      return res.status(200).json(members);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * DELETE /projects/:id/members/:userId
 * Removes a user from the project. Admin only.
 * Requirements: 4.2, 4.5
 */
router.delete(
  '/:id/members/:userId',
  authenticate,
  requireRole('Admin'),
  async (req, res, next) => {
    try {
      const projectId = Number(req.params.id);
      const userId = Number(req.params.userId);
      removeMember(projectId, userId);
      return res.status(204).send();
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

module.exports = router;
