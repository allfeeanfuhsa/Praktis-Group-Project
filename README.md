## Praktis Group Project — E‑Business & Web Programming

Short summary
---------------
This repository contains a full-stack student practical management system built for a university practicals course. The frontend is a React + Vite single-page app in the `client/` folder. The backend is an Express-based API in the `server/` folder that uses MongoDB (for document data like materials/submissions) and a relational DB via Sequelize/mysql2 for core relational models.

Key features
------------
- Role-based access: Admin, Asdos (assistant), Mahasiswa (student)
- Authentication with JWT
- Manage praktikum, sessions, materials, tasks, submissions, and attendance
- File upload handling for materials and task submissions

Architecture & Tech
-------------------
- Frontend: React, Vite, React Router, Axios, Bootstrap
- Backend: Node.js, Express, Sequelize (MySQL), Mongoose (MongoDB), JWT
- File storage: `server/uploads/*` (materials, submissions, tasks)

Quick start (development)
-------------------------
Prerequisites: Node.js (>=16), npm, MongoDB instance, MySQL/MariaDB.

### 1. Backend Setup

```powershell
cd server
npm install
```

**Crucial Step:** Create a `.env` file in the `server` directory (you can copy `.env.example`).
> [!WARNING]
> Windows users: Port 5000 is often reserved by a background System process. To avoid `403 Forbidden` CORS errors or `EADDRINUSE` crashes, **always set the backend PORT to 5001**.

Example `server/.env`:
```env
PORT=5001
NODE_ENV=development
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASS=root
MYSQL_DB_NAME=praktis_prj
MYSQL_DIALECT=mysql
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=SBDL
JWT_SECRET=your_super_secret_key_change_this_in_production
ADMIN_PASSWORD=ChangeMe@123456
ALLOWED_ORIGINS=http://localhost:5173
```

**Initialize Database (Seeding):**
We provide a minimalistic seeder to easily populate your database with dummy data so you can test the application immediately.
```powershell
npm run seed
```
This will create:
- **Admin**: `admin@admin.com` (Pass: `ChangeMe@123456`)
- **Asdos**: `asdos@asdos.com` (Pass: `ChangeMe@123456`)
- **Mahasiswa**: `mhs@mhs.com` (Pass: `ChangeMe@123456`)
- A dummy Praktikum class with enrollments and a session.

Start the backend:
```powershell
npm run dev
```

### 2. Frontend Setup

Open a **new terminal**:
```powershell
cd client
npm install
```

**Crucial Step:** Create a `.env.development` file in the `client` directory to point to the new backend port.
Example `client/.env.development`:
```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:
```powershell
npm run dev
```

Important scripts
-----------------
- Server (see [server/package.json](server/package.json#L1)):
   - `npm run dev` — start server with `nodemon` (development)
   - `npm start` — start server node
   - `npm run seed` — run seed script
- Client (see [client/package.json](client/package.json#L1)):
   - `npm run dev` — run Vite dev server
   - `npm run build` — build for production
   - `npm run preview` — preview production build

Configuration
-------------
- Backend config files: [server/config/env.js](server/config/env.js), [server/config/db.mongo.js](server/config/db.mongo.js), [server/config/db.sql.js](server/config/db.sql.js).
- Ensure your `JWT_SECRET`, `MONGO_URI`, and `MYSQL_*` credentials match your local setup.
- If you encounter a `403 Forbidden` CORS error on login, double-check that `VITE_API_URL` in the frontend exactly matches the backend's `PORT` (e.g., 5001) and that the backend isn't colliding with Windows port 5000.

Key folders & files
-------------------
- `client/` — React frontend source
   - `src/` — app code, components, pages, layouts
   - `src/api/axiosInstance.js` — configured Axios instance
- `server/` — backend API
   - `server/routes/` — route definitions (authRoutes, adminRoutes, contentRoutes, submissionRoutes, userRoutes)
   - `server/controllers/` — request handlers
   - `server/middleware/` — auth, RBAC, file uploads, error handling
   - `server/models/` — SQL & NoSQL model definitions

Authentication & Roles
----------------------
Authentication uses JWT tokens. Role checks are enforced via RBAC middleware (`server/middleware/rbacMiddleware.js`) and `authMiddleware.js`. The frontend uses `authContext.jsx` to store token and user info per session.

Notes & next steps
------------------
- Review and set environment variables before running the server.
- Ensure DBs (MongoDB and MySQL) are reachable and migrations/seeds run as needed.
- Consider securing uploads and using cloud storage for production.
