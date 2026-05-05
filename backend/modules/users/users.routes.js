const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const db = require('../../db');

const router = Router();

/**
 * GET /users — list all users (for Team page & assignee dropdowns)
 */
router.get('/', authenticate, (req, res) => {
  const users = db.prepare(
    `SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at ASC`
  ).all();
  res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.display_name,
    role: u.role.toLowerCase(),
    created_at: u.created_at,
  })));
});

/**
 * GET /users/me/tasks — all tasks assigned to the current user
 */
router.get('/me/tasks', authenticate, (req, res) => {
  const tasks = db.prepare(
    `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
            t.project_id, p.name AS project_name, t.created_at, t.updated_at,
            t.assignee_id
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.assignee_id = ?
     ORDER BY t.created_at DESC`
  ).all(req.user.id);

  res.json(tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority ? t.priority.toLowerCase() : 'medium',
    due_date: t.due_date,
    project_id: t.project_id,
    project_name: t.project_name,
    assignee_id: t.assignee_id,
    created_at: t.created_at,
    updated_at: t.updated_at,
  })));
});

/**
 * PATCH /users/:id/role — change a user's global role (Admin only)
 */
router.patch('/:id/role', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  const { role } = req.query;
  if (!['admin', 'member'].includes(role?.toLowerCase())) {
    return res.status(400).json({ error: 'role must be admin or member' });
  }
  const normalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(normalized, req.params.id);
  const u = db.prepare('SELECT id, email, display_name, role, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({ id: u.id, email: u.email, name: u.display_name, role: u.role.toLowerCase(), created_at: u.created_at });
});

module.exports = router;
