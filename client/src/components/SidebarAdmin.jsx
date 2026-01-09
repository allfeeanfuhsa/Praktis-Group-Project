import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // 1. Import Context

const SidebarAdmin = () => {
    // 2. Get logout function from context
    const { logout } = useAuth();

    const handleLogout = (e) => {
        e.preventDefault();
        if (window.confirm("Yakin ingin keluar?")) {
            logout(); // 3. Use the robust logout function
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
                    to="/admin/asdos-manager"
                    className={({ isActive }) =>
                        `list-group-item list-group-item-action bg-transparent ${isActive ? 'active' : ''}`
                    }
                >
                    {/* Changed icon and text */}
                    <i className="bi bi-person-badge me-2"></i>Manajemen Asdos
                </NavLink>

                {/* --- NEW LINK: Manajemen User --- */}
                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        `list-group-item list-group-item-action bg-transparent ${isActive ? 'active' : ''}`
                    }
                >
                    <i className="bi bi-people me-2"></i>Manajemen User
                </NavLink>

                {/* --- NEW LINK: Manajemen Praktikum --- */}
                <NavLink
                    to="/admin/praktikum"
                    className={({ isActive }) => `list-group-item list-group-item-action bg-transparent ${isActive ? 'active' : ''}`}
                >
                    <i className="bi bi-journal-bookmark me-2"></i>Manajemen Praktikum
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="list-group-item list-group-item-action bg-transparent text-danger border-0"
                >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
            </div>
        </div>
    );
};

export default SidebarAdmin;