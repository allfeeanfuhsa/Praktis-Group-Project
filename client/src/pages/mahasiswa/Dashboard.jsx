import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/authContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [myClasses, setMyClasses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/users/mahasiswa-dashboard');
                setMyClasses(res.data.enrolledClasses || []); 
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) {
        return (
            <div className="text-center py-5 text-light">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading data...</span>
                </div>
                <p className="opacity-75 mt-3 small">Memuat dashboard praktikum...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* CENTERED HEADER */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center mt-4">
                <h2 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: '-1px' }}>
                    Selamat Datang, {user?.nama || 'Mahasiswa'}! 👋
                </h2>
                <p className="text-light opacity-75 fs-5 fw-light" style={{ maxWidth: '650px', margin: '0 auto' }}>
                    Pilih kelas praktikum Anda di bawah ini untuk mengakses jadwal, bank materi, penugasan, dan rekapitulasi.
                </p>
            </motion.div>

            {/* CLASS CARDS GRID HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0 text-white">
                    <i className="bi bi-grid-fill me-2 text-info"></i>Kelas Praktikum Anda
                </h4>
            </div>

            {!myClasses || myClasses.length === 0 ? (
                <div className="glass-card static rounded-4 p-5 text-center text-white">
                    <i className="bi bi-journal-x fs-1 d-block mb-3 opacity-50 text-warning"></i>
                    <h5 className="fw-bold mb-2">Belum Terdaftar</h5>
                    <p className="text-light opacity-75 mb-0">Kamu belum terdaftar di kelas praktikum manapun. Silakan hubungi Admin atau Asisten Dosen.</p>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4 justify-content-center">
                    {myClasses.map((cls) => (
                        <motion.div variants={itemVariants} key={cls.id_praktikum} className="col-md-6 col-lg-4">
                            <Link 
                                to={`/mahasiswa/kelas/${cls.id_praktikum}/jadwal`} 
                                className="glass-card rounded-4 p-4 h-100 d-flex flex-column text-decoration-none"
                            >
                                {/* Card Header: Code & Year */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                                        Kelas {cls.kode || cls.kode_kelas || 'A'}
                                    </span>
                                    <span className="text-light opacity-75 small fw-bold">
                                        {cls.tahun_pelajaran || '2023/2024'}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="fw-bold text-white mb-4 text-truncate" title={cls.nama_praktikum}>
                                    {cls.nama_praktikum || cls.mata_kuliah}
                                </h3>

                                {/* Embedded Info List */}
                                <div className="mt-auto">
                                    {/* Next Session Date */}
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="glass-card static rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.1)' }}>
                                            <i className="bi bi-calendar-event text-info fs-5"></i>
                                        </div>
                                        <div>
                                            <div className="small text-light opacity-75 mb-0 lh-1">Sesi Berikutnya</div>
                                            <div className="fw-bold text-white mt-1">
                                                {cls.nextSessionDate ? (
                                                    cls.isPastSession ? (
                                                        `Sesi ${cls.nextSessionSesiKe} (${formatDate(cls.nextSessionDate)}) • Selesai`
                                                    ) : (
                                                        `Sesi ${cls.nextSessionSesiKe} (${formatDate(cls.nextSessionDate)})`
                                                    )
                                                ) : <span className="fst-italic opacity-75 fw-normal">Belum ada jadwal</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pending Assignments */}
                                    <div className="d-flex align-items-center">
                                        <div className="glass-card static rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.1)' }}>
                                            <i className="bi bi-journal-check text-warning fs-5"></i>
                                        </div>
                                        <div className="w-100 d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="small text-light opacity-75 mb-0 lh-1">Tugas Belum Selesai</div>
                                                <div className="fw-bold text-white mt-1">
                                                    {cls.pendingTaskCount === 0 ? 'Semua Selesai' : `${cls.pendingTaskCount} Belum Dikerjakan`}
                                                </div>
                                            </div>
                                            {cls.pendingTaskCount > 0 && (
                                                <span className="badge bg-danger rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow-sm">
                                                    <i className="bi bi-clock-history"></i>
                                                    {cls.closestDeadlineDays === 0 ? 'HARI INI' : `${cls.closestDeadlineDays} DAYS LEFT`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;