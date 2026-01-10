import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const Jadwal = () => {
    // 1. Get Class ID from URL
    const { id_praktikum } = useParams();
    
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Fetch Timeline
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // Uses the same public endpoint as Asdos
                const res = await api.get(`/api/content/session/list/${id_praktikum}`);
                setSessions(res.data);
            } catch (err) {
                console.error("Error fetching sessions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [id_praktikum]);

    return (
        <div className="container-fluid p-4">
            {/* HEADER */}
            <div className="mb-4">
                <Link to="/mahasiswa/dashboard" className="text-decoration-none text-muted mb-2 d-block fw-bold small">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Dashboard
                </Link>
                <h3 className="fw-bold text-dark">Timeline Praktikum</h3>
                <p className="text-muted small">Pilih pertemuan di bawah untuk mengakses materi dan tugas.</p>
            </div>

            {/* TIMELINE LIST */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="list-group list-group-flush rounded-4">
                    {loading ? (
                        <div className="text-center py-5">Loading jadwal...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-25"></i>
                            Belum ada jadwal sesi untuk kelas ini.
                        </div>
                    ) : (
                        sessions.map(s => (
                            <div key={s.id_pertemuan} className="list-group-item p-4 border-bottom hover-bg-light">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    
                                    {/* Left: Session Info */}
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-4 text-center me-3" style={{minWidth: '70px'}}>
                                            <span className="small text-uppercase fw-bold text-primary d-block" style={{fontSize: '0.65rem'}}>Sesi</span>
                                            <h4 className="mb-0 fw-bold text-primary">{s.sesi_ke}</h4>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">Pertemuan {s.sesi_ke}</h6>
                                            <div className="text-muted small">
                                                <i className="bi bi-calendar-event me-2"></i>{s.tanggal}
                                                <span className="mx-2">•</span>
                                                <i className="bi bi-clock me-2"></i>{s.waktu_mulai} - {s.waktu_selesai}
                                            </div>
                                            <div className="text-muted small mt-1">
                                                <i className="bi bi-geo-alt me-2"></i>{s.ruangan}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right: Action Button */}
                                    <Link 
                                        to={`/mahasiswa/session/${s.id_pertemuan}`} 
                                        className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm"
                                    >
                                        Buka Sesi <i className="bi bi-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Jadwal;