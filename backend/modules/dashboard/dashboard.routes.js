const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { getDashboardData } = require('./dashboard.service');

const router = Router();

/**
 * GET /dashboard
 * Returns aggregated dashboard data for the authenticated user.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await getDashboardData(req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
