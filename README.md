# Team Task Manager

A full-stack collaborative task management web application — a simplified Trello/Asana clone built with **Node.js/Express**, **SQLite**, and **React (Vite)**.

## 🚀 Live Demo

| | URL |
|---|---|
| **Frontend** | https://team-task-manager-1-w7w9.onrender.com |
| **Backend API** | https://team-task-manager-3b7j.onrender.com/api |
| **GitHub** | https://github.com/Harshwardhan0270/team-task-manager |

> ⚠️ Render free tier sleeps after 15 min of inactivity. First load may take 30–60 seconds.

---

## ✨ Features

- **Authentication** — Signup/Login with JWT, bcrypt password hashing (cost factor 12)
- **Role-Based Access** — Admin and Member roles (global + per-project)
- **Project Management** — Create projects, add/remove team members
- **Kanban Board** — Visual task board with To Do / In Progress / Done columns
- **Task Management** — Title, description, due date, priority, assignee
- **Dashboard** — Live stats: total tasks, open tasks, overdue tasks, status breakdown
- **My Tasks** — Personal task view with filters (All / Open / Done / Overdue)
- **Team Page** — View all workspace members, Admins can change roles

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Deployment | Render |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── modules/
│   │   ├── auth/          # Register, Login endpoints
│   │   ├── projects/      # Project CRUD
│   │   ├── tasks/         # Task CRUD + Kanban
│   │   ├── teams/         # Member management
│   │   ├── dashboard/     # Aggregated stats
│   │   └── users/         # User list, My Tasks, Role management
│   ├── middleware/
│   │   ├── auth.js        # JWT validation middleware
│   │   ├── rbac.js        # Role-based access control
│   │   └── validate.js    # Request validation errors
│   ├── db.js              # SQLite connection + schema init
│   ├── router.js          # Top-level API router
│   └── server.js          # Express app entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx      # Stats overview
        │   ├── Projects.jsx       # Project list
        │   ├── ProjectDetail.jsx  # Kanban board
        │   ├── MyTasks.jsx        # Personal task view
        │   ├── Team.jsx           # Team members
        │   ├── Login.jsx
        │   └── Signup.jsx
        ├── components/
        │   ├── Layout.jsx         # Sidebar navigation
        │   └── ProtectedRoute.jsx
        ├── services/              # Axios API calls
        └── context/
            └── AuthContext.jsx    # Global auth state (JWT)
```

---

## 🗄 Database Schema

```sql
users         — id, email, display_name, password_hash, role, created_at
projects      — id, name, description, created_at
team_members  — id, project_id, user_id, role, joined_at
tasks         — id, project_id, assignee_id, title, description,
                status, priority, due_date, created_at, updated_at
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create task (Admin) |
| PATCH | `/api/projects/:id/tasks/:taskId` | Update task status |
| PUT | `/api/projects/:id/tasks/:taskId` | Full task update |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task (Admin) |

### Team & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/members` | List members |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |
| GET | `/api/users` | All users |
| GET | `/api/users/me/tasks` | My assigned tasks |
| PATCH | `/api/users/:id/role` | Change role (Admin) |
| GET | `/api/dashboard` | Dashboard stats |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set JWT_SECRET to any 32+ character string
npm start
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# Optional: create .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
# Runs on http://localhost:5173
```

---

## 🌐 Deployment

### Backend (Render Web Service)
1. Connect GitHub repo on [render.com](https://render.com)
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment variables:
   ```
   JWT_SECRET=your_secret_32_chars_minimum
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

### Frontend (Render Static Site)
1. Root Directory: `frontend`
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`
4. Environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens expire after **24 hours**
- All routes except `/auth/register` and `/auth/login` require valid JWT
- Project-scoped RBAC — roles enforced per project
- Input validation on all endpoints via `express-validator`
- CORS configured for frontend origin only

---

## 👤 Author

**Harshwardhan Sahu**  
GitHub: [@Harshwardhan0270](https://github.com/Harshwardhan0270)
