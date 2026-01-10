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
Prerequisites: Node.js (>=16), npm, MongoDB instance, MySQL (optional depending on features).

1) Start backend

```powershell
cd server
npm install
# create or provide environment config (see server/config/env.js)
# run dev server (nodemon):
npm run dev
```

2) Start frontend

```powershell
cd client
npm install
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
- Typical environment variables to provide: MongoDB URI, MySQL credentials, JWT secret, server port, upload folder path.

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
