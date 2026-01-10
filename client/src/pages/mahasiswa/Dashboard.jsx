import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    // Initialize stats with defaults to prevent errors
    const [stats, setStats] = useState({ activeClasses: 0, assignmentsPending: 0 });
    const [myClasses, setMyClasses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/users/mahasiswa-dashboard');
                
                // === FIX 1: MATCH THE CONTROLLER KEYS ===
                // Controller sends: { stats: {...}, enrolledClasses: [...] }
                setStats(res.data.stats || { activeClasses: 0, assignmentsPending: 0 });
                
                // === FIX 2: HANDLE VARIABLE NAME & SAFETY CHECK ===
                // Use 'enrolledClasses' and default to empty array if missing
                setMyClasses(res.data.enrolledClasses || []); 

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-dark">Halo, Mahasiswa! 👋</h2>
                <p className="text-muted">Selamat datang di dashboard praktikum.</p>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase">Kelas Diambil</h6>
                                <h2 className="fw-bold text-primary mb-0">{stats.activeClasses}</h2>
                            </div>
                            <i className="bi bi-book fs-1 text-primary opacity-25"></i>
                        </div>
                    </div>
                </div>
                {/* Note: assignmentsPending logic isn't fully built in backend yet, 
                   so it might stay 0 for now. That is fine. 
                */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase">Tugas Pending</h6>
                                <h2 className="fw-bold text-danger mb-0">{stats.assignmentsPending}</h2>
                            </div>
                            <i className="bi bi-alarm fs-1 text-danger opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Class List */}
            <h5 className="fw-bold mb-3">Kelas Praktikum Saya</h5>
            
            {loading ? (
                <div className="text-center py-5 text-muted">Loading data...</div>
            ) : !myClasses || myClasses.length === 0 ? (
                <div className="alert alert-warning">
                    Kamu belum terdaftar di kelas praktikum manapun.
                </div>
            ) : (
                <div className="row g-3">
                    {myClasses.map(cls => (
                        <div key={cls.id_praktikum} className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="badge bg-primary bg-opacity-10 text-primary">
                                            {cls.kode || cls.kode_kelas}
                                        </span>
                                        {/* Fallback for fields that might be missing */}
                                        <small className="text-muted">
                                            {cls.jadwal || 'Jadwal belum diatur'}
                                        </small>
                                    </div>
                                    <h5 className="fw-bold mb-1">{cls.nama_praktikum || cls.mata_kuliah}</h5>
                                    
                                    <p className="text-muted small mb-3">
                                        {/* You can add more info here later */}
                                        <i className="bi bi-person-video3 me-2"></i>Praktikum Aktif
                                    </p>

                                    {/* === FIX 3: DIRECT LINK TO A SUB-PAGE === */}
                                    {/* Linking directly to /kelas/ID/jadwal because /kelas/ID doesn't exist */}
                                    <Link 
                                        to={`/mahasiswa/kelas/${cls.id_praktikum}/jadwal`} 
                                        className="btn btn-outline-primary w-100 fw-bold"
                                    >
                                        Masuk Kelas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;