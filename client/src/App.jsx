import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login'; 
import RoleSelection from './pages/auth/RoleSelection'; // Imported correctly

// Admin Pages & Layouts
import LayoutAdmin from './layouts/LayoutAdmin';
import DashboardAdmin from './pages/admin/Dashboard';
import VerifikasiAsdos from './pages/admin/VerifikasiAsdos';

// Asdos Pages & Layouts
import LayoutAsdos from './layouts/LayoutAsdos';
import DashboardAsdos from './pages/asdos/Dashboard';
import JadwalAsdos from './pages/asdos/Jadwal'; 
import JadwalInput from './pages/asdos/JadwalInput';
import MateriAsdos from './pages/asdos/Materi';
import MateriInput from './pages/asdos/MateriInput';
import TugasAsdos from './pages/asdos/Tugas';
import TugasInput from './pages/asdos/TugasInput';
import PenilaianAsdos from './pages/asdos/Penilaian';

// Mahasiswa Pages & Layouts
import LayoutMhs from './layouts/LayoutMhs';
import DashboardMhs from './pages/mahasiswa/Dashboard';
import JadwalMhs from './pages/mahasiswa/Jadwal';
import MateriMhs from './pages/mahasiswa/Materi';
import TugasMhs from './pages/mahasiswa/Tugas';
import TugasUpload from './pages/mahasiswa/TugasUpload';

function App() {
  return (
    <Routes>
      
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/auth/login" element={<Login />} />

      {/* Role Selection - Protected so only logged-in users see it */}
      <Route 
        path="/auth/role-selection" 
        element={
          <ProtectedRoute>
             <RoleSelection />
          </ProtectedRoute>
        } 
      />

      {/* --- Admin Routes --- */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="verifikasi" element={<VerifikasiAsdos />} />
      </Route>


      {/* --- Asdos Routes --- */}
      <Route 
        path="/asdos" 
        element={
          <ProtectedRoute allowedRoles={['asdos']}>
            <LayoutAsdos />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardAsdos />} />
        <Route path="jadwal" element={<JadwalAsdos />} />
        <Route path="jadwal/input" element={<JadwalInput />} />
        <Route path="materi" element={<MateriAsdos />} />
        <Route path="materi/input" element={<MateriInput />} />
        <Route path="tugas" element={<TugasAsdos />} />
        <Route path="tugas/input" element={<TugasInput />} />
        <Route path="penilaian" element={<PenilaianAsdos />} />
      </Route>


      {/* --- Mahasiswa Routes --- */}
      <Route 
        path="/mahasiswa" 
        element={
          <ProtectedRoute allowedRoles={['mahasiswa']}>
            <LayoutMhs />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardMhs />} />
        <Route path="jadwal" element={<JadwalMhs />} />
        <Route path="materi" element={<MateriMhs />} />
        <Route path="tugas" element={<TugasMhs />} />
        <Route path="tugas/upload" element={<TugasUpload />} />
      </Route>

    </Routes>
  );
}

export default App;