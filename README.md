# Praktis-Group-Project
Update:
- All frontend aspects are moved into client/ directory
- Added backend logic (in server/ directory; Haven't been thoroughly reviewed, though most of them works in Postman)

What we do next:
1. Review backend functionality thoroughly and do some patches whenever a misalignment occurs
2. Integrate backend with the frontend
3. Deploy on a web hosting provider
4. Testing


```
Praktis Project
├─ client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ src
│  │  ├─ api
│  │  │  └─ axiosInstance.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ css
│  │  │  │  ├─ login.css
│  │  │  │  └─ style.css
│  │  │  ├─ img
│  │  │  │  └─ logo_pa.jpeg
│  │  │  ├─ js
│  │  │  │  └─ script.js
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ footer.jsx
│  │  │  ├─ header.jsx
│  │  │  ├─ ProtectedRoute.jsx
│  │  │  ├─ SidebarAdmin.jsx
│  │  │  ├─ SidebarAsdos.jsx
│  │  │  └─ SidebarMhs.jsx
│  │  ├─ context
│  │  │  └─ authContext.jsx
│  │  ├─ index.css
│  │  ├─ layouts
│  │  │  ├─ LayoutAdmin.jsx
│  │  │  ├─ LayoutAsdos.jsx
│  │  │  └─ LayoutMhs.jsx
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ Dashboard.jsx
│  │  │  │  ├─ ManajemenAsdos.jsx
│  │  │  │  ├─ ManajemenPraktikum.jsx
│  │  │  │  └─ ManajemenUser.jsx
│  │  │  ├─ asdos
│  │  │  │  ├─ Dashboard.jsx
│  │  │  │  ├─ Jadwal.jsx
│  │  │  │  ├─ JadwalInput.jsx
│  │  │  │  ├─ Materi.jsx
│  │  │  │  ├─ MateriInput.jsx
│  │  │  │  ├─ Penilaian.jsx
│  │  │  │  ├─ Tugas.jsx
│  │  │  │  └─ TugasInput.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ Login.jsx
│  │  │  │  └─ RoleSelection.jsx
│  │  │  └─ mahasiswa
│  │  │     ├─ Dashboard.jsx
│  │  │     ├─ Jadwal.jsx
│  │  │     ├─ Materi.jsx
│  │  │     ├─ Tugas.jsx
│  │  │     └─ TugasUpload.jsx
│  │  └─ utils
│  │     ├─ api.js
│  │     └─ roleHelper.js
│  └─ vite.config.js
├─ README.md
└─ server
   ├─ config
   │  ├─ db.mongo.js
   │  ├─ db.sql.js
   │  └─ env.js
   ├─ controllers
   │  ├─ authController.js
   │  ├─ contentController.js
   │  ├─ praktikumController.js
   │  ├─ sessionController.js
   │  ├─ submissionController.js
   │  └─ userController.js
   ├─ middleware
   │  ├─ authMiddleware.js
   │  ├─ enrollmentMiddleware.js
   │  ├─ errorHandler.js
   │  ├─ rbacMiddleware.js
   │  └─ uploadMiddleware.js
   ├─ models
   │  ├─ nosql
   │  │  ├─ Materi.js
   │  │  ├─ Pengumpulan.js
   │  │  └─ Tugas.js
   │  └─ sql
   │     ├─ index.js
   │     ├─ Pertemuan.js
   │     ├─ Praktikum.js
   │     ├─ PraktikumUserRole.js
   │     ├─ Presensi.js
   │     ├─ PresensiStatus.js
   │     ├─ Role.js
   │     ├─ User.js
   │     └─ UserRole.js
   ├─ package-lock.json
   ├─ package.json
   ├─ routes
   │  ├─ adminRoutes.js
   │  ├─ authRoutes.js
   │  ├─ contentRoutes.js
   │  ├─ praktikumRoutes.js
   │  ├─ submissionRoutes.js
   │  └─ userRoutes.js
   ├─ seed.js
   ├─ server.js
   ├─ services
   │  ├─ authService.js
   │  ├─ gradingService.js
   │  └─ praktikumService.js
   └─ utils
      ├─ constants.js
      ├─ fileHelper.js
      └─ responseHelper.js

```