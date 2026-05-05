const { Router } = require('express');
const { registerValidators, loginValidators } = require('./auth.validators');
const { handleValidationErrors } = require('../../middleware/validate');
const authService = require('./auth.service');

const router = Router();

/**
 * POST /auth/register
 * Requirements: 1.1, 1.2, 1.3
 */
router.post(
  '/register',
  registerValidators,
  handleValidationErrors,
  async (req, res, next) => {
    const { email, displayName, password, role } = req.body;
    try {
      const user = await authService.registerUser(email, displayName, password, role);
      return res.status(201).json(user);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * POST /auth/login
 * Requirements: 2.1, 2.2, 2.3
 */
router.post(
  '/login',
  loginValidators,
  handleValidationErrors,
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const result = await authService.loginUser(email, password);
      return res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

module.exports = router;
