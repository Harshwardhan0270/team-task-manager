# Implementation Plan: Team Task Manager

## Overview

Implement the full-stack Team Task Manager on top of the existing Node.js/Express + SQLite backend and React (Vite) frontend. The plan follows the modular backend structure defined in the design, wires up all five domain modules (auth, projects, tasks, teams, dashboard), adds RBAC and validation middleware, then updates the frontend with an AuthContext, service layer, and all required pages and components.

Property-based tests use **fast-check** with **Jest**. Unit tests use **Jest** on the backend and **Vitest + React Testing Library** on the frontend.

---

## Tasks

- [x] 1. Install dependencies and initialise project configuration
  - Add `bcryptjs`, `jsonwebtoken`, `express-validator` (or equivalent), `fast-check`, `jest`, `supertest`, `dotenv` to `backend/package.json`; add `vitest`, `@testing-library/react`, `@testing-library/jest-dom` to `frontend/package.json`
  - Create `backend/.env.example` with `JWT_SECRET=` and `PORT=3001`
  - Add Jest config to `backend/package.json` (`testEnvironment: node`, `testMatch: **/__tests__/**/*.test.js`)
  - Add Vitest config to `frontend/vite.config.js`
  - _Requirements: 10.4, 12.2, 13.1_

- [x] 2. Set up database schema and connection
  - [x] 2.1 Rewrite `backend/db.js` to open the SQLite file, enable `PRAGMA foreign_keys = ON`, and run `CREATE TABLE IF NOT EXISTS` statements for `users`, `projects`, `team_members`, and `tasks` exactly as specified in the design schema
    - _Requirements: 9.2, 9.3_
  - [x] 2.2 Rewrite `backend/models.js` (or remove it) so that all DB access goes through `db.js`; no module should open its own SQLite connection
    - _Requirements: 13.1, 13.2_

- [x] 3. Create backend module skeleton and top-level router
  - [x] 3.1 Create the directory tree `backend/modules/{auth,projects,tasks,teams,dashboard}/` with empty `*.routes.js`, `*.service.js`, and `*.validators.js` files as shown in the design
    - _Requirements: 13.1, 13.3_
  - [x] 3.2 Create `backend/router.js` that imports each module's router and mounts it at the correct path (`/auth`, `/projects`, `/dashboard`)
    - _Requirements: 13.1, 13.3_
  - [x] 3.3 Rewrite `backend/server.js` to load `.env`, check for `JWT_SECRET` (exit with error if missing), mount `router.js`, register the global error-handling middleware, and start the server
    - _Requirements: 10.4, 10.5_

- [x] 4. Implement authentication middleware
  - [x] 4.1 Rewrite `backend/middleware/auth.js` to export an `authenticate` middleware that reads the `Authorization: Bearer <token>` header, verifies the JWT with `JWT_SECRET`, attaches `req.user`, and returns 401 on failure
    - _Requirements: 2.4, 2.5, 10.1_
  - [x] 4.2 Create `backend/middleware/rbac.js` exporting a `requireRole(role)` factory that queries `team_members` for the requesting user's role in `req.params.projectId` and returns 403 if the role is insufficient or the user is not a member
    - _Requirements: 3.6, 4.5, 5.5, 6.4, 10.2, 10.3_
  - [x] 4.3 Create `backend/middleware/validate.js` exporting a `handleValidationErrors` middleware that reads `express-validator` results and returns a 400 response with the `details` array if any errors exist
    - _Requirements: 9.4_

