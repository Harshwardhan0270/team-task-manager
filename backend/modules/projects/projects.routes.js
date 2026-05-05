const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { handleValidationErrors } = require('../../middleware/validate');
const { projectValidators } = require('./projects.validators');
const {
  createProject,
  getProjectsForUser,
  updateProject,
  deleteProject,
} = require('./projects.service');

const router = Router();

/**
 * GET /projects
 * Returns all projects the authenticated user belongs to.
 * Requirements: 3.4
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const projects = await getProjectsForUser(req.user.id);
    return res.status(200).json(projects);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * POST /projects
 * Creates a new project; the authenticated user becomes the Admin.
 * Requirements: 3.1, 3.5, 9.1
 */
router.post(
  '/',
  authenticate,
  projectValidators,
  handleValidationErrors,
  async (req, res, next) => {
    const { name, description } = req.body;
    try {
      const project = await createProject(req.user.id, name, description);
      return res.status(201).json(project);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * PUT /projects/:id
 * Updates a project's name and/or description. Admin only.
 * Requirements: 3.2, 3.6, 9.1
 */
router.put(
  '/:id',
  authenticate,
  requireRole('Admin'),
  projectValidators,
  handleValidationErrors,
  async (req, res, next) => {
    const projectId = Number(req.params.id);
    const { name, description } = req.body;
    try {
      const project = await updateProject(projectId, name, description);
      return res.status(200).json(project);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * DELETE /projects/:id
 * Deletes a project and all associated tasks/memberships. Admin only.
 * Requirements: 3.3, 3.6
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('Admin'),
  async (req, res, next) => {
    const projectId = Number(req.params.id);
    try {
      await deleteProject(projectId);
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
