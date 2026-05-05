const db = require('../../db');

/**
 * Return all members of a project.
 * @param {number} projectId
 * @returns {Array<{ userId: number, displayName: string, role: string }>}
 */
function getMembers(projectId) {
  const rows = db
    .prepare(
      `SELECT tm.user_id AS userId, u.display_name AS displayName, tm.role
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.project_id = ?`
    )
    .all(projectId);

  return rows;
}

/**
 * Add a user to a project as a Member.
 * @param {number} projectId
 * @param {number} userId
 * @returns {Array<{ userId: number, displayName: string, role: string }>}
 */
function addMember(projectId, userId) {
  // 1. Verify user exists
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Verify user is not already a member
  const existing = db
    .prepare('SELECT id FROM team_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, userId);
  if (existing) {
    const err = new Error('User is already a member of this project');
    err.statusCode = 409;
    throw err;
  }

  // 3. Insert with role = 'Member'
  db.prepare(
    `INSERT INTO team_members (project_id, user_id, role) VALUES (?, ?, 'Member')`
  ).run(projectId, userId);

  // 4. Return updated member list
  return getMembers(projectId);
}

/**
 * Remove a user from a project.
 * @param {number} projectId
 * @param {number} userId
 * @returns {void}
 */
function removeMember(projectId, userId) {
  // 1. Check membership exists
  const existing = db
    .prepare('SELECT id FROM team_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, userId);
  if (!existing) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Delete the membership
  db.prepare(
    'DELETE FROM team_members WHERE project_id = ? AND user_id = ?'
  ).run(projectId, userId);
}

module.exports = { getMembers, addMember, removeMember };
