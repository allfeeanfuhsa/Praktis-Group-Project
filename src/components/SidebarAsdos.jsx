import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logoPA from '../assets/img/logo_pa.jpeg'; // Pastikan path gambarnya benar

const SidebarAsdos = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Yakin ingin keluar?")) {
       navigate('/'); 
    }
  };

  return (
    <div className="bg-white border-end" id="sidebar-wrapper">
        
        {/* LOGO SECTION */}
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
                to="/asdos/dashboard" 
                className={({ isActive }) => 
                    `list-group-item list-group-item-action bg-transparent rounded-3 mb-2 ${
                        isActive 
                        ? 'active text-primary fw-bold bg-primary bg-opacity-10' // Style saat aktif
                        : 'text-secondary' // Style saat tidak aktif
                    }`
                }
            >
                <i className="bi bi-grid-1x2-fill me-2"></i>Dashboard
            </NavLink>

            {/* Judul Kecil */}
            <small className="text-muted fw-bold text-uppercase mt-4 mb-2 d-block px-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Menu Praktikum
            </small>

            {/* COLLAPSE TRIGGER (E-Business) 
                Catatan: href="#" diganti button atau div agar tidak refresh halaman.
                Bootstrap JS akan menangani fungsi collapse lewat 'data-bs-toggle'
            */}
            <a 
                href="#menuEbiz" 
                data-bs-toggle="collapse" 
                className="list-group-item list-group-item-action bg-transparent fw-bold rounded-3 text-dark d-flex justify-content-between align-items-center"
                role="button"
                aria-expanded="true" // Default terbuka sesuai PHP Anda
                aria-controls="menuEbiz"
            >
                <span><i className="bi bi-journal-code me-2 text-primary"></i>E-Business</span>
                <i className="bi bi-chevron-down small"></i>
            </a>
            
            {/* COLLAPSE CONTENT */}
            {/* Class 'show' berarti menu ini terbuka secara default */}
            <div className="collapse show mt-1 ps-3" id="menuEbiz">
                <div className="border-start border-2 ps-2">
                    
                    {/* Link Jadwal */}
                    <NavLink 
                        to="/asdos/jadwal" 
                        className={({ isActive }) => 
                            `list-group-item list-group-item-action bg-transparent border-0 py-2 small ${
                                isActive ? 'text-primary fw-bold' : 'text-muted'
                            }`
                        }
                    >
                        Jadwal Lab
                    </NavLink>

                    {/* Link Materi */}
                    <NavLink 
                        to="/asdos/materi" 
                        className={({ isActive }) => 
                            `list-group-item list-group-item-action bg-transparent border-0 py-2 small ${
                                isActive ? 'text-primary fw-bold' : 'text-muted'
                            }`
                        }
                    >
                        Materi
                    </NavLink>

                    {/* Link Tugas */}
                    <NavLink 
                        to="/asdos/tugas" 
                        className={({ isActive }) => 
                            `list-group-item list-group-item-action bg-transparent border-0 py-2 small ${
                                isActive ? 'text-primary fw-bold' : 'text-muted'
                            }`
                        }
                    >
                        Tugas
                    </NavLink>

                </div>
            </div>
        </div>

        {/* LOGOUT BUTTON (Footer Sidebar) */}
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

export default SidebarAsdos;