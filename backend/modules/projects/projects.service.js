const db = require('../../db');

/**
 * Create a new project and add the creator as Admin.
 * Requirements: 3.1, 3.5
 *
 * @param {number} userId
 * @param {string} name
 * @param {string|undefined} description
 * @returns {{ id: number, name: string, description: string|null, createdAt: string }}
 * @throws {{ statusCode: 409, message: string }} if a project with the same name already exists for this admin
 */
async function createProject(userId, name, description) {
  // Check if a project with the same name already exists for this admin
  const existing = db
    .prepare(
      `SELECT p.id FROM projects p
       INNER JOIN team_members tm ON tm.project_id = p.id
       WHERE p.name = ? AND tm.user_id = ? AND tm.role = 'Admin'`
    )
    .get(name, userId);

  if (existing) {
    const err = new Error('A project with this name already exists');
    err.statusCode = 409;
    throw err;
  }

  // Insert the new project
  const insertProject = db.prepare(
    'INSERT INTO projects (name, description) VALUES (?, ?)'
  );

  // Insert the creator as Admin team member
  const insertMember = db.prepare(
    "INSERT INTO team_members (project_id, user_id, role) VALUES (?, ?, 'Admin')"
  );

  // Run both inserts in a transaction
  const createTransaction = db.transaction(() => {
    const result = insertProject.run(name, description ?? null);
    const projectId = result.lastInsertRowid;
    insertMember.run(projectId, userId);
    return projectId;
  });

  const projectId = createTransaction();

  const project = db
    .prepare('SELECT id, name, description, created_at FROM projects WHERE id = ?')
    .get(projectId);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.created_at,
  };
}

/**
 * Return all projects the given user is a member of.
 * Requirements: 3.4
 *
 * @param {number} userId
 * @returns {Array<{ id: number, name: string, description: string|null, createdAt: string }>}
 */
async function getProjectsForUser(userId) {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.description, p.created_at
       FROM projects p
       INNER JOIN team_members tm ON tm.project_id = p.id
       WHERE tm.user_id = ?
       ORDER BY p.created_at ASC`
    )
    .all(userId);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  }));
}

/**
 * Update a project's name and/or description.
 * Requirements: 3.2
 *
 * @param {number} projectId
 * @param {string} name
 * @param {string|undefined} description
 * @returns {{ id: number, name: string, description: string|null, createdAt: string }}
 * @throws {{ statusCode: 404, message: string }} if project not found
 */
async function updateProject(projectId, name, description) {
  // Check project exists
  const existing = db
    .prepare('SELECT id FROM projects WHERE id = ?')
    .get(projectId);

  if (!existing) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  db.prepare(
    'UPDATE projects SET name = ?, description = ? WHERE id = ?'
  ).run(name, description ?? null, projectId);

  const project = db
    .prepare('SELECT id, name, description, created_at FROM projects WHERE id = ?')
    .get(projectId);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.created_at,
  };
}

/**
 * Delete a project (cascade removes tasks and team_members).
 * Requirements: 3.3, 9.3
 *
 * @param {number} projectId
 * @returns {void}
 * @throws {{ statusCode: 404, message: string }} if project not found
 */
async function deleteProject(projectId) {
  // Check project exists
  const existing = db
    .prepare('SELECT id FROM projects WHERE id = ?')
    .get(projectId);

  if (!existing) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
}

module.exports = { createProject, getProjectsForUser, updateProject, deleteProject };
