import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const ClassHeaderBanner = ({ id_praktikum, activeTab, backUrl, backLabel = "Kembali", theme = "dark" }) => {
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState(null);

    useEffect(() => {
        if (!id_praktikum) return;
        const fetchInfo = async () => {
            try {
                const res = await api.get(`/api/content/class-info/${id_praktikum}`);
                setClassInfo(res.data.classInfo);
            } catch (err) {
                console.error("Error fetching class info for header:", err);
            }
        };
        fetchInfo();
    }, [id_praktikum]);

    const isLight = theme === 'light';

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-4"
        >
            {backUrl && (
                <button 
                    onClick={() => navigate(backUrl)} 
                    className={isLight ? "btn btn-outline-primary rounded-pill btn-sm px-3 py-1.5 fw-bold mb-3 d-inline-flex align-items-center gap-2 shadow-sm" : "btn btn-outline-light border-opacity-25 rounded-pill btn-sm px-3 py-1.5 fw-bold mb-3 d-inline-flex align-items-center gap-2"}
                    style={{ fontSize: '0.82rem' }}
                >
                    <i className="bi bi-arrow-left"></i>
                    <span>{backLabel}</span>
                </button>
            )}

            <div 
                className={isLight ? "card border-0 shadow-sm rounded-4 p-4 bg-white text-dark" : "glass-card static rounded-4 p-4 text-white"} 
                style={{ 
                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)', 
                    border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.15)' 
                }}
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={isLight ? "badge bg-primary text-white rounded-pill fw-bold px-2.5 py-1" : "badge bg-info text-dark rounded-pill fw-bold px-2.5 py-1"} style={{ fontSize: '0.75rem' }}>
                                {classInfo ? `Kelas ${classInfo.kode_kelas}` : 'Kelas Praktikum'}
                            </span>
                            {classInfo?.semester && (
                                <span className={isLight ? "badge bg-light text-secondary border rounded-pill px-2.5 py-1 fw-bold" : "badge bg-light bg-opacity-20 text-light border border-light border-opacity-20 rounded-pill px-2.5 py-1 fw-bold"} style={{ fontSize: '0.72rem' }}>
                                    Semester {classInfo.semester}
                                </span>
                            )}
                        </div>

                        <h2 className={isLight ? "fw-bold text-dark mb-1" : "fw-bold text-white mb-1"} style={{ fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
                            {classInfo ? classInfo.mata_kuliah : 'Memuat Mata Kuliah...'}
                        </h2>

                        <div className={`d-flex align-items-center gap-3 flex-wrap ${isLight ? 'text-muted' : 'text-light opacity-75'}`} style={{ fontSize: '0.82rem' }}>
                            {classInfo?.jadwal && (
                                <span><i className="bi bi-clock me-1 text-warning"></i>{classInfo.jadwal}</span>
                            )}
                            {classInfo?.ruangan && (
                                <span><i className="bi bi-geo-alt me-1 text-danger"></i>{classInfo.ruangan}</span>
                            )}
                            {classInfo?.tahun_pelajaran && (
                                <span><i className="bi bi-calendar3 me-1 text-info"></i>{classInfo.tahun_pelajaran}</span>
                            )}
                        </div>
                    </div>

                    {activeTab && (
                        <div className={isLight ? "badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2" : "badge bg-light bg-opacity-10 border border-light border-opacity-20 text-white px-3 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2"} style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-layers text-info"></i>
                            <span>{activeTab}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ClassHeaderBanner;
