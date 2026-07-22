import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import ClassHeaderBanner from '../../components/ClassHeaderBanner';

const SessionDetail = () => {
    const { id_pertemuan, id_praktikum } = useParams();
    const navigate = useNavigate();

    // Data States
    const [materials, setMaterials] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materi');

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState('materi');

    const handleShowDetail = (item, type) => {
        setSelectedItem(item);
        setSelectedType(type);
        setShowDetailModal(true);
    }; // 'materi' or 'tugas'
    const [materiForm, setMateriForm] = useState({ judul: '', deskripsi: '', file: null });
    const [tugasForm, setTugasForm] = useState({ judul: '', deskripsi: '', tenggat_waktu: '', file: null });

    // Guard: verify user is actually enrolled as asdos in this specific class
    useEffect(() => {
        const verifyClassRole = async () => {
            try {
                const res = await api.get(`/api/users/my-class-role/${id_praktikum}`);
                const role = res.data?.role;
                if (role !== 'asdos' && role !== 'admin') {
                    // Not an asdos in this class — redirect to the correct mahasiswa view
                    navigate(`/mahasiswa/kelas/${id_praktikum}/session/${id_pertemuan}`, { replace: true });
                }
            } catch {
                // Not enrolled at all or server error — redirect away
                navigate('/asdos/dashboard', { replace: true });
            }
        };
        verifyClassRole();
    }, [id_praktikum, id_pertemuan]);

    // Fetch Data on Load
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
            console.error("Error fetching content:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleMateriSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('pertemuan_id', id_pertemuan);
        formData.append('judul', materiForm.judul);
        formData.append('deskripsi', materiForm.deskripsi);
        if (materiForm.file) formData.append('files', materiForm.file);

        try {
            await api.post('/api/content/materi', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Materi berhasil diupload!");
            setMateriForm({ judul: '', deskripsi: '', file: null });
            fetchContent();
        } catch (err) {
            alert(err.response?.data?.message || "Upload gagal");
        }
    };

    const handleTugasSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('pertemuan_id', id_pertemuan);
        formData.append('judul', tugasForm.judul);
        formData.append('deskripsi', tugasForm.deskripsi);
        formData.append('tenggat_waktu', tugasForm.tenggat_waktu);
        if (tugasForm.file) formData.append('files', tugasForm.file);

        try {
            await api.post('/api/content/tugas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Tugas berhasil dibuat!");
            setTugasForm({ judul: '', deskripsi: '', tenggat_waktu: '', file: null });
            fetchContent();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal membuat tugas");
        }
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

    return (
        <div className="container-fluid p-4">
            {/* HEADER BANNER */}
            <ClassHeaderBanner 
                id_praktikum={id_praktikum} 
                activeTab="Kelola Pertemuan & Modul" 
                backUrl={`/asdos/kelas/${id_praktikum}/jadwal`} 
                backLabel="Kembali ke Jadwal Sesi" 
            />

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row">
                {/* LEFT COLUMN: CONTENT LIST */}
                <motion.div variants={itemVariants} className="col-md-7">

                    {/* TABS */}
                    <ul className="nav nav-pills mb-4 gap-2 border-bottom border-light border-opacity-10 pb-3">
                        <li className="nav-item">
                            <button
                                className={`nav-link rounded-pill px-4 ${activeTab === 'materi' ? 'active bg-primary text-white fw-bold shadow' : 'text-light border border-light border-opacity-25'}`}
                                onClick={() => setActiveTab('materi')}
                                style={activeTab !== 'materi' ? { background: 'rgba(255,255,255,0.05)' } : {}}
                            >
                                <i className="bi bi-file-earmark-pdf me-2"></i>Materi ({materials.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link rounded-pill px-4 ${activeTab === 'tugas' ? 'active bg-primary text-white fw-bold shadow' : 'text-light border border-light border-opacity-25'}`}
                                onClick={() => setActiveTab('tugas')}
                                style={activeTab !== 'tugas' ? { background: 'rgba(255,255,255,0.05)' } : {}}
                            >
                                <i className="bi bi-pencil-square me-2"></i>Tugas ({tasks.length})
                            </button>
                        </li>
                    </ul>

                    {/* LIST AREA */}
                    {loading ? <div className="text-center text-light py-5"><div className="spinner-border text-light" role="status"></div></div> : (
                        <div className="rounded-4 p-2">
                            <div className="list-group list-group-flush bg-transparent">
                                {activeTab === 'materi' ? (
                                    materials.length === 0 ? <div className="p-5 text-center text-light opacity-50"><i className="bi bi-inbox fs-1 d-block mb-3"></i>Belum ada materi.</div> :
                                        materials.map(m => (
                                            <div
                                                key={m._id}
                                                className="glass-card rounded-4 list-group-item bg-transparent border-bottom border-light border-opacity-10 p-4"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleShowDetail(m, 'materi')}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-danger bg-opacity-25 p-3 rounded-4 text-white me-4 shadow-sm">
                                                        <i className="bi bi-file-earmark-pdf fs-3"></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="fw-bold text-white mb-1">{m.judul}</h5>

                                                        {/* If attachment exists */}
                                                        {m.attachments && m.attachments[0] && (
                                                            <a
                                                                href={`${api.defaults.baseURL || 'http://localhost:5000'}/api/content/materi/${m._id}/download/0?view=true`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill mt-2 text-decoration-none d-inline-block hover-opacity-100"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <i className="bi bi-paperclip me-2"></i>{m.attachments[0].filename}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    tasks.length === 0 ? <div className="p-5 text-center text-light opacity-50"><i className="bi bi-inbox fs-1 d-block mb-3"></i>Belum ada tugas.</div> :
                                        tasks.map(t => (
                                            <div
                                                key={t._id}
                                                className="glass-card rounded-4 list-group-item bg-transparent border-bottom border-light border-opacity-10 p-4"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleShowDetail(t, 'tugas')}
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-warning bg-opacity-25 p-3 rounded-4 text-white me-4 shadow-sm">
                                                            <i className="bi bi-clipboard-check fs-3"></i>
                                                        </div>
                                                        <div>
                                                            <h5 className="fw-bold text-white mb-2">{t.judul}</h5>
                                                            <span className="badge border border-warning text-warning px-3 py-2 rounded-pill me-2 mb-1 d-inline-block" style={{ background: 'rgba(255,193,7,0.1)' }}>
                                                                <i className="bi bi-clock me-2"></i>Deadline: {new Date(t.tenggat_waktu).toLocaleString()}
                                                            </span>

                                                            {/* If attachment exists */}
                                                            {t.attachments && t.attachments[0] && (
                                                                <a
                                                                    href={`${api.defaults.baseURL || 'http://localhost:5000'}/api/content/tugas/${t._id}/download/0?view=true`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none d-inline-block mb-1 hover-opacity-100"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <i className="bi bi-paperclip me-2"></i>{t.attachments[0].filename}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* RIGHT COLUMN: FORM INPUT */}
                <motion.div variants={itemVariants} className="col-md-5">
                    <div className="glass-card static rounded-4 sticky-top overflow-hidden" style={{ top: '100px' }}>
                        <div className="border-bottom border-light border-opacity-25 p-4">
                            <h5 className="fw-bold mb-0 text-white">
                                {activeTab === 'materi' ? 'Upload Materi Baru' : 'Buat Tugas Baru'}
                            </h5>
                        </div>
                        <div className="p-4">
                            {activeTab === 'materi' ? (
                                /* MATERI FORM */
                                <form onSubmit={handleMateriSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">Judul Materi</label>
                                        <input type="text" className="form-control" required placeholder="Cth: Slide Pertemuan 1"
                                            value={materiForm.judul} onChange={e => setMateriForm({ ...materiForm, judul: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">Deskripsi</label>
                                        <textarea className="form-control" rows="3" placeholder="Tambahkan penjelasan singkat..."
                                            value={materiForm.deskripsi} onChange={e => setMateriForm({ ...materiForm, deskripsi: e.target.value })}></textarea>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">File (PDF/PPT)</label>
                                        <input type="file" className="form-control" required
                                            onChange={e => setMateriForm({ ...materiForm, file: e.target.files[0] })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold border-0 py-2 rounded-3 shadow" style={{ background: 'linear-gradient(135deg, #0d6efd, #0dcaf0)' }}>
                                        <i className="bi bi-cloud-arrow-up me-2"></i>Upload Materi
                                    </button>
                                </form>
                            ) : (
                                /* TUGAS FORM */
                                <form onSubmit={handleTugasSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">Judul Tugas</label>
                                        <input type="text" className="form-control" required placeholder="Cth: Tugas Praktikum 1"
                                            value={tugasForm.judul} onChange={e => setTugasForm({ ...tugasForm, judul: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">Instruksi</label>
                                        <textarea className="form-control" rows="3" required placeholder="Jelaskan detail tugas yang harus dikerjakan..."
                                            value={tugasForm.deskripsi} onChange={e => setTugasForm({ ...tugasForm, deskripsi: e.target.value })}></textarea>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">Deadline</label>
                                        <input type="datetime-local" className="form-control" required
                                            value={tugasForm.tenggat_waktu} onChange={e => setTugasForm({ ...tugasForm, tenggat_waktu: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-light opacity-75">Lampiran Soal (Opsional)</label>
                                        <input type="file" className="form-control"
                                            onChange={e => setTugasForm({ ...tugasForm, file: e.target.files[0] })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold border-0 py-2 rounded-3 shadow" style={{ background: 'linear-gradient(135deg, #0d6efd, #0dcaf0)' }}>
                                        <i className="bi bi-send-check me-2"></i>Buat Tugas
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* DETAIL MODAL */}
            {showDetailModal && selectedItem && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backdropFilter: 'blur(15px)' }} onClick={() => setShowDetailModal(false)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content glass-card border-light border-opacity-25 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-bottom border-light border-opacity-10 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <h4 className="modal-title fw-bold text-white d-flex align-items-center m-0">
                                    <div className={`p-2 rounded-circle me-3 ${selectedType === 'materi' ? 'bg-danger text-white bg-opacity-25' : 'bg-warning text-white bg-opacity-25'}`}>
                                        <i className={`bi ${selectedType === 'materi' ? 'bi-file-earmark-pdf' : 'bi-clipboard-check'} fs-4`}></i>
                                    </div>
                                    {selectedItem.judul}
                                </h4>
                                <button type="button" className="btn-close btn-close-white opacity-75 hover-opacity-100" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body text-white p-4">
                                <div className="mb-4">
                                    <h6 className="fw-bold text-info mb-3 text-uppercase tracking-wider small">Deskripsi</h6>
                                    <div className="fs-5 opacity-75" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {selectedItem.deskripsi}
                                    </div>
                                </div>

                                {selectedType === 'tugas' && selectedItem.tenggat_waktu && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-warning mb-3 text-uppercase tracking-wider small">Batas Waktu</h6>
                                        <span className="badge border border-warning text-warning px-4 py-2 rounded-pill fs-6" style={{ background: 'rgba(255,193,7,0.1)' }}>
                                            <i className="bi bi-clock me-2"></i>{new Date(selectedItem.tenggat_waktu).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                                    <div className="mb-2">
                                        <h6 className="fw-bold text-info mb-3 text-uppercase tracking-wider small">Lampiran</h6>
                                        <a
                                            href={`${api.defaults.baseURL || 'http://localhost:5000'}/api/content/${selectedType}/${selectedItem._id}/download/0?view=true`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center"
                                        >
                                            <i className="bi bi-download me-2 fs-5"></i> Buka {selectedItem.attachments[0].filename}
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

export default SessionDetail;