- [x] 5. Implement the auth module
  - [x] 5.1 Write `backend/modules/auth/auth.validators.js` with validation chains for register (email, displayName required, password ≥ 8 chars, fields ≤ 255 chars) and login (email, password required)
    - _Requirements: 1.3, 9.1_
  - [x] 5.2 Write `backend/modules/auth/auth.service.js` with `registerUser(email, displayName, password)` (bcrypt hash, cost 12, INSERT user, return `{id, displayName}`) and `loginUser(email, password)` (SELECT user, bcrypt compare, sign JWT with 24 h expiry, return `{token, user}`)
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 12.1, 12.2, 12.3, 12.4_
  - [x] 5.3 Write `backend/modules/auth/auth.routes.js` wiring `POST /register` and `POST /login` to validators + service; mount in `router.js`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_
  - [ ]* 5.4 Write property test — Property 1: bcrypt hash storage
    - **Property 1: Passwords are stored as bcrypt hashes with cost factor 12**
    - Generate random valid passwords with `fc.string({ minLength: 8 })`; call `registerUser`; query DB directly; assert stored hash ≠ plaintext and starts with `$2b$12$`
    - **Validates: Requirements 1.4, 12.1, 12.3**
  - [ ]* 5.5 Write property test — Property 2: valid credentials produce a verifiable JWT within 24-hour expiry
    - **Property 2: Valid credentials always produce a verifiable JWT within 24-hour expiry**
    - Generate random email/password pairs with `fc.emailAddress()` and `fc.string({ minLength: 8 })`; register then login; decode JWT; assert correct `userId`, `displayName`, and `exp ≤ iat + 86400`
    - **Validates: Requirements 2.1, 12.2, 12.4**
  - [ ]* 5.6 Write property test — Property 3: invalid credentials always return 401
    - **Property 3: Invalid credentials always return 401 with a generic message**
    - Generate non-existent emails and wrong passwords; assert 401 with body `{ error: "Invalid credentials" }` in both cases
    - **Validates: Requirements 2.2, 2.3**
  - [ ]* 5.7 Write unit tests for auth service
    - Test: successful registration returns `{id, displayName}`; duplicate email returns 409; short password returns 400; successful login returns token; wrong password returns 401
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 6. Checkpoint — auth module
  - Ensure all auth tests pass. Ask the user if any questions arise before continuing.

