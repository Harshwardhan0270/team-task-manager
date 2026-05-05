// All database access goes through the single connection in db.js.
// This module simply re-exports that instance so any legacy import of
// `models.js` continues to work without opening a second connection.
const db = require('./db');

module.exports = db;
