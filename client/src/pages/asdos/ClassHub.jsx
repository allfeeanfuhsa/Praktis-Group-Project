import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const ClassHub = () => {
    const { id_praktikum } = useParams();
    const navigate = useNavigate();
    
    // We can fetch basic class details here if needed, 
    // or just rely on the static layout for the hub.
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Just fetching the class info for the header
        const fetchClass = async () => {
            try {
                const res = await api.get('/api/users/asdos-dashboard');
                const cls = res.data.classes.find(c => c.id_praktikum.toString() === id_praktikum);
                setClassData(cls);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClass();
    }, [id_praktikum]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const features = [
        {
            title: "Sesi & Jadwal",
            icon: "bi-calendar-week",
            color: "primary",
            desc: "Atur jadwal pertemuan, ruang kelas, dan jam praktikum.",
            path: `/asdos/kelas/${id_praktikum}/jadwal`
        },
        {
            title: "Materi",
            icon: "bi-file-earmark-text",
            color: "info",
            desc: "Unggah modul, slide presentasi, atau bahan ajar lainnya.",
            path: `/asdos/kelas/${id_praktikum}/materi`
        },
        {
            title: "Tugas & Penilaian",
            icon: "bi-clipboard-check",
            color: "warning",
            desc: "Buat tugas baru dan beri nilai pengumpulan mahasiswa.",
            path: `/asdos/kelas/${id_praktikum}/tugas`
        },
        {
            title: "Presensi",
            icon: "bi-person-check",
            color: "success",
            desc: "Catat kehadiran mahasiswa di setiap sesi kelas.",
            path: `/asdos/kelas/${id_praktikum}/presensi`
        }
    ];

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid p-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* BACK BUTTON & HEADER */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
                <button onClick={() => navigate('/asdos/dashboard')} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Dashboard
                </button>
                
                <h2 className="display-6 fw-bold text-dark mb-2">
                    {classData ? classData.nama_praktikum : 'Ruang Kelas'}
                </h2>
                <p className="text-muted fs-5">
                    {classData ? `Kelas ${classData.kode}` : 'Pilih menu di bawah untuk mengelola kelas ini.'}
                </p>
            </motion.div>

            {/* FEATURES GRID */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
                {features.map((feat, idx) => (
                    <motion.div variants={itemVariants} key={idx} className="col-md-6">
                        <Link 
                            to={feat.path}
                            className="glass-card rounded-4 h-100 overflow-hidden text-decoration-none"
                        >
                            <div className="card-body p-5 d-flex align-items-center">
                                <div className="bg-light p-4 rounded-circle text-white me-4 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1) !important' }}>
                                    <i className={`bi ${feat.icon} display-5`}></i>
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-2 text-dark">{feat.title}</h3>
                                    <p className="text-muted mb-0">{feat.desc}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ClassHub;
