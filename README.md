# Team Task Manager

A full-stack collaborative task management web application built with **Node.js/Express**, **SQLite**, and **React (Vite)**. Inspired by tools like Trello and Asana.

## Live Demo

> **Frontend:** https://your-frontend.railway.app  
> **Backend API:** https://your-backend.railway.app/api

---

## Features

- **Authentication** — Signup/Login with JWT, bcrypt password hashing
- **Role-Based Access** — Admin and Member roles (per project and globally)
- **Project Management** — Create projects, add/remove team members
- **Task Management** — Create tasks with title, description, due date, priority; assign to members
- **Kanban Board** — Visual task board with To Do / In Progress / Done columns
- **Dashboard** — Live stats: total tasks, open tasks, overdue tasks, status breakdown
- **My Tasks** — Personal task view with filters
- **Team Page** — View all workspace members, Admins can change roles

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express 4, better-sqlite3 |
| Database | SQLite (file-based) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Deployment | Railway |

---

## Project Structure

```
├── backend/
│   ├── modules/
│   │   ├── auth/          # Register, Login
│   │   ├── projects/      # Project CRUD
│   │   ├── tasks/         # Task CRUD + Kanban
│   │   ├── teams/         # Member management
│   │   ├── dashboard/     # Aggregated stats
│   │   └── users/         # User list, My Tasks, Role management
│   ├── middleware/
│   │   ├── auth.js        # JWT validation
│   │   ├── rbac.js        # Role-based access control
│   │   └── validate.js    # Request validation
│   ├── db.js              # SQLite connection + schema
│   ├── router.js          # Top-level router
│   └── server.js          # Express app entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Projects.jsx
        │   ├── ProjectDetail.jsx  # Kanban board
        │   ├── MyTasks.jsx
        │   ├── Team.jsx
        │   ├── Login.jsx
        │   └── Signup.jsx
        ├── components/
        │   ├── Layout.jsx         # Sidebar navigation
        │   └── ProtectedRoute.jsx
        ├── services/              # Axios API calls
        └── context/
            └── AuthContext.jsx    # Global auth state
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set JWT_SECRET to a random 32+ character string
npm start
# Server runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# Create .env.local (optional — defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
# App runs on http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project (Admin) |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create task (Admin) |
| PATCH | `/api/projects/:id/tasks/:taskId` | Update task status |
| PUT | `/api/projects/:id/tasks/:taskId` | Full task update |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task (Admin) |

### Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/members` | List members |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Dashboard & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/users` | All users |
| GET | `/api/users/me/tasks` | My assigned tasks |
| PATCH | `/api/users/:id/role` | Change user role (Admin) |

---

## Deployment on Railway

### Backend Service

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the repo, set **Root Directory** to `backend`
3. Add environment variables:
   ```
   JWT_SECRET=<random 32+ char string>
   PORT=5000
   NODE_ENV=production
   ```
4. Railway auto-detects Node.js and runs `npm start`

### Frontend Service

1. Add another service in the same Railway project
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   ```
   VITE_API_URL=https://<your-backend-service>.railway.app/api
   ```
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npm run start`

### Database

SQLite is file-based and included in the backend. For production persistence on Railway, the database file is stored at `backend/data/database.db`. Railway's ephemeral filesystem means data resets on redeploy — for persistent storage, consider adding a Railway PostgreSQL plugin and migrating the schema.

---

## Environment Variables

### Backend (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | ✅ |
| `PORT` | Server port (default: 5000) | Optional |

### Frontend (`.env.local`)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Optional (defaults to localhost:5000/api) |

---

## Database Schema

```sql
users         — id, email, display_name, password_hash, role, created_at
projects      — id, name, description, created_at
team_members  — id, project_id, user_id, role, joined_at
tasks         — id, project_id, assignee_id, title, description,
                status, priority, due_date, created_at, updated_at
```

---

## Security

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens expire after **24 hours**
- All API routes (except `/auth/register` and `/auth/login`) require a valid JWT
- Project-scoped RBAC — roles are enforced per project
- Input validation on all endpoints via `express-validator`
- CORS configured for frontend origin

---

## Author

Built as a full-stack coding assignment demonstrating:
- REST API design
- JWT authentication
- Role-based access control
- Relational database design
- React SPA with protected routes
- Railway deployment
