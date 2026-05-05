const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { handleValidationErrors } = require('../../middleware/validate');
const { createTaskValidators, updateTaskValidators } = require('./tasks.validators');
const { createTask, getTasks, updateTaskStatus } = require('./tasks.service');
const db = require('../../db');

const router = Router();

/**
 * GET /projects/:id/tasks/:taskId — get a single task
 */
router.get('/:id/tasks/:taskId', authenticate, requireRole('Member'), async (req, res, next) => {
  const projectId = Number(req.params.id);
  const taskId = Number(req.params.taskId);
  try {
    const task = db.prepare(
      `SELECT t.id, t.title, t.description, t.status, t.assignee_id,
              t.priority, t.due_date, t.project_id, t.created_at, t.updated_at,
              u.display_name AS assignee_name
       FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = ? AND t.project_id = ?`
    ).get(taskId, projectId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({
      id: task.id, title: task.title, description: task.description,
      status: task.status, assignee_id: task.assignee_id,
      assignee_name: task.assignee_name,
      priority: task.priority ? task.priority.toLowerCase() : null,
      due_date: task.due_date, project_id: task.project_id,
      created_at: task.created_at, updated_at: task.updated_at,
    });
  } catch (err) { next(err); }
});

/**
 * GET /projects/:id/tasks
 * Returns all tasks for a project, with optional status and assignee filters.
 * Any project member can view tasks.
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
router.get('/:id/tasks', authenticate, requireRole('Member'), async (req, res, next) => {
  const projectId = Number(req.params.id);
  const { status, assignee } = req.query;

  try {
    const conditions = ['t.project_id = ?'];
    const params = [projectId];
    if (status) { conditions.push('t.status = ?'); params.push(status); }
    if (assignee) { conditions.push('t.assignee_id = ?'); params.push(Number(assignee)); }

    const rows = db.prepare(
      `SELECT t.id, t.title, t.description, t.status, t.assignee_id,
              u.display_name AS assignee_name,
              t.priority, t.due_date, t.project_id, t.created_at, t.updated_at
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.created_at ASC`
    ).all(...params);

    return res.status(200).json(rows.map(t => ({
      id: t.id, title: t.title, description: t.description,
      status: t.status, assignee_id: t.assignee_id,
      assigneeDisplayName: t.assignee_name,
      priority: t.priority ? t.priority.toLowerCase() : null,
      due_date: t.due_date, project_id: t.project_id,
      created_at: t.created_at, updated_at: t.updated_at,
    })));
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
});

/**
 * POST /projects/:id/tasks
 * Creates a new task in a project. Admin only.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
router.post(
  '/:id/tasks',
  authenticate,
  requireRole('Admin'),
  createTaskValidators,
  handleValidationErrors,
  async (req, res, next) => {
    const projectId = Number(req.params.id);
    const { title, assigneeId, status, priority, dueDate, description } = req.body;

    try {
      const task = await createTask(projectId, {
        title,
        assigneeId: Number(assigneeId),
        status,
        priority,
        dueDate,
        description,
      });
      return res.status(201).json(task);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * PATCH /projects/:id/tasks/:taskId
 * Updates the status of a task.
 * Members can only update their own tasks; Admins can update any task.
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
router.patch(
  '/:id/tasks/:taskId',
  authenticate,
  requireRole('Member'),
  updateTaskValidators,
  handleValidationErrors,
  async (req, res, next) => {
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const { status } = req.body;

    try {
      const task = await updateTaskStatus(projectId, taskId, status, {
        id: req.user.id,
        projectRole: req.projectRole,
      });
      return res.status(200).json(task);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

module.exports = router;

/**
 * PUT /projects/:id/tasks/:taskId — full task update (Admin or assignee)
 */
router.put('/:id/tasks/:taskId', authenticate, requireRole('Member'), async (req, res, next) => {
  const projectId = Number(req.params.id);
  const taskId = Number(req.params.taskId);
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(taskId, projectId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.projectRole !== 'Admin' && task.assignee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const validStatuses = ['Todo', 'In Progress', 'Done'];
    const validPriorities = ['Low', 'Medium', 'High', null, undefined, ''];
    if (status && !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    if (priority && !['Low','Medium','High'].includes(priority)) return res.status(400).json({ error: 'Invalid priority' });
    db.prepare(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = ?,
        due_date = ?,
        assignee_id = COALESCE(?, assignee_id),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      title || null, description !== undefined ? description : null,
      status || null,
      priority || task.priority,
      dueDate !== undefined ? dueDate : task.due_date,
      assigneeId ? Number(assigneeId) : null,
      taskId
    );
    const updated = db.prepare(
      `SELECT t.*, u.display_name AS assignee_name FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id WHERE t.id = ?`
    ).get(taskId);
    res.json({
      id: updated.id, title: updated.title, description: updated.description,
      status: updated.status, assignee_id: updated.assignee_id,
      assignee_name: updated.assignee_name,
      priority: updated.priority ? updated.priority.toLowerCase() : null,
      due_date: updated.due_date, project_id: updated.project_id,
      created_at: updated.created_at, updated_at: updated.updated_at,
    });
  } catch (err) { next(err); }
});

/**
 * DELETE /projects/:id/tasks/:taskId — delete a task (Admin only)
 */
router.delete('/:id/tasks/:taskId', authenticate, requireRole('Admin'), async (req, res, next) => {
  const projectId = Number(req.params.id);
  const taskId = Number(req.params.taskId);
  try {
    const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND project_id = ?').get(taskId, projectId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
