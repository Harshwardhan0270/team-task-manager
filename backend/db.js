const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Ensure the data directory exists before opening the database file
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open the SQLite database file
const db = new Database(path.join(dataDir, 'database.db'));

// Enable foreign key enforcement on every connection
db.pragma('foreign_keys = ON');

// Initialise schema — all four tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    NOT NULL UNIQUE,
    display_name  TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'Member' CHECK(role IN ('Admin', 'Member')),
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role        TEXT    NOT NULL CHECK(role IN ('Admin', 'Member')),
    joined_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id INTEGER NOT NULL REFERENCES users(id),
    title       TEXT    NOT NULL,
    description TEXT,
    status      TEXT    NOT NULL DEFAULT 'Todo'
                        CHECK(status IN ('Todo', 'In Progress', 'Done')),
    priority    TEXT             CHECK(priority IN ('Low', 'Medium', 'High')),
    due_date    TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
