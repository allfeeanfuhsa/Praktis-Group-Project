import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const SidebarAdmin = () => {
  const navigate = useNavigate();

  // Fungsi Logout Sederhana
  const handleLogout = (e) => {
    e.preventDefault();
    // Di sini nanti kita hapus token login (jika ada)
    // Lalu lempar balik ke halaman login
    const confirmLogout = window.confirm("Yakin ingin keluar?");
    if (confirmLogout) {
      navigate('/'); 
    }
  };

  return (
    <div className="bg-white" id="sidebar-wrapper">
        <div className="sidebar-heading text-center py-4 primary-text fs-4 fw-bold text-uppercase border-bottom">
            <i className="bi bi-shield-lock me-2"></i>Admin
        </div>
        
        <div className="list-group list-group-flush my-3">
            {/* NavLink menggantikan <a href>.
                Fitur Keren: Otomatis menambahkan class 'active' jika URL cocok.
                Kita gunakan logika: Jika isActive, tambah class 'active', jika tidak kosongkan.
            */}
            
            <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => 
                    `list-group-item list-group-item-action bg-transparent ${isActive ? 'active' : ''}`
                }
            >
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </NavLink>

            <NavLink 
                to="/admin/verifikasi" 
                className={({ isActive }) => 
                    `list-group-item list-group-item-action bg-transparent ${isActive ? 'active' : ''}`
                }
            >
                <i className="bi bi-person-check me-2"></i>Verifikasi Asdos
            </NavLink>

            {/* Tombol Logout (Merah) */}
            <a 
                href="#" 
                onClick={handleLogout} 
                className="list-group-item list-group-item-action bg-transparent text-danger fw-bold mt-5"
            >
                <i className="bi bi-box-arrow-left me-2"></i>Logout
            </a>
        </div>
    </div>
  );
};

export default SidebarAdmin;