import React from 'react';
import { useAuth } from '../context/authContext';
import SidebarNavLink from './SidebarNavLink';

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
                <SidebarNavLink 
                    to="/admin/dashboard" 
                    icon="bi-speedometer2" 
                    label="Dashboard" 
                />

                <SidebarNavLink 
                    to="/admin/asdos-manager" 
                    icon="bi-person-badge" 
                    label="Manajemen Asdos" 
                />

                <SidebarNavLink 
                    to="/admin/users" 
                    icon="bi-people" 
                    label="Manajemen User" 
                />

                <SidebarNavLink 
                    to="/admin/praktikum" 
                    icon="bi-journal-bookmark" 
                    label="Manajemen Praktikum" 
                />

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