- [x] 7. Implement the projects module
  - [x] 7.1 Write `backend/modules/projects/projects.validators.js` with validation chains for create/update (name required, ≤ 255 chars; description ≤ 2000 chars)
    - _Requirements: 9.1_
  - [x] 7.2 Write `backend/modules/projects/projects.service.js` with:
    - `createProject(userId, name, description)` — INSERT project, INSERT team_members (Admin), return project
    - `getProjectsForUser(userId)` — SELECT projects joined through team_members
    - `updateProject(projectId, name, description)` — UPDATE, return updated project
    - `deleteProject(projectId)` — DELETE (cascade handles children), return void
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 7.3 Write `backend/modules/projects/projects.routes.js` wiring `GET /projects`, `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id` with `authenticate` + `requireRole('Admin')` where needed; mount in `router.js`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [ ]* 7.4 Write property test — Property 5: project creation adds creator as Admin member
    - **Property 5: Project creation adds the creator as Admin member**
    - Generate random project names; call create endpoint as Admin; fetch member list; assert creator present with role `Admin`
    - **Validates: Requirements 3.1**
  - [ ]* 7.5 Write property test — Property 6: project list returns only the user's own projects
    - **Property 6: Project list returns only the user's own projects**
    - Generate multiple users and projects with varying memberships; assert each user's list equals exactly their member projects
    - **Validates: Requirements 3.4**
  - [ ]* 7.6 Write property test — Property 7: cascade delete removes all child records
    - **Property 7: Cascade delete removes all child records**
    - Generate projects with random tasks and members; delete project; query DB directly; assert zero tasks and zero team_members for that project_id; assert 204 response
    - **Validates: Requirements 3.3, 9.3**
  - [ ]* 7.7 Write property test — Property 8: Admin-only operations are rejected for Members
    - **Property 8: Admin-only operations are rejected for Members**
    - Generate Member users; attempt POST /projects, PUT /projects/:id, DELETE /projects/:id; assert all return 403
    - **Validates: Requirements 3.6, 4.5, 5.5**
  - [ ]* 7.8 Write unit tests for projects service
    - Test: create returns project with correct fields; list excludes projects user is not a member of; update returns updated fields; delete removes record; duplicate name returns 409
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Implement the teams module
  - [x] 8.1 Write `backend/modules/teams/teams.validators.js` with validation for add-member (userId required, integer) and remove-member (userId param required)
    - _Requirements: 4.3, 4.4_
  - [x] 8.2 Write `backend/modules/teams/teams.service.js` with:
    - `getMembers(projectId)` — SELECT team_members joined with users
    - `addMember(projectId, userId)` — verify user exists (404 if not), verify not already member (409 if so), INSERT team_members with role `Member`, return updated member list
    - `removeMember(projectId, userId)` — DELETE team_members record, return void
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.3 Write `backend/modules/teams/teams.routes.js` wiring `GET /projects/:id/members`, `POST /projects/:id/members`, `DELETE /projects/:id/members/:userId` with `authenticate` + `requireRole('Admin')` for mutating routes; mount in `router.js`
    - _Requirements: 4.1, 4.2, 4.5_
  - [ ]* 8.4 Write property test — Property 9: non-member access returns 403
    - **Property 9: Project membership is required to access project resources**
    - Generate authenticated users with no membership in a project; attempt GET/POST on `/projects/:id/members` and `/projects/:id/tasks`; assert all return 403
    - **Validates: Requirements 7.4, 10.2, 10.3**
  - [ ]* 8.5 Write unit tests for teams service
    - Test: addMember returns updated list; duplicate member returns 409; unknown userId returns 404; removeMember deletes record; getMembers returns correct shape
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Implement the tasks module
  - [x] 9.1 Write `backend/modules/tasks/tasks.validators.js` with validation chains for:
    - Create: title required ≤ 255 chars, assigneeId required integer, status optional (enum), priority optional (enum `Low|Medium|High`), dueDate optional (ISO 8601, not in past), description ≤ 2000 chars
    - Update: status required (enum `Todo|In Progress|Done`)
    - _Requirements: 5.2, 5.3, 5.4, 6.3, 9.1_
  - [x] 9.2 Write `backend/modules/tasks/tasks.service.js` with:
    - `createTask(projectId, { title, assigneeId, status, priority, dueDate, description })` — verify assigneeId is a project member (400 if not), INSERT task, return task
    - `getTasks(projectId, filters)` — SELECT tasks with optional WHERE clauses for `status` and `assignee_id`, JOIN users for `assigneeDisplayName`
    - `updateTaskStatus(projectId, taskId, status, requestingUser)` — verify task exists (404), verify requester is assignee or Admin (403), UPDATE status + updated_at, return task
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.4, 7.1, 7.2, 7.3_
  - [x] 9.3 Write `backend/modules/tasks/tasks.routes.js` wiring `GET /projects/:id/tasks`, `POST /projects/:id/tasks` (Admin only), `PATCH /projects/:id/tasks/:taskId`; mount in `router.js`
    - _Requirements: 5.1, 5.5, 6.1, 6.2, 7.1, 7.4_
  - [ ]* 9.4 Write property test — Property 10: task filtering returns only tasks matching the filter predicate
    - **Property 10: Task filtering returns only tasks matching the filter predicate**
    - Generate task lists with `fc.array(taskArbitrary)`; apply status and assignee filters; assert every returned task satisfies all filter conditions and no matching task is absent
    - **Validates: Requirements 7.1, 7.2, 7.3**
  - [ ]* 9.5 Write property test — Property 13: task status updates are constrained to valid values
    - **Property 13: Task status updates are constrained to valid values**
    - Generate random status strings with `fc.string()`; assert only `Todo`, `In Progress`, `Done` return 200; all others return 400
    - **Validates: Requirements 6.1, 6.2, 6.3**
  - [ ]* 9.6 Write property test — Property 15: task priority is constrained to valid enum values
    - **Property 15: Task priority is constrained to valid enum values**
    - Generate random priority strings; assert only `Low`, `Medium`, `High` accepted on task creation; others return 400
    - **Validates: Requirements 5.4**
  - [ ]* 9.7 Write property test — Property 16: due dates must be valid ISO 8601 and not in the past
    - **Property 16: Due dates must be valid ISO 8601 and not in the past**
    - Generate past dates with `fc.date({ max: yesterday })` and invalid strings with `fc.string()`; assert 400. Generate future dates; assert accepted
    - **Validates: Requirements 5.3**
  - [ ]* 9.8 Write unit tests for tasks service
    - Test: createTask with non-member assignee returns 400; createTask with valid data returns 201; getTasks with status filter returns only matching tasks; updateTaskStatus by non-assignee Member returns 403; updateTaskStatus by Admin succeeds
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.4, 7.1, 7.2, 7.3_

- [ ] 10. Checkpoint — backend modules
  - Ensure all backend module tests pass. Ask the user if any questions arise before continuing.

