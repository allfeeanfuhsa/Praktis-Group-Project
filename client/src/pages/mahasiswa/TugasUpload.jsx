import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const TugasUpload = () => {
    const { id_praktikum, id_tugas } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [commentText, setCommentText] = useState("");

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const taskRes = await api.get(`/api/content/tugas/${id_tugas}`);
            setTask(taskRes.data);

            const subRes = await api.get(`/api/submission/me/${id_tugas}`);
            setSubmission(subRes.data);
        } catch (err) {
            if (err.response && err.response.status !== 404) {
                console.error("Error loading data", err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id_tugas]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert("Pilih file dahulu!");

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('tugas_id', id_tugas);
            formData.append('file', selectedFile);

            await api.post('/api/submission', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Tugas berhasil dikumpulkan!');
            setSelectedFile(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal upload");
        } finally {
            setUploading(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim() || !submission) return;

        try {
            await api.post(`/api/submission/${submission._id}/comment`, {
                text: commentText
            });
            setCommentText("");
            fetchData();
        } catch (err) {
            alert("Gagal mengirim komentar.");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

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
                    <span className="visually-hidden">Loading tugas...</span>
                </div>
                <p className="opacity-75 mt-3 small">Memuat informasi tugas...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="glass-card static rounded-4 p-4 text-white text-center">
                <i className="bi bi-exclamation-circle fs-1 d-block mb-3 text-danger"></i>
                Tugas tidak ditemukan
            </div>
        );
    }

    const baseURL = api.defaults.baseURL || 'http://localhost:5000';
    const isClosed = new Date() > new Date(task.tenggat_waktu);

    return (
        <div className="container-fluid px-0">
            {/* HEADER */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
                <button onClick={() => navigate(`/mahasiswa/kelas/${id_praktikum}/tugas`)} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar Tugas
                </button>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <h3 className="fw-bold text-white mb-0">{task.judul}</h3>
                    {isClosed ? (
                        <span className="badge bg-danger text-white border border-danger px-3 py-1.5 rounded-pill">Closed</span>
                    ) : (
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill">Open</span>
                    )}
                </div>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
                {/* LEFT COLUMN: Task Details */}
                <motion.div variants={itemVariants} className="col-lg-7">
                    {/* Task Info Card */}
                    <div className="glass-card rounded-4 p-4 mb-4">
                        <h5 className="fw-bold text-white mb-3 d-flex align-items-center">
                            <i className="bi bi-file-earmark-text me-2 text-info"></i>Petunjuk Tugas
                        </h5>

                        <div className="mb-3 text-light opacity-75 small">
                            <i className="bi bi-clock me-2 text-warning"></i>
                            Tenggat Waktu: <strong className="text-white">{formatDate(task.tenggat_waktu)}</strong>
                        </div>

                        <div className="glass-card static p-3 rounded-3 mb-4 text-light" style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.05)' }}>
                            {task.deskripsi || 'Tidak ada deskripsi khusus.'}
                        </div>

                        {/* Task Attachments (Soal) */}
                        {task.attachments && task.attachments.length > 0 && (
                            <div>
                                <h6 className="fw-bold text-light opacity-75 mb-2">Berkas Soal / Lampiran:</h6>
                                <div className="d-flex flex-column gap-2">
                                    {task.attachments.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={`${baseURL}/api/content/tugas/${task._id}/download/${idx}?view=true`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="glass-card static rounded-3 p-3 text-white text-decoration-none d-flex justify-content-between align-items-center hover-opacity-100"
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-file-earmark-text fs-4 text-info"></i>
                                                <span className="fw-bold">{file.filename}</span>
                                            </div>
                                            <span className="badge bg-light bg-opacity-25 text-white rounded-pill px-3 py-1.5">
                                                Buka Soal <i className="bi bi-box-arrow-up-right ms-1"></i>
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DISCUSSION THREAD / COMMENTS */}
                    {submission && (
                        <div className="glass-card rounded-4 p-4">
                            <h5 className="fw-bold text-white mb-3 d-flex align-items-center">
                                <i className="bi bi-chat-left-text me-2 text-warning"></i>Diskusi & Feedback Asdos
                            </h5>

                            {/* Comment List */}
                            <div className="d-flex flex-column gap-3 mb-4 max-h-300 overflow-y-auto pr-2">
                                {(!submission.comments || submission.comments.length === 0) ? (
                                    <div className="text-center py-4 text-light opacity-50 small">
                                        Belum ada komentar pada pengumpulan ini.
                                    </div>
                                ) : (
                                    submission.comments.map((c, idx) => (
                                        <div key={idx} className="glass-card static p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <strong className="text-white small">{c.user_name || 'User'}</strong>
                                                <small className="text-light opacity-50" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(c.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                </small>
                                            </div>
                                            <p className="text-light opacity-75 mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{c.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Send Comment Input */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control bg-dark text-white border-light border-opacity-25 shadow-none"
                                    placeholder="Tulis pesan atau pertanyaan..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(); }}
                                />
                                <button
                                    className="btn btn-primary fw-bold px-4"
                                    type="button"
                                    onClick={handleSendComment}
                                    disabled={!commentText.trim()}
                                >
                                    <i className="bi bi-send me-1"></i> Kirim
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* RIGHT COLUMN: Submission Status & Upload Form */}
                <motion.div variants={itemVariants} className="col-lg-5">
                    {/* SUBMISSION STATUS CARD */}
                    <div className="glass-card rounded-4 p-4 mb-4">
                        <h5 className="fw-bold text-white mb-3 d-flex align-items-center">
                            <i className="bi bi-cloud-arrow-up me-2 text-success"></i>Pengumpulan Tugas
                        </h5>

                        {submission ? (
                            <div>
                                <div className="glass-card static p-3 rounded-3 mb-3 border-light border-opacity-10" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-light opacity-75 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Status Pengumpulan</small>
                                        {submission.nilai !== null && submission.nilai !== undefined ? (
                                            <span className="badge bg-primary text-white border border-primary px-3 py-1 rounded-pill fw-bold">
                                                Nilai: {submission.nilai}/100
                                            </span>
                                        ) : (
                                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill fw-bold">
                                                Telah Terkumpul
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-light opacity-75 small mb-3">
                                        Waktu Kirim: {formatDate(submission.submitted_at)}
                                    </div>

                                    {/* Download / View Submission File */}
                                    {submission.file && (
                                        <a
                                            href={`${baseURL}/api/submission/download/${submission._id}?view=true`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none d-inline-flex align-items-center gap-2 hover-opacity-100 w-100 justify-content-center"
                                        >
                                            <i className="bi bi-file-earmark-check text-success fs-5"></i>
                                            <span className="text-truncate">{submission.file.filename || 'Tugas_Saya.pdf'}</span>
                                            <i className="bi bi-box-arrow-up-right small"></i>
                                        </a>
                                    )}
                                </div>

                                {/* Re-upload form if allowed */}
                                {!isClosed && (
                                    <div className="pt-2 border-top border-light border-opacity-10">
                                        <label className="form-label small fw-bold text-light opacity-75 mb-2">
                                            Kirim Ulang / Perbarui Berkas:
                                        </label>
                                        <form onSubmit={handleUpload}>
                                            <input
                                                type="file"
                                                className="form-control bg-dark text-white border-light border-opacity-25 mb-3"
                                                onChange={handleFileChange}
                                                disabled={uploading}
                                            />
                                            <button
                                                type="submit"
                                                className="btn btn-outline-light rounded-pill fw-bold w-100 py-2"
                                                disabled={uploading || !selectedFile}
                                            >
                                                {uploading ? 'Mengunggah...' : 'Perbarui Berkas Tugas'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* FIRST TIME UPLOAD FORM */
                            <div>
                                {isClosed ? (
                                    <div className="alert alert-danger bg-danger bg-opacity-25 text-white border border-danger border-opacity-25 rounded-3 mb-0">
                                        Tenggat waktu pengumpulan tugas telah berakhir.
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpload}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-light opacity-75 mb-2">
                                                Pilih Berkas Tugas (PDF, Word, ZIP, Gambar):
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control bg-dark text-white border-light border-opacity-25 rounded-3"
                                                onChange={handleFileChange}
                                                required
                                                disabled={uploading}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary shadow-sm rounded-pill fw-bold w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
                                            disabled={uploading || !selectedFile}
                                        >
                                            {uploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>Mengunggah...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-cloud-arrow-up fs-5"></i>
                                                    <span>Kumpulkan Tugas Now</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default TugasUpload;