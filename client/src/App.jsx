import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Auth
import Login from './pages/auth/Login'; 
import RoleSelection from './pages/auth/RoleSelection';

// Pages - Admin
import LayoutAdmin from './layouts/LayoutAdmin';
import DashboardAdmin from './pages/admin/Dashboard';
import ManajemenAsdos from './pages/admin/ManajemenAsdos';
import ManajemenUser from './pages/admin/ManajemenUser';
import ManajemenPraktikum from './pages/admin/ManajemenPraktikum';

// Pages - Asdos
import LayoutAsdos from './layouts/LayoutAsdos';
import DashboardAsdos from './pages/asdos/Dashboard';
import JadwalAsdos from './pages/asdos/Jadwal'; // This is the new "Timeline" page
import MateriAsdos from './pages/asdos/Materi';
import TugasAsdos from './pages/asdos/Tugas';
import PenilaianAsdos from './pages/asdos/Penilaian';
import SessionDetail from './pages/asdos/SessionDetail';
// Note: 'ManajemenModul' and 'JadwalInput' are removed because they are merged into JadwalAsdos

// Pages - Mahasiswa
import LayoutMhs from './layouts/LayoutMhs';
import DashboardMhs from './pages/mahasiswa/Dashboard';
import JadwalMhs from './pages/mahasiswa/Jadwal';
import MateriMhs from './pages/mahasiswa/Materi';
import TugasMhs from './pages/mahasiswa/Tugas';
import TugasUpload from './pages/mahasiswa/TugasUpload';
import SessionDetailMhs from './pages/mahasiswa/SessionDetail';

function App() {
  return (
    <Routes>
      
      {/* --- Public Routes --- */}
      <Route path="/" element={<Login />} />
      <Route path="/auth/login" element={<Login />} />

      {/* --- Role Selection --- */}
      <Route 
        path="/auth/role-selection" 
        element={
          <ProtectedRoute>
             <RoleSelection />
          </ProtectedRoute>
        } 
      />

      {/* --- Admin Routes --- */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><LayoutAdmin /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="asdos-manager" element={<ManajemenAsdos />} />
        <Route path="users" element={<ManajemenUser />} />
        <Route path="praktikum" element={<ManajemenPraktikum />} />
      </Route>


      {/* --- Asdos Routes (UPDATED) --- */}
      <Route path="/asdos" element={<ProtectedRoute allowedRoles={['asdos']}><LayoutAsdos /></ProtectedRoute>}>
        
        <Route path="dashboard" element={<DashboardAsdos />} />
        
        {/* 1. DYNAMIC JADWAL ROUTE */}
        {/* Matches sidebar link: /asdos/kelas/1/jadwal */}
        <Route path="kelas/:id_praktikum/jadwal" element={<JadwalAsdos />} />

        {/* 2. OTHER DYNAMIC ROUTES (Placeholders for now) */}
        <Route path="kelas/:id_praktikum/materi" element={<MateriAsdos />} />
        <Route path="kelas/:id_praktikum/tugas" element={<TugasAsdos />} />
        
        {/* 3. SESSION DETAIL (Where we will upload files later) */}
        <Route path="session/:id_pertemuan" element={<SessionDetail />} />

        {/* Legacy/Static Routes (Keep if you still need them for generic lists) */}
        <Route path="kelas/:id_praktikum/tugas/:id_tugas/grade" element={<PenilaianAsdos />} />
        
      </Route>


      {/* --- Mahasiswa Routes --- */}
      <Route path="/mahasiswa" element={<ProtectedRoute allowedRoles={['mahasiswa']}><LayoutMhs /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardMhs />} />
        <Route path="jadwal" element={<JadwalMhs />} />
        <Route path="materi" element={<MateriMhs />} />
        <Route path="tugas" element={<TugasMhs />} />
        <Route path="tugas/upload" element={<TugasUpload />} />

        <Route path="kelas/:id_praktikum" element={<JadwalMhs />} />
        <Route path="session/:id_pertemuan" element={<SessionDetailMhs />} />
      </Route>

    </Routes>
  );
}

export default App;