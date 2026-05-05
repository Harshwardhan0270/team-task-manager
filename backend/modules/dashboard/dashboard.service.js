const db = require('../../db');

/**
 * Aggregate dashboard data for the given user.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 *
 * @param {number} userId
 * @returns {{
 *   tasksByStatus: { Todo: number, 'In Progress': number, Done: number },
 *   overdueTasks: Array<{ id: number, title: string, dueDate: string, projectName: string }>,
 *   projects: Array<{ id: number, name: string, incompleteTaskCount: number }>,
 *   adminSummary?: { tasksByStatus: { Todo: number, 'In Progress': number, Done: number } }
 * }}
 */
async function getDashboardData(userId) {
  // 1. tasksByStatus — tasks assigned to the user, grouped by status (Req 8.1)
  const statusRows = db
    .prepare(
      `SELECT status, COUNT(*) as count
       FROM tasks
       WHERE assignee_id = ?
       GROUP BY status`
    )
    .all(userId);

  const tasksByStatus = { Todo: 0, 'In Progress': 0, Done: 0 };
  for (const row of statusRows) {
    if (Object.prototype.hasOwnProperty.call(tasksByStatus, row.status)) {
      tasksByStatus[row.status] = row.count;
    }
  }

  // 2. overdueTasks — assigned to user, past due date, not Done (Req 8.2)
  const overdueRows = db
    .prepare(
      `SELECT t.id, t.title, t.due_date, p.name AS projectName
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.assignee_id = ?
         AND t.due_date < date('now')
         AND t.status != 'Done'`
    )
    .all(userId);

  const overdueTasks = overdueRows.map((row) => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    projectName: row.projectName,
  }));

  // 3. projects — projects the user belongs to with incomplete task count (Req 8.3)
  const projectRows = db
    .prepare(
      `SELECT p.id, p.name,
         COUNT(CASE WHEN t.status != 'Done' AND t.assignee_id = ? THEN 1 END) AS incompleteTaskCount
       FROM projects p
       JOIN team_members tm ON tm.project_id = p.id
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE tm.user_id = ?
       GROUP BY p.id, p.name`
    )
    .all(userId, userId);

  const projects = projectRows.map((row) => ({
    id: row.id,
    name: row.name,
    incompleteTaskCount: row.incompleteTaskCount,
  }));

  // 4. adminSummary — only if user is Admin on at least one project (Req 8.4)
  const adminStatusRows = db
    .prepare(
      `SELECT t.status, COUNT(*) AS count
       FROM tasks t
       JOIN team_members tm ON tm.project_id = t.project_id
       WHERE tm.user_id = ? AND tm.role = 'Admin'
       GROUP BY t.status`
    )
    .all(userId);

  const result = { tasksByStatus, overdueTasks, projects };

  if (adminStatusRows.length > 0) {
    const adminTasksByStatus = { Todo: 0, 'In Progress': 0, Done: 0 };
    for (const row of adminStatusRows) {
      if (Object.prototype.hasOwnProperty.call(adminTasksByStatus, row.status)) {
        adminTasksByStatus[row.status] = row.count;
      }
    }
    result.adminSummary = { tasksByStatus: adminTasksByStatus };
  }

  return result;
}

module.exports = { getDashboardData };
