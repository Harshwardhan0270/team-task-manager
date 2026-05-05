const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');

/**
 * Register a new user.
 * Requirements: 1.1, 1.2, 1.4, 12.1, 12.3
 *
 * @param {string} email
 * @param {string} displayName
 * @param {string} password
 * @returns {{ id: number, displayName: string }}
 * @throws {{ statusCode: 409, message: string }} if email already registered
 */
async function registerUser(email, displayName, password, role = 'Member') {
  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  // Hash password with bcrypt cost factor 12
  const passwordHash = await bcrypt.hash(password, 12);

  // Insert new user with role
  const stmt = db.prepare(
    'INSERT INTO users (email, display_name, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(email, displayName, passwordHash, role);

  return { id: result.lastInsertRowid, displayName, role };
}

/**
 * Authenticate an existing user and return a signed JWT.
 * Requirements: 2.1, 2.2, 2.3, 12.2, 12.4
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, user: { id: number, displayName: string } }}
 * @throws {{ statusCode: 401, message: string }} if credentials are invalid
 */
async function loginUser(email, password) {
  // Look up user by email
  const user = db.prepare(
    'SELECT id, display_name, password_hash, role FROM users WHERE email = ?'
  ).get(email);

  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  // Compare provided password against stored bcrypt hash
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  // Sign JWT with 24-hour expiry — include role in payload
  const token = jwt.sign(
    { id: user.id, displayName: user.display_name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: { id: user.id, displayName: user.display_name, role: user.role },
  };
}

module.exports = { registerUser, loginUser };
