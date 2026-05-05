const db = require('../db');

/**
 * requireRole(role) — factory that returns an Express middleware.
 * Must be used AFTER the authenticate middleware (requires req.user).
 *
 * Reads the project ID from req.params.projectId or req.params.id,
 * queries team_members for the requesting user's role, and:
 *   - Returns 403 { error: 'Not a project member' } if no membership found
 *   - Returns 403 { error: 'Admin role required' } if role === 'Admin' and user is not Admin
 *   - Attaches req.projectRole and calls next() on success
 */
function requireRole(role) {
  return function (req, res, next) {
    const projectId = req.params.projectId || req.params.id;

    const membership = db
      .prepare('SELECT role FROM team_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, req.user.id);

    if (!membership) {
      return res.status(403).json({ error: 'Not a project member' });
    }

    if (role === 'Admin' && membership.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin role required' });
    }

    req.projectRole = membership.role;
    next();
  };
}

module.exports = { requireRole };
