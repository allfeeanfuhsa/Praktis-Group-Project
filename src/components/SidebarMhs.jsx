import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logoPA from '../assets/img/logo_pa.jpeg'; // Pastikan path logo benar

const SidebarMhs = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Yakin ingin keluar?")) {
       navigate('/'); // Kembali ke Login
    }
  };

  // Helper untuk class Active (agar kodingan lebih rapi)
  const activeClass = "list-group-item list-group-item-action bg-transparent rounded-3 mb-2 active text-primary fw-bold bg-primary bg-opacity-10";
  const inactiveClass = "list-group-item list-group-item-action bg-transparent rounded-3 mb-2 text-secondary";

  const subMenuActive = "list-group-item list-group-item-action bg-transparent border-0 py-2 small text-primary fw-bold";
  const subMenuInactive = "list-group-item list-group-item-action bg-transparent border-0 py-2 small text-muted";

  return (
    <div className="bg-white border-end" id="sidebar-wrapper">
        
        {/* LOGO */}
        <div className="sidebar-heading text-center py-4 border-bottom bg-white d-flex align-items-center justify-content-center" style={{ height: '100px' }}>
            <img 
                src={logoPA} 
                alt="Logo Praktis" 
                style={{ maxHeight: '60px', maxWidth: '80%' }} 
            />
        </div>
        
        {/* MENU LIST */}
        <div className="list-group list-group-flush px-3 py-4">
            
            {/* Dashboard Link */}
            <NavLink 
                to="/mahasiswa/dashboard" 
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
                <i className="bi bi-grid-fill me-2"></i>Dashboard
            </NavLink>
            
            <small className="text-muted fw-bold text-uppercase mt-4 mb-2 d-block px-2" style={{ fontSize: '0.75rem' }}>
                Kelas Saya
            </small>

            {/* COLLAPSE TRIGGER (E-Business) */}
            <a 
                href="#menuMhs" 
                data-bs-toggle="collapse" 
                className="list-group-item list-group-item-action bg-transparent fw-bold rounded-3 text-dark d-flex justify-content-between align-items-center"
                role="button"
                aria-expanded="true"
                aria-controls="menuMhs"
            >
                <span><i className="bi bi-journal-text me-2 text-primary"></i>E-Business</span>
                <i className="bi bi-chevron-down small"></i>
            </a>

            {/* COLLAPSE CONTENT */}
            <div className="collapse show mt-1 ps-3" id="menuMhs">
                 <div className="border-start border-2 ps-2">
                    
                    {/* Link Jadwal */}
                    <NavLink 
                        to="/mahasiswa/jadwal" 
                        className={({ isActive }) => isActive ? subMenuActive : subMenuInactive}
                    >
                        Jadwal Praktikum
                    </NavLink>

                    {/* Link Materi */}
                    <NavLink 
                        to="/mahasiswa/materi" 
                        className={({ isActive }) => isActive ? subMenuActive : subMenuInactive}
                    >
                        Download Materi
                    </NavLink>

                    {/* Link Tugas */}
                    <NavLink 
                        to="/mahasiswa/tugas" 
                        className={({ isActive }) => isActive ? subMenuActive : subMenuInactive}
                    >
                        Upload Tugas
                    </NavLink>

                 </div>
            </div>
        </div>

        {/* LOGOUT */}
        <div className="mt-auto p-3 border-top">
            <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger w-100 fw-bold btn-sm"
            >
                <i className="bi bi-box-arrow-left me-2"></i>Logout
            </button>
        </div>
    </div>
  );
};

export default SidebarMhs;