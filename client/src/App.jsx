import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- 1. IMPORT PAGES (HALAMAN ASLI) ---
import Login from './pages/auth/Login'; 
import DashboardAdmin from './pages/admin/Dashboard'; // <-- INI BARU (Dashboard Admin Asli)
import VerifikasiAsdos from './pages/admin/VerifikasiAsdos';
// --- 2. IMPORT LAYOUTS (WADAH UTAMA) ---
import LayoutAdmin from './layouts/LayoutAdmin'; // <-- Layout Admin
import LayoutAsdos from './layouts/LayoutAsdos'; // Layout Asdos
import LayoutMhs from './layouts/LayoutMhs';     // Layout Mahasiswa


// --- 3. DASHBOARD ---
import DashboardAsdos from './pages/asdos/Dashboard';
import JadwalAsdos from './pages/asdos/Jadwal'; 
import JadwalInput from './pages/asdos/JadwalInput';
import MateriAsdos from './pages/asdos/Materi';
import MateriInput from './pages/asdos/MateriInput';
import TugasAsdos from './pages/asdos/Tugas';
import TugasInput from './pages/asdos/TugasInput';
import PenilaianAsdos from './pages/asdos/Penilaian';

import DashboardMhs from './pages/mahasiswa/Dashboard';
import JadwalMhs from './pages/mahasiswa/Jadwal';
import MateriMhs from './pages/mahasiswa/Materi';
import TugasMhs from './pages/mahasiswa/Tugas';
import TugasUpload from './pages/mahasiswa/TugasUpload';
function App() {
  return (
    <Router>
      <Routes>
        
        {/* === RUTE 1: LOGIN (HALAMAN PERTAMA) === */}
        <Route path="/" element={<Login />} />
        

        {/* === RUTE 2: ADMIN === */}
        {/* Semua link yang depannya /admin akan pakai LayoutAdmin (Sidebar Admin) */}
        <Route path="/admin" element={<LayoutAdmin />}>
            {/* Link: /admin/dashboard */}
            <Route path="dashboard" element={<DashboardAdmin />} />
            
            {/* Link: /admin/verifikasi (Masih dummy) */}
            <Route path="verifikasi" element={<VerifikasiAsdos />} />
        </Route>


        {/* === RUTE 3: ASDOS === */}
        {/* Semua link yang depannya /asdos akan pakai LayoutAsdos */}
        <Route path="/asdos" element={<LayoutAsdos />}>
            <Route path="dashboard" element={<DashboardAsdos />} />
            
            {/* --- 2. TAMBAHKAN RUTE INI --- */}
            <Route path="jadwal" element={<JadwalAsdos />} />
            
            <Route path="jadwal/input" element={<JadwalInput />} />

            <Route path="materi" element={<MateriAsdos />} />

            <Route path="materi/input" element={<MateriInput />} />

            <Route path="tugas" element={<TugasAsdos />} />

            <Route path="tugas/input" element={<TugasInput />} />

            <Route path="penilaian" element={<PenilaianAsdos />} />
        </Route>


        {/* === RUTE 4: MAHASISWA === */}
        {/* Semua link yang depannya /mahasiswa akan pakai LayoutMhs */}
        <Route path="/mahasiswa" element={<LayoutMhs />}>
            {/* Menggunakan DashboardMhs yang asli sekarang */}
            <Route path="dashboard" element={<DashboardMhs />} />

            <Route path="jadwal" element={<JadwalMhs />} />

            <Route path="materi" element={<MateriMhs />} />

            <Route path="tugas" element={<TugasMhs />} />

            <Route path="tugas/upload" element={<TugasUpload />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;