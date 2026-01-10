import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../utils/api'; // Import API helper
import logoPA from '../assets/img/logo_pa.jpeg';

const SidebarMhs = () => {
    const { logout } = useAuth();
    const { id_praktikum } = useParams(); // Get current class ID from URL (if any)
    const location = useLocation(); // To track active routes for highlighting

    // State to store the list of classes
    const [classList, setClassList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Enrolled Classes on Mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // We use the dashboard endpoint to get the list of enrolled classes
                const response = await api.get('/api/users/mahasiswa-dashboard');
                
                // Assuming response.data.classes or response.data contains the array
                // Adjust 'enrolledClasses' based on your actual Controller response structure
                const classes = response.data.enrolledClasses || response.data || [];
                setClassList(classes);
            } catch (error) {
                console.error("Failed to fetch sidebar classes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        if (window.confirm("Yakin ingin keluar?")) {
            logout();
        }
    };

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

                {/* 1. Main Dashboard */}
                <NavLink 
                    to="/mahasiswa/dashboard"
                    className={({ isActive }) => 
                        `list-group-item list-group-item-action bg-transparent fw-bold rounded-3 mb-1 ${isActive ? 'text-primary' : 'text-dark'}`
                    }
                >
                    <i className="bi bi-grid-fill me-2"></i>Dashboard
                </NavLink>

                {/* 2. List of Classes */}
                <small className="text-muted fw-bold text-uppercase mt-4 mb-2 d-block px-2" style={{ fontSize: '0.75rem' }}>
                    Kelas Saya
                </small>

                {loading ? (
                    <div className="text-center py-2 text-muted small">Loading...</div>
                ) : classList.length === 0 ? (
                    <div className="text-muted small px-2">Belum ada kelas</div>
                ) : (
                    classList.map((cls) => {
                        // Check if this specific class is currently active in the URL
                        // Note: cls.id might vary (id, id_praktikum, praktikum_id) based on your DB. 
                        // Using 'id_praktikum' as per your API patterns.
                        const isClassActive = id_praktikum === String(cls.id_praktikum);
                        
                        return (
                            <div key={cls.id_praktikum} className="mb-1">
                                {/* Class Name Trigger */}
                                <a
                                    href={`#menu-${cls.id_praktikum}`}
                                    data-bs-toggle="collapse"
                                    className={`list-group-item list-group-item-action bg-transparent fw-bold rounded-3 d-flex justify-content-between align-items-center ${isClassActive ? 'text-primary' : 'text-dark'}`}
                                    role="button"
                                    aria-expanded={isClassActive}
                                    aria-controls={`menu-${cls.id_praktikum}`}
                                >
                                    <span className="text-truncate" style={{maxWidth: '180px'}}>
                                        <i className="bi bi-journal-text me-2"></i>
                                        {cls.nama_praktikum}
                                    </span>
                                    <i className={`bi bi-chevron-down small ${isClassActive ? '' : 'text-muted'}`}></i>
                                </a>

                                {/* Sub Menu (Jadwal, Materi, Tugas) */}
                                <div 
                                    className={`collapse ${isClassActive ? 'show' : ''} mt-1 ps-3`} 
                                    id={`menu-${cls.id_praktikum}`}
                                >
                                    <div className="border-start border-2 ps-2">
                                        <NavLink
                                            to={`/mahasiswa/kelas/${cls.id_praktikum}/jadwal`}
                                            className={({ isActive }) => isActive ? subMenuActive : subMenuInactive}
                                        >
                                            Jadwal
                                        </NavLink>

                                        <NavLink
                                            to={`/mahasiswa/kelas/${cls.id_praktikum}/materi`}
                                            className={({ isActive }) => isActive ? subMenuActive : subMenuInactive}
                                        >
                                            Materi
                                        </NavLink>

                                        <NavLink
                                            to={`/mahasiswa/kelas/${cls.id_praktikum}/tugas`}
                                            className={({ isActive }) => isActive ? subMenuActive : subMenuInactive}
                                        >
                                            Tugas
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

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