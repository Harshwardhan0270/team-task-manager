require('dotenv').config();

// Fail fast if the JWT secret is not configured — the application cannot
// operate securely without it (Requirements 10.4, 10.5).
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

const express = require('express');
const cors    = require('cors');
const router  = require('./router');

const app = express();

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
    : true, // allow all origins if FRONTEND_URL not set
  credentials: true,
}));
app.use(express.json());

// ── Request timing (Requirement 11.3) ────────────────────────────────────────
app.use((req, _res, next) => {
  req._startTime = Date.now();
  next();
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api', router);

// ── 404 — unmatched routes ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Must be a 4-argument function so Express recognises it as an error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const elapsed = Date.now() - (req._startTime || Date.now());
  console.error(`[ERROR] ${req.method} ${req.path} (${elapsed}ms) - ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app; // exported for supertest in integration tests