- [x] 11. Implement the dashboard module
  - [x] 11.1 Write `backend/modules/dashboard/dashboard.service.js` with `getDashboardData(userId)`:
    - Query tasks assigned to user grouped by status → `tasksByStatus`
    - Query tasks assigned to user where `due_date < date('now')` and `status != 'Done'` → `overdueTasks` (include `projectName`)
    - Query projects user belongs to with count of incomplete tasks → `projects`
    - If user is Admin on any project, additionally compute `adminSummary.tasksByStatus` across all owned projects
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 11.2 Write `backend/modules/dashboard/dashboard.routes.js` wiring `GET /dashboard` with `authenticate`; mount in `router.js`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 11.3 Write property test — Property 11: dashboard counts are consistent with actual task data
    - **Property 11: Dashboard counts are consistent with actual task data**
    - Generate users with `fc.array(taskArbitrary)`; fetch dashboard; assert sum of `tasksByStatus` values equals total tasks assigned to user; assert `incompleteTaskCount` per project equals non-Done tasks for that user in that project
    - **Validates: Requirements 8.1, 8.3**
  - [ ]* 11.4 Write property test — Property 12: dashboard overdue tasks satisfy the overdue predicate
    - **Property 12: Dashboard overdue tasks satisfy the overdue predicate**
    - Generate tasks with varying `dueDate` and `status` values; fetch dashboard; assert every task in `overdueTasks` has `dueDate < today` and `status != Done`; assert no qualifying task is absent
    - **Validates: Requirements 8.2**
  - [ ]* 11.5 Write unit tests for dashboard service
    - Test: correct grouping by status; overdue list excludes Done tasks and future-dated tasks; adminSummary present only for Admin users; projects list includes incompleteTaskCount
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 12. Implement cross-cutting validation and error handling
  - [x] 12.1 Add global error-handling middleware to `backend/server.js` that catches unhandled errors, logs the endpoint path and elapsed time, and returns `{ error: "Internal server error" }` with status 500
    - _Requirements: 9.4, 11.3_
  - [x] 12.2 Add 404 middleware in `backend/server.js` for unmatched routes returning `{ error: "Not found" }`
    - _Requirements: 9.4_
  - [ ]* 12.3 Write property test — Property 4: all protected endpoints reject requests without a valid JWT
    - **Property 4: All protected endpoints reject requests without a valid JWT**
    - Use `fc.constantFrom(...protectedRoutes)` to generate requests to all protected routes without a token; assert all return 401 before any handler logic runs
    - **Validates: Requirements 2.4, 10.1**
  - [ ]* 12.4 Write property test — Property 14: input length validation rejects oversized fields
    - **Property 14: Input length validation rejects oversized fields**
    - Generate strings with `fc.string({ minLength: 256 })` for name/title fields and `fc.string({ minLength: 2001 })` for description fields; assert 400 and no DB write
    - **Validates: Requirements 9.1**
  - [ ]* 12.5 Write property test — Property 17: error responses always contain an `error` field
    - **Property 17: Error responses always contain an `error` field**
    - Use `fc.constantFrom(...errorTriggers)` to trigger 400, 401, 403, 404, 409, and 500 responses; assert every response body is a JSON object with a non-empty `error` string field
    - **Validates: Requirements 9.4**
  - [ ]* 12.6 Write unit tests for RBAC middleware
    - Test: `requireRole('Admin')` returns 403 for Member; returns 403 for non-member; passes for Admin; attaches `req.projectRole`
    - _Requirements: 3.6, 4.5, 5.5, 6.4, 10.2, 10.3_

- [ ] 13. Checkpoint — full backend
  - Ensure all 17 property tests and all unit tests pass. Ask the user if any questions arise before continuing.

- [x] 14. Set up frontend AuthContext and API service
  - [x] 14.1 Create `frontend/src/context/AuthContext.jsx` exporting an `AuthProvider` that stores `{ user, token }` in state, reads/writes the JWT from `localStorage`, and exposes `login(token, user)` and `logout()` helpers via context
    - _Requirements: 2.1, 10.1_
  - [x] 14.2 Create `frontend/src/services/api.js` with an Axios instance that reads the JWT from `localStorage`, attaches it as `Authorization: Bearer <token>`, and intercepts 401 responses to call `logout()` and redirect to `/login`
    - _Requirements: 2.4, 10.1_
  - [x] 14.3 Rewrite `frontend/src/services/auth.js` to call `POST /auth/register` and `POST /auth/login` via the Axios instance and return the response data
    - _Requirements: 1.1, 2.1_
  - [x] 14.4 Create `frontend/src/services/projects.js`, `tasks.js`, `teams.js`, and `dashboard.js` each exporting typed functions that call the corresponding API endpoints
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 6.1, 7.1, 8.1_
  - [x] 14.5 Wrap `frontend/src/main.jsx` (or `App.jsx`) with `<AuthProvider>` so context is available to all routes
    - _Requirements: 2.1_

