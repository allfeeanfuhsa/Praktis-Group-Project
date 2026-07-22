import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const MateriMhs = () => {
    const { id_praktikum } = useParams();
    const navigate = useNavigate();
    
    // Data States
    const [sessions, setSessions] = useState([]);
    const [materiBySession, setMateriBySession] = useState({});
    const [loading, setLoading] = useState(true);

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [sessionFilter, setSessionFilter] = useState('ALL');

    useEffect(() => {
        let isMounted = true;

        const fetchAllMaterials = async () => {
            if (!id_praktikum) return;

            try {
                setLoading(true);
                // 1. Get All Sessions
                const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
                const fetchedSessions = sessionRes.data.sort((a, b) => a.sesi_ke - b.sesi_ke);

                if (isMounted) setSessions(fetchedSessions);

                // 2. Fetch materials for all sessions in parallel
                const materiMap = {};
                await Promise.all(
                    fetchedSessions.map(async (sess) => {
                        try {
                            const matRes = await api.get(`/api/content/materi/session/${sess.id_pertemuan}`);
                            materiMap[sess.id_pertemuan] = matRes.data || [];
                        } catch (e) {
                            materiMap[sess.id_pertemuan] = [];
                        }
                    })
                );

                if (isMounted) setMateriBySession(materiMap);

            } catch (err) {
                console.error("Library error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllMaterials();

        return () => {
            isMounted = false;
        };
    }, [id_praktikum]);

    const handleShowDetail = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const getFileIcon = (mimetype) => {
        if (!mimetype) return 'bi-file-earmark';
        if (mimetype.includes('pdf')) return 'bi-file-earmark-pdf text-danger';
        if (mimetype.includes('word') || mimetype.includes('document')) return 'bi-file-earmark-word text-primary';
        if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'bi-file-earmark-excel text-success';
        if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'bi-file-earmark-ppt text-warning';
        if (mimetype.includes('image')) return 'bi-file-earmark-image text-info';
        return 'bi-file-earmark';
    };

    // Flatten all materials from all sessions
    const allMaterials = sessions.flatMap(session =>
        (materiBySession[session.id_pertemuan] || []).map(materi => ({
            ...materi,
            session_name: `Sesi ${session.sesi_ke}`,
            session_date: session.tanggal
        }))
    );

    // Dynamic filtering
    const filteredMaterials = allMaterials.filter(item => {
        const query = searchQuery.toLowerCase().trim();
        const matchSearch = !query || 
            item.judul?.toLowerCase().includes(query) || 
            item.deskripsi?.toLowerCase().includes(query) ||
            (item.attachments?.[0]?.filename || '').toLowerCase().includes(query);

        const matchSession = sessionFilter === 'ALL' || String(item.session_name) === String(sessionFilter);

        let matchType = true;
        if (typeFilter !== 'ALL') {
            const mime = item.attachments?.[0]?.mimetype || '';
            if (typeFilter === 'PDF') matchType = mime.includes('pdf');
            else if (typeFilter === 'WORD') matchType = mime.includes('word') || mime.includes('document');
            else if (typeFilter === 'EXCEL') matchType = mime.includes('sheet') || mime.includes('excel');
            else if (typeFilter === 'PPT') matchType = mime.includes('presentation') || mime.includes('powerpoint');
        }

        return matchSearch && matchSession && matchType;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="text-center py-5 text-light">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading materi...</span>
                </div>
                <p className="opacity-75 mt-3 small">Memuat bank materi...</p>
            </div>
        );
    }

    const baseURL = api.defaults.baseURL || 'http://localhost:5000';

    return (
        <div className="container-fluid p-0">
            {/* HEADER */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
                <button onClick={() => navigate('/mahasiswa/dashboard')} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Dashboard
                </button>
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                    <div>
                        <h3 className="fw-bold text-white mb-1">Bank Materi</h3>
                        <p className="text-light opacity-75 small mb-0">Total {filteredMaterials.length} dari {allMaterials.length} file materi terunggah</p>
                    </div>
                </div>
            </motion.div>

            {/* SEARCH AND FILTER CONTROLS */}
            {allMaterials.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card static rounded-4 p-4 mb-4">
                    <div className="row g-3 align-items-center">
                        {/* Search Input */}
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-dark border-light border-opacity-25 text-light opacity-75">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-dark text-white border-light border-opacity-25 shadow-none"
                                    placeholder="Cari judul materi atau nama berkas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="col-md-3">
                            <select
                                className="form-select bg-dark text-white border-light border-opacity-25 shadow-none"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="ALL">Semua Tipe File</option>
                                <option value="PDF">📄 PDF</option>
                                <option value="WORD">📝 Word</option>
                                <option value="PPT">📊 PowerPoint (PPT)</option>
                                <option value="EXCEL">📈 Excel</option>
                            </select>
                        </div>

                        {/* Session Filter */}
                        <div className="col-md-4">
                            <select
                                className="form-select bg-dark text-white border-light border-opacity-25 shadow-none"
                                value={sessionFilter}
                                onChange={(e) => setSessionFilter(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="ALL">Semua Sesi Pertemuan</option>
                                {sessions.map(s => (
                                    <option key={s.id_pertemuan} value={`Sesi ${s.sesi_ke}`}>
                                        Sesi {s.sesi_ke}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* CONTENT GRID */}
            {sessions.length === 0 ? (
                <div className="glass-card static rounded-4 p-5 text-center text-white">
                    <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50 text-warning"></i>
                    <h5 className="fw-bold mb-2">Belum Ada Sesi</h5>
                    <p className="text-light opacity-75 mb-0">Belum ada sesi praktikum untuk kelas ini.</p>
                </div>
            ) : allMaterials.length === 0 ? (
                <div className="glass-card static rounded-4 p-5 text-center text-white">
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                    <h5 className="fw-bold mb-2">Belum Ada Materi</h5>
                    <p className="text-light opacity-75 mb-0">Materi pembelajaran belum diunggah untuk kelas ini.</p>
                </div>
            ) : filteredMaterials.length === 0 ? (
                <div className="glass-card static rounded-4 p-5 text-center text-white">
                    <i className="bi bi-funnel fs-1 d-block mb-3 opacity-50 text-warning"></i>
                    <h5 className="fw-bold mb-2">Materi Tidak Ditemukan</h5>
                    <p className="text-light opacity-75 mb-4">Tidak ada materi yang sesuai dengan pencarian atau filter pilihan Anda.</p>
                    <button onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setSessionFilter('ALL'); }} className="btn btn-outline-light rounded-pill px-4 fw-bold">
                        <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Filter
                    </button>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
                    {filteredMaterials.map((item) => {
                        const fileIcon = getFileIcon(item.attachments?.[0]?.mimetype);
                        const hasAttachment = item.attachments && item.attachments.length > 0;
                        const attachment = hasAttachment ? item.attachments[0] : null;

                        return (
                            <motion.div variants={itemVariants} className="col-md-6 col-lg-4" key={item._id || item.id}>
                                <div
                                    className="glass-card rounded-4 h-100 d-flex flex-column p-4 justify-content-between"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleShowDetail(item)}
                                >
                                    <div>
                                        {/* Session Badge */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge border border-light text-light px-3 py-1.5 rounded-pill" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                                                <i className="bi bi-calendar-event me-2"></i>{item.session_name}
                                            </span>
                                        </div>

                                        {/* Content Header */}
                                        <div className="d-flex align-items-start mb-3">
                                            <div className="bg-primary bg-opacity-25 p-3 rounded-4 text-white me-3 shadow-sm">
                                                <i className={`bi ${fileIcon} fs-3`}></i>
                                            </div>
                                            <div className="flex-grow-1 min-width-0">
                                                <h5 className="fw-bold text-white mb-1 text-truncate">{item.judul}</h5>
                                                {attachment && (
                                                    <small className="text-light opacity-75 d-block text-truncate">
                                                        {attachment.filename}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {item.deskripsi && (
                                            <p className="text-light opacity-75 small mb-3 text-truncate-2" style={{ whiteSpace: 'pre-wrap' }}>
                                                {item.deskripsi}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        {/* Attachment Link */}
                                        {attachment && (
                                            <div className="mb-3">
                                                <a
                                                    href={`${baseURL}/api/content/materi/${item._id}/download/0?view=true`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none d-inline-block hover-opacity-100"
                                                >
                                                    <i className="bi bi-file-earmark-text me-2"></i>
                                                    Buka Berkas
                                                    <i className="bi bi-box-arrow-up-right ms-2 small"></i>
                                                </a>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShowDetail(item); }}
                                            className="btn btn-light shadow-sm rounded-pill fw-bold w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            <span>Lihat Detail Materi</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* DETAIL MODAL */}
            {showDetailModal && selectedItem && (
                <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="glass-card static rounded-4 border-0 shadow-lg p-0 text-white w-100 overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-4 border-bottom border-light border-opacity-10 d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="badge border border-light text-light px-3 py-1 rounded-pill mb-2" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}>
                                        {selectedItem.session_name}
                                    </span>
                                    <h5 className="fw-bold text-white mb-0">{selectedItem.judul}</h5>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4">
                                <h6 className="fw-bold text-light opacity-75 mb-2">Deskripsi:</h6>
                                <div className="glass-card static p-3 rounded-3 mb-4 text-light" style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.05)' }}>
                                    {selectedItem.deskripsi || 'Tidak ada deskripsi.'}
                                </div>

                                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                                    <div>
                                        <h6 className="fw-bold text-light opacity-75 mb-2">Berkas Lampiran ({selectedItem.attachments.length}):</h6>
                                        <div className="d-flex flex-column gap-2">
                                            {selectedItem.attachments.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={`${baseURL}/api/content/materi/${selectedItem._id}/download/${idx}?view=true`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="glass-card static rounded-3 p-3 text-white text-decoration-none d-flex justify-content-between align-items-center hover-opacity-100"
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className={`bi ${getFileIcon(file.mimetype)} fs-4`}></i>
                                                        <span className="fw-bold">{file.filename}</span>
                                                    </div>
                                                    <span className="badge bg-light bg-opacity-25 text-white rounded-pill px-3 py-1.5">
                                                        Buka File <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 border-top border-light border-opacity-10 text-end">
                                <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowDetailModal(false)}>
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MateriMhs;