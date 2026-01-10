import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../utils/api'; // Use your API utility
import logoPA from '../assets/img/logo_pa.jpeg';

const SidebarAsdos = () => {
    const { logout } = useAuth();
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch classes assigned to this Asdos
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/api/users/asdos-dashboard');
                setMyClasses(res.data.myClasses);
            } catch (error) {
                console.error("Sidebar load error", error);
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

    return (
        <div className="bg-white border-end" id="sidebar-wrapper">

            {/* LOGO SECTION */}
            <div className="sidebar-heading text-center py-4 border-bottom bg-white d-flex align-items-center justify-content-center" style={{ height: '100px' }}>
                <img src={logoPA} alt="Logo Praktis" style={{ maxHeight: '60px', maxWidth: '80%' }} />
            </div>

            {/* MENU LIST */}
            <div className="list-group list-group-flush px-3 py-4">

                {/* Dashboard Link (General) */}
                <NavLink
                    to="/asdos/dashboard"
                    className={({ isActive }) =>
                        `list-group-item list-group-item-action bg-transparent rounded-3 mb-2 ${isActive ? 'active text-primary fw-bold bg-primary bg-opacity-10' : 'text-secondary'}`
                    }
                >
                    <i className="bi bi-grid-1x2-fill me-2"></i>Dashboard
                </NavLink>

                {/* DYNAMIC CLASS MENU */}
                {loading ? (
                    <div className="text-center py-3 small text-muted">Loading Menu...</div>
                ) : myClasses.length === 0 ? (
                    <div className="text-center py-3 small text-muted">Belum ada kelas assigned.</div>
                ) : (
                    <>
                        <small className="text-muted fw-bold text-uppercase mt-4 mb-2 d-block px-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            Kelas Diampu
                        </small>

                        {myClasses.map((cls) => (
                            <div key={cls.id_praktikum} className="mb-2">
                                {/* COLLAPSE TRIGGER */}
                                <a
                                    href={`#menu-${cls.id_praktikum}`}
                                    data-bs-toggle="collapse"
                                    className="list-group-item list-group-item-action bg-transparent fw-bold rounded-3 text-dark d-flex justify-content-between align-items-center"
                                    role="button"
                                    aria-expanded="false"
                                    aria-controls={`menu-${cls.id_praktikum}`}
                                >
                                    <span className="text-truncate" title={cls.mata_kuliah}>
                                        <i className="bi bi-journal-code me-2 text-primary"></i>
                                        {cls.mata_kuliah}
                                    </span>
                                    <i className="bi bi-chevron-down small"></i>
                                </a>

                                {/* COLLAPSE CONTENT */}
                                <div className="collapse" id={`menu-${cls.id_praktikum}`}>
                                    <div className="border-start border-2 ps-2 mt-1">
                                        
                                        {/* 1. JADWAL (The Timeline) */}
                                        <NavLink
                                            to={`/asdos/kelas/${cls.id_praktikum}/jadwal`}
                                            className={({ isActive }) =>
                                                `list-group-item list-group-item-action bg-transparent border-0 py-2 small ${isActive ? 'text-primary fw-bold' : 'text-muted'}`
                                            }
                                        >
                                            Jadwal & Sesi
                                        </NavLink>

                                        {/* 2. MATERI (Content Bank) */}
                                        <NavLink
                                            to={`/asdos/kelas/${cls.id_praktikum}/materi`}
                                            className={({ isActive }) =>
                                                `list-group-item list-group-item-action bg-transparent border-0 py-2 small ${isActive ? 'text-primary fw-bold' : 'text-muted'}`
                                            }
                                        >
                                            Bank Materi
                                        </NavLink>

                                        {/* 3. TUGAS (Assignments) */}
                                        <NavLink
                                            to={`/asdos/kelas/${cls.id_praktikum}/tugas`}
                                            className={({ isActive }) =>
                                                `list-group-item list-group-item-action bg-transparent border-0 py-2 small ${isActive ? 'text-primary fw-bold' : 'text-muted'}`
                                            }
                                        >
                                            Daftar Tugas
                                        </NavLink>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* LOGOUT */}
            <div className="mt-auto p-3 border-top">
                <button onClick={handleLogout} className="btn btn-outline-danger w-100 fw-bold btn-sm">
                    <i className="bi bi-box-arrow-left me-2"></i>Logout
                </button>
            </div>
        </div>
    );
};

export default SidebarAsdos;