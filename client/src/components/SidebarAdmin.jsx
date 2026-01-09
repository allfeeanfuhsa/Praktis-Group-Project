import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const SidebarAdmin = () => {
    const navigate = useNavigate();

    // Fungsi Logout Sederhana
    const handleLogout = (e) => {
        e.preventDefault();
        const confirmLogout = window.confirm("Yakin ingin keluar?");
        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    return (
        <div className="bg-white" id="sidebar-wrapper">
            <div className="sidebar-heading text-center py-4 primary-text fs-4 fw-bold text-uppercase border-bottom">
                <i className="bi bi-shield-lock me-2"></i>Admin
            </div>

            <div className="list-group list-group-flush my-3">
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

                <button
                    onClick={handleLogout}
                    className="list-group-item list-group-item-action bg-transparent text-danger"
                >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
            </div>
        </div>
    );
};

export default SidebarAdmin;