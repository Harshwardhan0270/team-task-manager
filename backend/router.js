const { Router } = require('express');

const authRouter      = require('./modules/auth/auth.routes');
const projectsRouter  = require('./modules/projects/projects.routes');
const teamsRouter     = require('./modules/teams/teams.routes');
const tasksRouter     = require('./modules/tasks/tasks.routes');
const dashboardRouter = require('./modules/dashboard/dashboard.routes');
const usersRouter     = require('./modules/users/users.routes');

const router = Router();

router.use('/auth', authRouter);
router.use('/projects', projectsRouter);
router.use('/projects', teamsRouter);
router.use('/projects', tasksRouter);
router.use('/dashboard', dashboardRouter);
router.use('/users', usersRouter);

module.exports = router;