- [x] 15. Implement frontend routing, layout, and auth pages
  - [x] 15.1 Create `frontend/src/components/ProtectedRoute.jsx` that reads from `AuthContext` and redirects unauthenticated users to `/login`
    - _Requirements: 2.4, 10.1_
  - [x] 15.2 Create `frontend/src/components/Layout.jsx` with a responsive navigation sidebar/header (collapses to single-column below 640 px) and an `<Outlet>` for nested routes
    - _Requirements: 14.1, 14.2_
  - [x] 15.3 Rewrite `frontend/src/pages/Login.jsx` to use `AuthContext.login` and redirect to `/dashboard` on success; display API error messages inline
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 15.4 Rewrite `frontend/src/pages/Signup.jsx` to call `auth.register` and redirect to `/login` on success; display validation errors inline
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 15.5 Update `frontend/src/App.jsx` with React Router routes: `/login`, `/signup` (public), and `/dashboard`, `/projects`, `/projects/:id`, `/tasks` (protected via `ProtectedRoute`)
    - _Requirements: 14.1_

- [x] 16. Implement Dashboard page
  - [x] 16.1 Rewrite `frontend/src/pages/Dashboard.jsx` to call `dashboard.getDashboard()` on mount and render `tasksByStatus` counts, `overdueTasks` list, and `projects` with `incompleteTaskCount`; show `adminSummary` section when present
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 16.2 Apply responsive layout: single-column below 640 px, multi-column at 640 px and above; all tap targets ≥ 44 × 44 px
    - _Requirements: 14.1, 14.2, 14.3_
  - [ ]* 16.3 Write Vitest component tests for Dashboard
    - Test: renders task counts from mock data; renders overdue tasks list; renders adminSummary only when present; shows loading state
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 17. Implement Projects page and ProjectDetail page
  - [x] 17.1 Rewrite `frontend/src/pages/Projects.jsx` to list the user's projects (fetched from `projects.getProjects()`); show a "New Project" button for Admins that opens `ProjectForm`
    - _Requirements: 3.1, 3.4_
  - [x] 17.2 Create `frontend/src/components/ProjectForm.jsx` with controlled inputs for name and description; calls `projects.createProject` or `projects.updateProject`; displays validation errors
    - _Requirements: 3.1, 3.2, 3.5_
  - [x] 17.3 Create `frontend/src/pages/ProjectDetail.jsx` that fetches tasks and members for a project; renders `TaskCard` list, `TaskForm` (Admin only), and `MemberList`
    - _Requirements: 5.1, 7.1, 4.1, 4.2_
  - [x] 17.4 Create `frontend/src/components/MemberList.jsx` that renders the member list and provides add/remove controls for Admins
    - _Requirements: 4.1, 4.2, 4.5_
  - [ ]* 17.5 Write Vitest component tests for Projects and ProjectDetail
    - Test: project list renders items; "New Project" button hidden for Members; MemberList shows add/remove only for Admins
    - _Requirements: 3.4, 3.6, 4.5_

- [x] 18. Implement Tasks page and task components
  - [x] 18.1 Rewrite `frontend/src/pages/Tasks.jsx` to fetch tasks for the current project with optional status/assignee filters; render a list of `TaskCard` components
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 18.2 Create `frontend/src/components/TaskCard.jsx` displaying title, status badge, assignee display name, due date, and priority; includes a status dropdown that calls `tasks.updateTaskStatus` (enabled only for assignee or Admin)
    - _Requirements: 6.1, 6.2, 6.4, 7.1_
  - [x] 18.3 Create `frontend/src/components/TaskForm.jsx` with controlled inputs for title, assignee (select from project members), status, priority, due date, and description; calls `tasks.createTask`; displays validation errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 18.4 Add filter controls to `Tasks.jsx` (status select, assignee select) that update query params and re-fetch
    - _Requirements: 7.2, 7.3_
  - [ ]* 18.5 Write Vitest component tests for Tasks page and TaskCard
    - Test: task list renders with correct data; status dropdown disabled for non-assignee Members; filter controls trigger re-fetch; TaskForm shows validation errors
    - _Requirements: 6.1, 6.4, 7.1, 7.2, 7.3_

- [ ] 19. Final checkpoint — full stack
  - Ensure all backend tests (17 property tests + unit tests) pass and the frontend builds without errors (`npm run build` in `frontend/`). Ask the user if any questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests (P1–P17) map directly to the Correctness Properties in the design document
- Checkpoints at tasks 6, 10, 13, and 19 provide incremental validation gates
- The backend uses **fast-check + Jest**; the frontend uses **Vitest + React Testing Library**
- No task in this list requires running the application manually — all verification is through automated tests
