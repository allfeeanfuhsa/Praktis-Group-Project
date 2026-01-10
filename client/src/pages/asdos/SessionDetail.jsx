import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const SessionDetail = () => {
    const { id_pertemuan } = useParams();
    
    // Data States
    const [materials, setMaterials] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [activeTab, setActiveTab] = useState('materi'); // 'materi' or 'tugas'
    const [materiForm, setMateriForm] = useState({ judul: '', deskripsi: '', file: null });
    const [tugasForm, setTugasForm] = useState({ judul: '', deskripsi: '', tenggat_waktu: '', file: null });

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

    return (
        <div className="container-fluid p-4">
            {/* HEADER */}
            <div className="mb-4">
                <button onClick={() => window.history.back()} className="btn btn-link text-decoration-none text-muted p-0 mb-2">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Jadwal
                </button>
                <h3 className="fw-bold">Kelola Konten Pertemuan</h3>
                <p className="text-muted small">Upload materi pembelajaran atau buat tugas baru.</p>
            </div>

            <div className="row">
                {/* LEFT COLUMN: CONTENT LIST */}
                <div className="col-md-7">
                    
                    {/* TABS */}
                    <ul className="nav nav-pills mb-3">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'materi' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('materi')}>
                                <i className="bi bi-file-earmark-pdf me-2"></i>Materi ({materials.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'tugas' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('tugas')}>
                                <i className="bi bi-pencil-square me-2"></i>Tugas ({tasks.length})
                            </button>
                        </li>
                    </ul>

                    {/* LIST AREA */}
                    {loading ? <div className="text-center py-5">Loading...</div> : (
                        <div className="card border-0 shadow-sm">
                            <div className="list-group list-group-flush">
                                {activeTab === 'materi' ? (
                                    materials.length === 0 ? <div className="p-4 text-center text-muted">Belum ada materi.</div> :
                                    materials.map(m => (
                                        <div key={m._id} className="list-group-item p-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-danger bg-opacity-10 p-3 rounded text-danger me-3">
                                                    <i className="bi bi-file-earmark-pdf fs-4"></i>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-1">{m.judul}</h6>
                                                    <p className="small text-muted mb-0">{m.deskripsi}</p>
                                                    {/* If attachment exists */}
                                                    {m.attachments && m.attachments[0] && (
                                                        <small className="text-primary mt-1 d-block">
                                                            <i className="bi bi-paperclip me-1"></i>{m.attachments[0].filename}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    tasks.length === 0 ? <div className="p-4 text-center text-muted">Belum ada tugas.</div> :
                                    tasks.map(t => (
                                        <div key={t._id} className="list-group-item p-4">
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-warning bg-opacity-10 p-3 rounded text-warning me-3">
                                                        <i className="bi bi-clipboard-check fs-4"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-1">{t.judul}</h6>
                                                        <p className="small text-muted mb-1">{t.deskripsi}</p>
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-clock me-1"></i>Deadline: {new Date(t.tenggat_waktu).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: FORM INPUT */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-primary">
                                {activeTab === 'materi' ? 'Upload Materi Baru' : 'Buat Tugas Baru'}
                            </h6>
                        </div>
                        <div className="card-body">
                            {activeTab === 'materi' ? (
                                /* MATERI FORM */
                                <form onSubmit={handleMateriSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Judul Materi</label>
                                        <input type="text" className="form-control" required 
                                            value={materiForm.judul} onChange={e=>setMateriForm({...materiForm, judul: e.target.value})}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Deskripsi</label>
                                        <textarea className="form-control" rows="2"
                                            value={materiForm.deskripsi} onChange={e=>setMateriForm({...materiForm, deskripsi: e.target.value})}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">File (PDF/PPT)</label>
                                        <input type="file" className="form-control" required
                                            onChange={e=>setMateriForm({...materiForm, file: e.target.files[0]})}/>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold">Upload</button>
                                </form>
                            ) : (
                                /* TUGAS FORM */
                                <form onSubmit={handleTugasSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Judul Tugas</label>
                                        <input type="text" className="form-control" required
                                            value={tugasForm.judul} onChange={e=>setTugasForm({...tugasForm, judul: e.target.value})}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Instruksi</label>
                                        <textarea className="form-control" rows="3" required
                                            value={tugasForm.deskripsi} onChange={e=>setTugasForm({...tugasForm, deskripsi: e.target.value})}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Deadline</label>
                                        <input type="datetime-local" className="form-control" required
                                            value={tugasForm.tenggat_waktu} onChange={e=>setTugasForm({...tugasForm, tenggat_waktu: e.target.value})}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Lampiran Soal (Opsional)</label>
                                        <input type="file" className="form-control"
                                            onChange={e=>setTugasForm({...tugasForm, file: e.target.files[0]})}/>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold">Buat Tugas</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionDetail;