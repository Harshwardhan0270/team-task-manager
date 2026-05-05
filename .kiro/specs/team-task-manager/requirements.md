# Requirements Document

## Introduction

The Team Task Manager is a full-stack web application that enables teams to collaborate on projects by creating tasks, assigning work to members, and tracking progress. The system provides role-based access control distinguishing Admins from Members, a real-time dashboard for visibility into task status and overdue items, and a REST API backend backed by a relational database. The frontend is built with React (Vite) and the backend with Node.js/Express using SQLite and JWT-based authentication.

## Glossary

- **System**: The Team Task Manager web application as a whole.
- **Auth_Service**: The backend component responsible for user registration, login, and JWT token issuance/validation.
- **User**: A registered individual who can log in and participate in projects.
- **Admin**: A User with elevated privileges who can manage projects, teams, and all tasks within those projects.
- **Member**: A User with standard privileges who can view assigned projects and manage tasks assigned to them.
- **Project**: A named container that groups related tasks and team members.
- **Team**: The set of Users associated with a specific Project.
- **Task**: A unit of work within a Project that has a title, description, status, assignee, due date, and priority.
- **Task_Status**: The current state of a Task; one of `Todo`, `In Progress`, or `Done`.
- **Dashboard**: The landing page shown after login that aggregates task counts, statuses, and overdue items for the authenticated User.
- **JWT**: JSON Web Token used as a bearer token for authenticating API requests.
- **API**: The RESTful HTTP interface exposed by the backend.
- **DB**: The SQLite relational database that persists all application data.
- **Validator**: The backend component that checks incoming request payloads against defined rules before processing.
- **RBAC**: Role-Based Access Control — the mechanism that restricts API actions based on a User's role within a Project.

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new visitor, I want to create an account, so that I can access the Team Task Manager.

#### Acceptance Criteria

1. WHEN a registration request is received with a unique email, display name, and a password of at least 8 characters, THE Auth_Service SHALL create a new User record and return a 201 response containing the User's ID and display name.
2. WHEN a registration request is received with an email that already exists in the DB, THE Auth_Service SHALL return a 409 response with a descriptive error message.
3. WHEN a registration request is received with a missing or malformed email, missing display name, or a password shorter than 8 characters, THE Validator SHALL return a 400 response listing each validation error.
4. THE Auth_Service SHALL store passwords as a bcrypt hash and SHALL NOT store plaintext passwords in the DB.

---

### Requirement 2: User Authentication

**User Story:** As a registered User, I want to log in with my credentials, so that I can access protected features.

#### Acceptance Criteria

1. WHEN a login request is received with a valid email and matching password, THE Auth_Service SHALL return a 200 response containing a signed JWT with a 24-hour expiry and the User's ID, display name, and role.
2. WHEN a login request is received with an email that does not exist in the DB, THE Auth_Service SHALL return a 401 response with a generic "Invalid credentials" message.
3. WHEN a login request is received with a correct email but incorrect password, THE Auth_Service SHALL return a 401 response with a generic "Invalid credentials" message.
4. WHEN an API request is received without a valid JWT in the Authorization header, THE Auth_Service SHALL return a 401 response before the request reaches any protected route handler.
5. WHEN an API request is received with an expired JWT, THE Auth_Service SHALL return a 401 response indicating the token has expired.

---

### Requirement 3: Project Management

**User Story:** As an Admin, I want to create and manage projects, so that I can organize work for my team.

#### Acceptance Criteria

1. WHEN an authenticated Admin submits a project creation request with a unique name and optional description, THE System SHALL create a new Project record, add the Admin as the first Team member with the Admin role, and return a 201 response with the Project details.
2. WHEN an authenticated Admin submits a project update request for a Project the Admin owns, THE System SHALL update the Project's name or description and return a 200 response with the updated Project details.
3. WHEN an authenticated Admin submits a project deletion request for a Project the Admin owns, THE System SHALL delete the Project and all associated Tasks and Team memberships, and return a 204 response.
4. WHEN an authenticated User requests the list of projects, THE System SHALL return only the Projects to which that User belongs.
5. WHEN a project creation request is received with a name that already exists for that Admin, THE Validator SHALL return a 409 response with a descriptive error message.
6. WHEN an authenticated Member attempts to create, update, or delete a Project, THE RBAC SHALL return a 403 response.

---

### Requirement 4: Team Management

**User Story:** As an Admin, I want to add and remove members from a project, so that I can control who has access to project work.

#### Acceptance Criteria

1. WHEN an authenticated Admin submits a request to add a registered User to a Project the Admin owns, THE System SHALL create a Team membership record with the Member role and return a 200 response with the updated Team list.
2. WHEN an authenticated Admin submits a request to remove a User from a Project the Admin owns, THE System SHALL delete the Team membership record and return a 204 response.
3. WHEN an authenticated Admin attempts to add a User who is already a member of the Project, THE Validator SHALL return a 409 response with a descriptive error message.
4. WHEN an authenticated Admin attempts to add a User ID that does not exist in the DB, THE Validator SHALL return a 404 response with a descriptive error message.
5. WHEN an authenticated Member attempts to add or remove Team members, THE RBAC SHALL return a 403 response.

---

### Requirement 5: Task Creation and Assignment

**User Story:** As an Admin, I want to create tasks and assign them to team members, so that work is clearly distributed.

#### Acceptance Criteria

1. WHEN an authenticated Admin submits a task creation request for a Project the Admin belongs to, with a title, status, and valid assignee User ID that is a member of the Project, THE System SHALL create a Task record and return a 201 response with the Task details.
2. WHEN a task creation request is received with a missing title or an assignee User ID that is not a member of the Project, THE Validator SHALL return a 400 response listing each validation error.
3. WHERE a due date is provided in a task creation request, THE Validator SHALL verify the due date is a valid ISO 8601 date and is not in the past, and SHALL return a 400 response if either condition is violated.
4. WHERE a priority is provided in a task creation request, THE Validator SHALL accept only the values `Low`, `Medium`, or `High`, and SHALL return a 400 response for any other value.
5. WHEN an authenticated Member attempts to create a Task, THE RBAC SHALL return a 403 response.

---

### Requirement 6: Task Status Tracking

**User Story:** As a team member, I want to update the status of my tasks, so that the team can track progress.

#### Acceptance Criteria

1. WHEN an authenticated User who is the assignee of a Task submits a status update request with a valid Task_Status value, THE System SHALL update the Task's status and return a 200 response with the updated Task details.
2. WHEN an authenticated Admin submits a status update request for any Task within a Project the Admin belongs to, THE System SHALL update the Task's status and return a 200 response with the updated Task details.
3. WHEN a status update request is received with a value that is not one of `Todo`, `In Progress`, or `Done`, THE Validator SHALL return a 400 response with a descriptive error message.
4. WHEN an authenticated Member who is not the assignee of a Task submits a status update request for that Task, THE RBAC SHALL return a 403 response.

---

### Requirement 7: Task Listing and Filtering

**User Story:** As a team member, I want to view and filter tasks within a project, so that I can focus on relevant work.

#### Acceptance Criteria

1. WHEN an authenticated User requests the task list for a Project the User belongs to, THE System SHALL return all Tasks for that Project including title, status, assignee display name, due date, and priority.
2. WHEN an authenticated User requests the task list with a `status` query parameter, THE System SHALL return only Tasks matching the specified Task_Status.
3. WHEN an authenticated User requests the task list with an `assignee` query parameter containing a User ID, THE System SHALL return only Tasks assigned to that User.
4. WHEN an authenticated User requests the task list for a Project the User does not belong to, THE RBAC SHALL return a 403 response.

---

### Requirement 8: Dashboard

**User Story:** As a logged-in User, I want a dashboard that summarizes my tasks and project activity, so that I can quickly understand my workload.

#### Acceptance Criteria

1. WHEN an authenticated User requests the dashboard data, THE System SHALL return the total count of Tasks assigned to that User grouped by Task_Status (`Todo`, `In Progress`, `Done`).
2. WHEN an authenticated User requests the dashboard data, THE System SHALL return all Tasks assigned to that User whose due date is earlier than the current date and whose status is not `Done`, as overdue tasks.
3. WHEN an authenticated User requests the dashboard data, THE System SHALL return the list of Projects the User belongs to with the count of incomplete Tasks per Project.
4. WHEN an authenticated Admin requests the dashboard data, THE System SHALL additionally return the total count of all Tasks across all Projects the Admin owns, grouped by Task_Status.

---

### Requirement 9: Input Validation and Data Integrity

**User Story:** As a system operator, I want all inputs validated and relationships enforced, so that the database remains consistent.

#### Acceptance Criteria

1. THE Validator SHALL reject any request payload that contains fields with a string length exceeding 255 characters for name/title fields and 2000 characters for description fields, returning a 400 response.
2. THE DB SHALL enforce foreign key constraints between Tasks and Projects, between Tasks and Users (assignee), and between Team memberships and both Projects and Users.
3. WHEN a Project is deleted, THE DB SHALL cascade-delete all Tasks and Team membership records associated with that Project.
4. THE System SHALL return all error responses in a consistent JSON structure containing at minimum an `error` field with a human-readable message.

---

### Requirement 10: API Security and Authorization

**User Story:** As a system operator, I want all API endpoints protected and access controlled by role, so that data is not exposed or modified without authorization.

#### Acceptance Criteria

1. THE Auth_Service SHALL protect all API routes except `/auth/register` and `/auth/login` with JWT validation middleware.
2. WHILE a User is authenticated, THE RBAC SHALL evaluate the User's role within the specific Project context for every Project-scoped request.
3. WHEN an authenticated User requests a resource that belongs to a Project the User is not a member of, THE RBAC SHALL return a 403 response.
4. THE Auth_Service SHALL sign JWTs using a secret key stored in an environment variable and SHALL NOT hardcode the secret in source code.
5. IF the JWT secret environment variable is not set at server startup, THEN THE System SHALL terminate with a descriptive error message rather than starting with an insecure default.

---

## Non-Functional Requirements

### Requirement 11: API Response Time

**User Story:** As a User, I want API responses to arrive quickly, so that the application feels responsive during normal use.

#### Acceptance Criteria

1. WHEN the System receives any API request under normal load (up to 100 concurrent users), THE API SHALL return a complete HTTP response within 500 milliseconds at the 95th percentile.
2. WHEN the System receives a dashboard data request, THE System SHALL return the response within 500 milliseconds at the 95th percentile.
3. IF an API request exceeds 500 milliseconds at the 95th percentile under normal load, THEN THE System SHALL log the slow request including the endpoint path and elapsed time.

---

### Requirement 12: Authentication Security

**User Story:** As a system operator, I want credentials protected using industry-standard mechanisms, so that user accounts are not compromised if the database is exposed.

#### Acceptance Criteria

1. THE Auth_Service SHALL hash all User passwords using bcrypt with a minimum cost factor of 12 before storing them in the DB.
2. THE Auth_Service SHALL sign and validate all JWTs using the HMAC-SHA256 algorithm with a secret key of at least 32 characters.
3. WHEN a login request is received, THE Auth_Service SHALL compare the provided password against the stored bcrypt hash and SHALL NOT compare against a plaintext value.
4. THE Auth_Service SHALL set JWT expiry to no more than 24 hours from the time of issuance.

---

### Requirement 13: Modular Architecture

**User Story:** As a developer, I want the codebase organised into independent modules, so that individual components can be modified or replaced without affecting unrelated parts of the system.

#### Acceptance Criteria

1. THE System SHALL separate backend source code into distinct modules for authentication, project management, task management, team management, and dashboard, each contained in its own directory with no circular dependencies between modules.
2. THE System SHALL expose each module's functionality only through a defined interface, so that no module directly accesses the internal implementation files of another module.
3. WHEN a new API route is added, THE System SHALL require changes only to the relevant module and the top-level router, with no modifications required in unrelated modules.

---

### Requirement 14: Responsive User Interface

**User Story:** As a User, I want the frontend to adapt to different screen sizes, so that I can use the application on desktop and mobile devices.

#### Acceptance Criteria

1. THE System SHALL render all pages without horizontal scrolling at viewport widths of 320 px, 768 px, and 1280 px.
2. THE System SHALL display the Dashboard, Task List, and Project pages with a single-column layout at viewport widths below 640 px and a multi-column layout at viewport widths of 640 px and above.
3. WHEN a User interacts with any form control (button, input, select) on a touch device, THE System SHALL present a tap target of at least 44 × 44 CSS pixels.
