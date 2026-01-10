import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ManajemenModul = () => {
    // Data States
    const [praktikumList, setPraktikumList] = useState([]);
    const [selectedPraktikum, setSelectedPraktikum] = useState('');
    const [sessions, setSessions] = useState([]);
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        sesi_ke: '',
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        ruangan: 'Lab Komputer 1' // Default value matching your UI
    });

    // 1. Fetch Classes (On Mount)
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Using the dashboard endpoint we just made to get ONLY assigned classes
                const res = await api.get('/api/users/asdos-dashboard'); 
                setPraktikumList(res.data.myClasses);
            } catch (err) {
                console.error("Error fetching classes", err);
            }
        };
        fetchClasses();
    }, []);

    // 2. Fetch Sessions when a Class is selected
    useEffect(() => {
        if (!selectedPraktikum) {
            setSessions([]);
            return;
        }
        fetchSessions();
    }, [selectedPraktikum]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/content/session/list/${selectedPraktikum}`);
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Handle Create Session
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/content/session', {
                ...formData,
                id_praktikum: selectedPraktikum
            });
            alert("Jadwal Berhasil Disimpan!");
            setShowForm(false);
            fetchSessions(); // Refresh list
            
            // Auto increment session number for convenience
            setFormData(prev => ({...prev, sesi_ke: Number(prev.sesi_ke) + 1}));
        } catch (err) {
            alert(err.response?.data?.message || "Gagal membuat sesi");
        }
    };

    // 4. Handle Delete
    const handleDelete = async (id) => {
        if(!window.confirm("Hapus jadwal ini? Konten di dalamnya mungkin hilang.")) return;
        try {
            await api.delete(`/api/content/session/${id}`);
            fetchSessions();
        } catch (err) {
            alert("Gagal menghapus");
        }
    };

    return (
        <div className="container-fluid">
            {/* --- HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark">Manajemen Sesi & Konten</h3>
                    <p className="text-muted small mb-0">Atur jadwal pertemuan dan materi ajar di sini.</p>
                </div>
            </div>

            {/* --- SELECT CLASS CARD --- */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <label className="form-label fw-bold small text-muted text-uppercase">Pilih Kelas Praktikum</label>
                    <select 
                        className="form-select bg-light border-0 py-2"
                        value={selectedPraktikum}
                        onChange={(e) => setSelectedPraktikum(e.target.value)}
                    >
                        <option value="">-- Pilih Kelas --</option>
                        {praktikumList.map(p => (
                            <option key={p.id_praktikum} value={p.id_praktikum}>
                                {p.mata_kuliah} - Kelas {p.kode_kelas} ({p.tahun_pelajaran}))
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedPraktikum && (
                <>
                    {/* --- ACTION BAR --- */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold text-dark">Timeline Pertemuan</h5>
                        <button 
                            className={`btn ${showForm ? 'btn-light text-danger' : 'btn-primary'} shadow-sm fw-bold`} 
                            onClick={() => setShowForm(!showForm)}
                        >
                            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
                            {showForm ? 'Batal' : 'Buat Sesi Baru'}
                        </button>
                    </div>

                    {/* --- ADD SESSION FORM (Matches JadwalInput.jsx style) --- */}
                    {showForm && (
                        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                            <div className="card-header bg-white py-3 border-bottom-0">
                                <h6 className="mb-0 fw-bold text-primary">Form Input Jadwal</h6>
                            </div>
                            <div className="card-body p-4 pt-0">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label fw-bold small text-muted">Sesi Ke-</label>
                                            <input type="number" className="form-control bg-light border-0" required 
                                                value={formData.sesi_ke} onChange={e=>setFormData({...formData, sesi_ke: e.target.value})}/>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-bold small text-muted">Tanggal</label>
                                            <input type="date" className="form-control bg-light border-0" required
                                                value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})}/>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold small text-muted">Ruangan</label>
                                            <select className="form-select bg-light border-0" required
                                                value={formData.ruangan} onChange={e=>setFormData({...formData, ruangan: e.target.value})}>
                                                <option value="Lab Komputer 1">Lab Komputer 1</option>
                                                <option value="Lab Komputer 2">Lab Komputer 2</option>
                                                <option value="Lab Jaringan">Lab Jaringan</option>
                                                <option value="Lab Multimedia">Lab Multimedia</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold small text-muted">Jam Mulai</label>
                                            <input type="time" className="form-control bg-light border-0" required
                                                value={formData.waktu_mulai} onChange={e=>setFormData({...formData, waktu_mulai: e.target.value})}/>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold small text-muted">Jam Selesai</label>
                                            <input type="time" className="form-control bg-light border-0" required
                                                value={formData.waktu_selesai} onChange={e=>setFormData({...formData, waktu_selesai: e.target.value})}/>
                                        </div>
                                        <div className="col-md-6 d-flex align-items-end mb-3">
                                            <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm">
                                                <i className="bi bi-save me-2"></i>Simpan Jadwal
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* --- TIMELINE LIST (Matches Jadwal.jsx style) --- */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="list-group list-group-flush rounded-4">
                            {loading ? (
                                <div className="text-center py-5 text-muted">Loading data...</div>
                            ) : sessions.length === 0 ? (
                                <div className="list-group-item text-center text-muted py-5 border-0">
                                    <i className="bi bi-calendar-x fs-1 d-block mb-3 text-secondary opacity-50"></i>
                                    Belum ada jadwal pertemuan untuk kelas ini.
                                </div>
                            ) : (
                                sessions.map(s => (
                                    <div key={s.id_pertemuan} className="list-group-item p-4 border-bottom">
                                        <div className="d-flex w-100 justify-content-between align-items-center">
                                            
                                            {/* Left Info */}
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary me-3 text-center" style={{minWidth: '60px'}}>
                                                    <h5 className="mb-0 fw-bold">#{s.sesi_ke}</h5>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-dark">Pertemuan {s.sesi_ke}</h6>
                                                    <div className="text-muted small">
                                                        <i className="bi bi-calendar-event me-2"></i>{s.tanggal} 
                                                        <span className="mx-2">•</span> 
                                                        <i className="bi bi-clock me-2"></i>{s.waktu_mulai} - {s.waktu_selesai}
                                                        <br/>
                                                        <i className="bi bi-geo-alt me-2"></i>{s.ruangan}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Actions */}
                                            <div className="d-flex gap-2">
                                                {/* Manage Content Button */}
                                                <Link to={`/asdos/session/${s.id_pertemuan}`} className="btn btn-outline-primary btn-sm fw-bold px-3">
                                                    <i className="bi bi-folder2-open me-2"></i>Kelola Konten
                                                </Link>
                                                
                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => handleDelete(s.id_pertemuan)} 
                                                    className="btn btn-light text-danger border btn-sm"
                                                    title="Hapus Sesi"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManajemenModul;