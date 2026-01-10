import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const SessionDetail = () => {
    const { id_pertemuan } = useParams();

    // Data States
    const [materials, setMaterials] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materi');

    // Submission State (Tracks which task is being submitted)
    const [submittingTask, setSubmittingTask] = useState(null); // ID of task being submitted
    const [submissionFile, setSubmissionFile] = useState(null);

    useEffect(() => {
        fetchContent();
    }, [id_pertemuan]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const [resMateri, resTugas] = await Promise.all([
                api.get(`/api/content/materi/session/${id_pertemuan}`),
                api.get(`/api/content/tugas/session/${id_pertemuan}`)
            ]);
            setMaterials(resMateri.data);
            setTasks(resTugas.data);
        } catch (err) {
            console.error("Error loading content:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };

    const handleSubmitAssignment = async (e, tugasId) => {
        e.preventDefault();
        if (!submissionFile) return alert("Pilih file terlebih dahulu!");

        const formData = new FormData();
        formData.append('tugas_id', tugasId);
        formData.append('file', submissionFile);

        try {
            // We assume this endpoint exists (we will build it next)
            await api.post('/api/submission', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Tugas berhasil dikumpulkan!");
            setSubmittingTask(null);
            setSubmissionFile(null);
        } catch (err) {
            alert(err.response?.data?.message || "Gagal mengumpulkan tugas");
        }
    };

    // Helper to download file (Constructs URL from backend path)
    const getDownloadUrl = (filePath) => {
        // Assuming your backend serves static files from 'uploads'
        // You might need to adjust 'http://localhost:5000/' to your env config
        return `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
    };

    return (
        <div className="container-fluid p-4">
            {/* HEADER */}
            <div className="mb-4">
                <button onClick={() => window.history.back()} className="btn btn-link text-decoration-none text-muted p-0 mb-2">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Timeline
                </button>
                <h3 className="fw-bold">Detail Pertemuan</h3>
                <p className="text-muted small">Akses materi dan kerjakan tugas untuk sesi ini.</p>
            </div>

            {/* TABS */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-bottom-0 pt-3 px-4">
                    <ul className="nav nav-pills card-header-pills">
                        <li className="nav-item">
                            <button 
                                className={`nav-link fw-bold me-2 ${activeTab === 'materi' ? 'active' : 'text-muted'}`}
                                onClick={() => setActiveTab('materi')}
                            >
                                <i className="bi bi-journal-text me-2"></i>Materi ({materials.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link fw-bold ${activeTab === 'tugas' ? 'active' : 'text-muted'}`}
                                onClick={() => setActiveTab('tugas')}
                            >
                                <i className="bi bi-pencil-square me-2"></i>Tugas ({tasks.length})
                            </button>
                        </li>
                    </ul>
                </div>
                
                <div className="card-body p-4">
                    {loading ? (
                        <div className="text-center py-5">Loading content...</div>
                    ) : activeTab === 'materi' ? (
                        /* --- MATERI TAB --- */
                        <div className="row g-3">
                            {materials.length === 0 ? <p className="text-muted">Belum ada materi.</p> : 
                             materials.map(m => (
                                <div key={m._id} className="col-md-6">
                                    <div className="card h-100 border-0 bg-light rounded-3">
                                        <div className="card-body d-flex align-items-start">
                                            <div className="bg-white p-3 rounded shadow-sm text-danger me-3">
                                                <i className="bi bi-file-earmark-pdf fs-3"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">{m.judul}</h6>
                                                <p className="small text-muted mb-2">{m.deskripsi}</p>
                                                
                                                {m.attachments && m.attachments.length > 0 && (
                                                    <a 
                                                        href={getDownloadUrl(m.attachments[0].path)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary fw-bold"
                                                    >
                                                        <i className="bi bi-download me-2"></i>Download Materi
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* --- TUGAS TAB --- */
                        <div className="d-flex flex-column gap-3">
                            {tasks.length === 0 ? <p className="text-muted">Tidak ada tugas.</p> : 
                             tasks.map(t => (
                                <div key={t._id} className="card border rounded-3 p-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h5 className="fw-bold mb-0 me-2">{t.judul}</h5>
                                                {t.isUrgent && <span className="badge bg-danger">Penting</span>}
                                            </div>
                                            <p className="text-muted mb-2">{t.deskripsi}</p>
                                            <small className="text-danger fw-bold">
                                                <i className="bi bi-alarm me-1"></i> 
                                                Deadline: {new Date(t.tenggat_waktu).toLocaleString()}
                                            </small>
                                        </div>
                                        
                                        {/* Toggle Submit Form */}
                                        <button 
                                            className="btn btn-primary btn-sm fw-bold"
                                            onClick={() => setSubmittingTask(submittingTask === t._id ? null : t._id)}
                                        >
                                            {submittingTask === t._id ? 'Batal' : 'Kumpulkan'}
                                        </button>
                                    </div>

                                    {/* Submission Form (Only shows if 'Kumpulkan' is clicked) */}
                                    {submittingTask === t._id && (
                                        <div className="mt-3 pt-3 border-top bg-light rounded p-3">
                                            <h6 className="fw-bold small mb-2">Upload Jawaban Anda</h6>
                                            <form onSubmit={(e) => handleSubmitAssignment(e, t._id)}>
                                                <div className="input-group mb-3">
                                                    <input 
                                                        type="file" 
                                                        className="form-control" 
                                                        onChange={handleFileChange} 
                                                        required 
                                                    />
                                                    <button className="btn btn-success fw-bold" type="submit">
                                                        <i className="bi bi-send me-2"></i>Kirim
                                                    </button>
                                                </div>
                                                <small className="text-muted">Format: PDF/DOCX/ZIP. Max 5MB.</small>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionDetail;