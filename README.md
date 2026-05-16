# Ethara – Team Task Manager

A full-stack Team Task Management web application built with React, Node.js, Express, and MongoDB.

🌐 **Live App:** https://team-task-management-web-app-production-7193.up.railway.app  
📁 **GitHub:** https://github.com/harsh-singh-kanyal/Team-Task-Management-Web-Application

---

## Features

- **User Authentication** – Signup/Login with JWT-based secure sessions
- **Project Management** – Create projects, add/remove members, track progress
- **Task Management** – Create tasks with Title, Description, Due Date, Priority; assign to team members; update status (To Do → In Progress → In Review → Done)
- **Dashboard Analytics** – Total tasks, tasks by status, tasks per user, overdue tasks with charts
- **Role-Based Access Control (RBAC)**:
  - **Admin** – Create/edit/delete tasks, manage all users and projects
  - **Member** – View projects, update only their assigned tasks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Vite, Framer Motion, Recharts |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Authentication | JWT (jsonwebtoken) |
| Deployment | Railway (full-stack monorepo) |
| Styling | Vanilla CSS with glassmorphism design |

---

## Project Structure

```
ethara-task-manager/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Login, Signup, Dashboard, Projects, ProjectBoard, MyTasks, Team, ManageTeam
│   │   ├── components/      # AppLayout (sidebar + topbar)
│   │   ├── context/         # AuthContext (JWT management)
│   │   └── utils/           # Axios API instance
│   └── package.json
├── server/                  # Express backend
│   ├── routes/              # auth, users, projects, tasks, dashboard
│   ├── models/              # User, Project, Task (Mongoose schemas)
│   ├── middleware/          # auth.js (JWT verification, RBAC)
│   └── index.js             # Entry point
├── package.json             # Root build scripts
└── railway.toml             # Railway deployment config
```

---

## Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/harsh-singh-kanyal/Team-Task-Management-Web-Application.git
cd Team-Task-Management-Web-Application
```

### 2. Configure Environment Variables

Create `server/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ethara
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### 4. Run in Development Mode
```bash
# Terminal 1 – Start backend
npm run dev:server

# Terminal 2 – Start frontend
npm run dev:client
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000

---

## Deployment on Railway

This project is configured for Railway monorepo deployment.

### Steps:
1. Push code to GitHub
2. Create a new Railway project → connect GitHub repo
3. Set environment variables in Railway dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Railway auto-detects `railway.toml` and runs:
   - **Build:** `npm install --include=dev --prefix client && npm run build --prefix client`
   - **Start:** `node server/index.js`

The Express server serves the built React app as static files in production.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | JWT |
| GET | `/api/projects` | List all projects | JWT |
| POST | `/api/projects` | Create project | JWT + Admin |
| GET | `/api/projects/:id/tasks` | Get project tasks | JWT |
| POST | `/api/projects/:id/tasks` | Create task | JWT + Admin/Owner |
| PUT | `/api/tasks/:id` | Update task | JWT + Admin/Assignee |
| DELETE | `/api/tasks/:id` | Delete task | JWT + Admin |
| GET | `/api/dashboard/stats` | Dashboard analytics | JWT |
| GET | `/api/users` | List all users | JWT |

---

## Assignment Compliance

✅ User Authentication (JWT)  
✅ Project Management with member roles  
✅ Task Management (Title, Description, Due Date, Priority, Assignee, Status)  
✅ Dashboard with analytics  
✅ Role-Based Access Control (Admin/Member)  
✅ RESTful API with validation  
✅ MongoDB with proper relationships  
✅ Deployed on Railway  
✅ Environment variables properly configured  
