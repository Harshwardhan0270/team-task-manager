const db = require('../../db');

/**
 * Create a new task in a project.
 * Requirements: 5.1, 5.2
 *
 * @param {number} projectId
 * @param {{ title: string, assigneeId: number, status?: string, priority?: string, dueDate?: string, description?: string }} data
 * @returns {{ id: number, title: string, status: string, assigneeId: number, priority: string|null, dueDate: string|null, description: string|null, createdAt: string }}
 * @throws {{ statusCode: 400, message: string }} if assigneeId is not a member of the project
 */
async function createTask(projectId, { title, assigneeId, status, priority, dueDate, description }) {
  // 1. Verify assigneeId is a member of the project
  const membership = db
    .prepare('SELECT id FROM team_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, assigneeId);

  if (!membership) {
    const err = new Error('Assignee is not a member of this project');
    err.statusCode = 400;
    throw err;
  }

  // 2. INSERT into tasks table
  const result = db
    .prepare(
      `INSERT INTO tasks (project_id, assignee_id, title, description, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      projectId,
      assigneeId,
      title,
      description ?? null,
      status || 'Todo',
      priority ?? null,
      dueDate ?? null
    );

  const taskId = result.lastInsertRowid;

  // 3. Return the created task
  const task = db
    .prepare(
      `SELECT id, title, status, assignee_id, priority, due_date, description, created_at
       FROM tasks WHERE id = ?`
    )
    .get(taskId);

  return {
    id: task.id,
    title: task.title,
    status: task.status,
    assigneeId: task.assignee_id,
    priority: task.priority,
    dueDate: task.due_date,
    description: task.description,
    createdAt: task.created_at,
  };
}

/**
 * Return tasks for a project, optionally filtered by status and/or assignee.
 * Requirements: 7.1, 7.2, 7.3
 *
 * @param {number} projectId
 * @param {{ status?: string, assignee?: string|number }} filters
 * @returns {Array<{ id: number, title: string, status: string, assigneeDisplayName: string, dueDate: string|null, priority: string|null }>}
 */
async function getTasks(projectId, filters) {
  const conditions = ['t.project_id = ?'];
  const params = [projectId];

  if (filters.status) {
    conditions.push('t.status = ?');
    params.push(filters.status);
  }

  if (filters.assignee) {
    conditions.push('t.assignee_id = ?');
    params.push(Number(filters.assignee));
  }

  const whereClause = conditions.join(' AND ');

  const rows = db
    .prepare(
      `SELECT t.id, t.title, t.status, u.display_name AS assigneeDisplayName, t.due_date, t.priority
       FROM tasks t
       JOIN users u ON u.id = t.assignee_id
       WHERE ${whereClause}
       ORDER BY t.created_at ASC`
    )
    .all(...params);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    assigneeDisplayName: row.assigneeDisplayName,
    dueDate: row.due_date,
    priority: row.priority,
  }));
}

/**
 * Update the status of a task.
 * Requirements: 6.1, 6.2, 6.3, 6.4
 *
 * @param {number} projectId
 * @param {number} taskId
 * @param {string} status
 * @param {{ id: number, projectRole: string }} requestingUser
 * @returns {{ id: number, title: string, status: string, assigneeId: number, priority: string|null, dueDate: string|null, description: string|null, updatedAt: string }}
 * @throws {{ statusCode: 404, message: string }} if task not found in project
 * @throws {{ statusCode: 403, message: string }} if non-Admin tries to update another user's task
 */
async function updateTaskStatus(projectId, taskId, status, requestingUser) {
  // 1. Verify task exists in the project
  const task = db
    .prepare(
      `SELECT id, title, status, assignee_id, priority, due_date, description, updated_at
       FROM tasks WHERE id = ? AND project_id = ?`
    )
    .get(taskId, projectId);

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. If not Admin, verify the requesting user is the assignee
  if (requestingUser.projectRole !== 'Admin') {
    if (task.assignee_id !== requestingUser.id) {
      const err = new Error('You can only update your own tasks');
      err.statusCode = 403;
      throw err;
    }
  }

  // 3. UPDATE the task status
  db.prepare(
    `UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, taskId);

  // 4. Return the updated task
  const updated = db
    .prepare(
      `SELECT id, title, status, assignee_id, priority, due_date, description, updated_at
       FROM tasks WHERE id = ?`
    )
    .get(taskId);

  return {
    id: updated.id,
    title: updated.title,
    status: updated.status,
    assigneeId: updated.assignee_id,
    priority: updated.priority,
    dueDate: updated.due_date,
    description: updated.description,
    updatedAt: updated.updated_at,
  };
}

module.exports = { createTask, getTasks, updateTaskStatus };
