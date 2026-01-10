import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api';

const Materi = () => {
    const { id_praktikum } = useParams();

    // Data States
    const [sessions, setSessions] = useState([]);
    const [materiBySession, setMateriBySession] = useState({});
    const [loading, setLoading] = useState(!id_praktikum);
    const [error, setError] = useState(null);

    // 1. Fetch Sessions for this Praktikum
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/content/session/list/${id_praktikum}`);
                setSessions(res.data);
            } catch (err) {
                console.error("Error fetching sessions", err);
                setError("Gagal memuat sesi");
            } finally {
                setLoading(false);
            }
        };

        if (id_praktikum) {
            fetchSessions();
        }
    }, [id_praktikum]);

    // 2. Fetch Materials for each Session
    useEffect(() => {
        const fetchAllMaterials = async () => {
            if (sessions.length === 0) {
                setMateriBySession({});
                return;
            }

            try {
                const materiData = {};

                // Fetch materials for each session in parallel
                const promises = sessions.map(session =>
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
                setMateriBySession(materiData);
            } catch (err) {
                console.error("Error fetching materials", err);
            }
        };

        fetchAllMaterials();
    }, [sessions]);

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
        if (mimetype.includes('pdf')) return { icon: 'bi-file-pdf', color: 'danger' };
        if (mimetype.includes('word') || mimetype.includes('document')) return { icon: 'bi-file-word', color: 'primary' };
        if (mimetype.includes('sheet') || mimetype.includes('excel')) return { icon: 'bi-file-spreadsheet', color: 'success' };
        if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return { icon: 'bi-file-ppt', color: 'warning' };
        return { icon: 'bi-file-earmark', color: 'secondary' };
    };

    // Handler for file download
    const handleDownload = async (material, fileIndex) => {
        try {
            const response = await api.get(
                `/api/content/materi/${material._id}/download/${fileIndex}`,
                { responseType: 'blob' }
            );

            // create blob url... (existing code)
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Use the filename from the object safely
            link.setAttribute('download', material.attachments[fileIndex].filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Download error:', err);

            // --- ADD THIS TO DECODE THE ERROR ---
            if (err.response && err.response.data instanceof Blob) {
                const errorText = await err.response.data.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    alert(`Error: ${errorJson.message}`);
                } catch (e) {
                    alert('Gagal mengunduh file: Server Error');
                }
            } else {
                alert('Gagal mengunduh file');
            }
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Memuat materi...</p>
            </div>
        );
    }

    if (!id_praktikum) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Kelas tidak ditemukan. Silakan pilih kelas dari menu sidebar.
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
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

    return (
        <>
            {/* Header & Tombol Upload */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold">Bank Materi</h3>
                    <p className="text-muted small mb-0">Total {allMaterials.length} file materi</p>
                </div>
            </div>

            {/* Sessions with Materials */}
            {sessions.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    Belum ada sesi untuk kelas ini. <Link to={`/asdos/kelas/${id_praktikum}/jadwal`}>Buat sesi terlebih dahulu</Link>
                </div>
            ) : allMaterials.length === 0 ? (
                <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Belum ada materi. <Link to={`/asdos/kelas/${id_praktikum}/materi/input`}>Upload materi sekarang</Link>
                </div>
            ) : (
                <div className="row g-4">
                    {allMaterials.map((item) => {
                        const fileInfo = getFileIcon(item.attachments?.[0]?.mimetype);
                        return (
                            <div className="col-md-4" key={item._id || item.id}>
                                <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                                    <div className="card-header bg-light border-bottom">
                                        <small className="text-muted">
                                            <i className="bi bi-calendar-event me-1"></i>
                                            {item.session_name} • {new Date(item.session_date).toLocaleDateString('id-ID')}
                                        </small>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            {/* File Icon */}
                                            <div className={`bg-${fileInfo.color} bg-opacity-10 p-3 rounded text-${fileInfo.color} me-3`}>
                                                <i className={`bi ${fileInfo.icon} fs-3`}></i>
                                            </div>
                                            <div className="flex-grow-1 min-width-0">
                                                <h6 className="fw-bold mb-0 text-truncate">{item.judul}</h6>
                                                <small className="text-muted">
                                                    {item.attachments?.[0]?.filename || 'Dokumen'}
                                                </small>
                                            </div>
                                        </div>

                                        {item.deskripsi && (
                                            <p className="small text-muted mb-3">{item.deskripsi}</p>
                                        )}

                                        {item.attachments && item.attachments.length > 0 && (
                                            <div className="mb-3">
                                                <small className="text-muted d-block">
                                                    <i className="bi bi-file-earmark me-1"></i>
                                                    {formatFileSize(item.attachments[0].size)}
                                                </small>
                                            </div>
                                        )}

                                        {/* Download Button */}
                                        {item.attachments && item.attachments.length > 0 && (
                                            <button
                                                onClick={() => handleDownload(item, 0)}
                                                className="btn btn-sm btn-outline-primary w-100"
                                            >
                                                <i className="bi bi-download me-2"></i>Download
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default Materi;