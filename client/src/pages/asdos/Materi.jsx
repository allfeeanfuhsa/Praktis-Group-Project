import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import ClassHeaderBanner from '../../components/ClassHeaderBanner';

const Materi = () => {
    const { id_praktikum } = useParams();
    const navigate = useNavigate();

    // Data States
    const [sessions, setSessions] = useState([]);
    const [materiBySession, setMateriBySession] = useState({});
    const [loading, setLoading] = useState(!id_praktikum);
    const [error, setError] = useState(null);

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [sessionFilter, setSessionFilter] = useState('ALL');

    const handleShowDetail = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    // Fetch Sessions and Materials in a unified loading flow
    useEffect(() => {
        let isMounted = true;

        const fetchAllData = async () => {
            if (!id_praktikum) return;

            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Sessions
                const res = await api.get(`/api/content/session/list/${id_praktikum}`);
                const sessionList = res.data || [];
                if (isMounted) setSessions(sessionList);

                // 2. Fetch Materials for each Session
                if (sessionList.length > 0) {
                    const materiData = {};
                    const promises = sessionList.map(session =>
                        api.get(`/api/content/materi/session/${session.id_pertemuan}`)
                            .then(res => {
                                materiData[session.id_pertemuan] = res.data;
                            })
                            .catch(err => {
                                console.error(`Error fetching materials for session ${session.id_pertemuan}`, err);
                                materiData[session.id_pertemuan] = [];
                            })
                    );

                    await Promise.all(promises);
                    if (isMounted) setMateriBySession(materiData);
                } else {
                    if (isMounted) setMateriBySession({});
                }
            } catch (err) {
                console.error("Error fetching data", err);
                if (isMounted) setError("Gagal memuat data materi");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllData();

        return () => {
            isMounted = false;
        };
    }, [id_praktikum]);

    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Helper function to get file icon based on mimetype
    const getFileIcon = (mimetype = 'pdf') => {
        if (mimetype.includes('pdf')) return { icon: 'bi-file-earmark-pdf', color: 'bg-danger' };
        if (mimetype.includes('word') || mimetype.includes('document')) return { icon: 'bi-file-earmark-word', color: 'bg-primary' };
        if (mimetype.includes('sheet') || mimetype.includes('excel')) return { icon: 'bi-file-earmark-excel', color: 'bg-success' };
        if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return { icon: 'bi-file-earmark-ppt', color: 'bg-warning' };
        return { icon: 'bi-file-earmark-text', color: 'bg-info' };
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="text-center py-5 text-light">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="opacity-75 mt-3">Memuat bank materi...</p>
            </div>
        );
    }

    if (!id_praktikum) {
        return (
            <div className="glass-card static rounded-4 p-4 text-white text-center">
                <i className="bi bi-exclamation-triangle fs-1 d-block mb-3 text-warning"></i>
                Kelas tidak ditemukan. Silakan pilih kelas dari menu sidebar.
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card static rounded-4 p-4 text-white text-center">
                <i className="bi bi-exclamation-circle fs-1 d-block mb-3 text-danger"></i>
                {error}
            </div>
        );
    }

    // Flatten all materials from all sessions
    const allMaterials = sessions.flatMap(session =>
        (materiBySession[session.id_pertemuan] || []).map(materi => ({
            ...materi,
            session_name: `Sesi ${session.sesi_ke}`,
            session_date: session.tanggal
        }))
    );

    // Dynamic filtering based on search query, type filter, and session filter
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

    const baseURL = api.defaults.baseURL || 'http://localhost:5000';

    return (
        <div className="container-fluid p-0">
            {/* HEADER BANNER */}
            <ClassHeaderBanner 
                id_praktikum={id_praktikum} 
                activeTab="Bank Materi Pembelajaran" 
                backUrl={`/asdos/kelas/${id_praktikum}`} 
                backLabel="Kembali ke Class Hub" 
            />

            {/* Search and Filter Controls */}
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

            {/* Content List */}
            {sessions.length === 0 ? (
                <div className="glass-card static rounded-4 p-5 text-center text-white">
                    <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50"></i>
                    <h5 className="fw-bold mb-2">Belum Ada Sesi</h5>
                    <p className="text-light opacity-75 mb-4">Belum ada sesi yang dibuat untuk kelas ini.</p>
                    <Link to={`/asdos/kelas/${id_praktikum}/jadwal`} className="btn btn-light fw-bold rounded-pill px-4">
                        <i className="bi bi-plus-circle me-2"></i>Buat Sesi Terlebih Dahulu
                    </Link>
                </div>
            ) : allMaterials.length === 0 ? (
                <div className="glass-card static rounded-4 p-5 text-center text-white">
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                    <h5 className="fw-bold mb-2">Belum Ada Materi</h5>
                    <p className="text-light opacity-75 mb-4">Materi pembelajaran belum diunggah untuk kelas ini.</p>
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
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                                                <i className="bi bi-calendar-event me-2"></i>{item.session_name}
                                            </span>
                                            {item.session_date && (
                                                <small className="text-light opacity-50">
                                                    {new Date(item.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </small>
                                            )}
                                        </div>

                                        <div className="d-flex align-items-start mb-3">
                                            <div className={`${fileIcon.color} bg-opacity-25 p-3 rounded-4 text-white me-3 shadow-sm`}>
                                                <i className={`bi ${fileIcon.icon} fs-3`}></i>
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
                                    </div>

                                    <div>
                                        {attachment && (
                                            <div className="mt-3">
                                                <a
                                                    href={`${baseURL}/api/content/materi/${item._id}/download/0?view=true`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none d-inline-block hover-opacity-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="bi bi-paperclip me-2"></i>
                                                    {attachment.filename} ({formatFileSize(attachment.size)})
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* DETAIL MODAL */}
            {showDetailModal && selectedItem && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backdropFilter: 'blur(15px)' }} onClick={() => setShowDetailModal(false)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content glass-card border-light border-opacity-25 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-bottom border-light border-opacity-10 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <h4 className="modal-title fw-bold text-white d-flex align-items-center m-0">
                                    <div className="p-2 rounded-circle me-3 bg-danger text-white bg-opacity-25">
                                        <i className={`bi ${getFileIcon(selectedItem.attachments?.[0]?.mimetype).icon} fs-4`}></i>
                                    </div>
                                    {selectedItem.judul}
                                </h4>
                                <button type="button" className="btn-close btn-close-white opacity-75 hover-opacity-100" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body text-white p-4">
                                <div className="mb-4">
                                    <span className="badge border border-light text-light px-3 py-2 rounded-pill mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <i className="bi bi-calendar-event me-2"></i>{selectedItem.session_name}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h6 className="fw-bold text-info mb-3 text-uppercase tracking-wider small">Deskripsi</h6>
                                    <div className="fs-5 opacity-75" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {selectedItem.deskripsi || "Tidak ada deskripsi."}
                                    </div>
                                </div>

                                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                                    <div className="mb-2">
                                        <h6 className="fw-bold text-info mb-3 text-uppercase tracking-wider small">Lampiran Dokumen</h6>
                                        <a
                                            href={`${baseURL}/api/content/materi/${selectedItem._id}/download/0?view=true`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center"
                                        >
                                            <i className="bi bi-eye me-2 fs-5"></i> Buka & View {selectedItem.attachments[0].filename} ({formatFileSize(selectedItem.attachments[0].size)})
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-light fw-bold rounded-pill px-5" onClick={() => setShowDetailModal(false)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materi;