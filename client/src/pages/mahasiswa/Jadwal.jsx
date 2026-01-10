import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const JadwalMhs = () => {
  const { id_praktikum } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sorted = res.data.sort((a, b) => a.sesi_ke - b.sesi_ke);
        setSessions(sorted);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id_praktikum) fetchSessions();
  }, [id_praktikum]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) return <div className="text-center py-5">Loading jadwal...</div>;

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Jadwal Praktikum</h3>
        <p className="text-muted small">Informasi waktu dan ruangan untuk setiap sesi.</p>
      </div>

      <div className="row">
        {sessions.length === 0 ? (
          <div className="col-12 text-muted text-center py-5 bg-light rounded">
            Belum ada jadwal yang dirilis.
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id_pertemuan} className="col-12 mb-3">
              <div className="card shadow-sm border-0 rounded-3 hover-effect">
                <div className="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                  
                  {/* Session Info */}
                  <div className="d-flex align-items-center gap-4">
                    <div className="text-center bg-light rounded p-3 border" style={{minWidth: '80px'}}>
                      <span className="d-block small text-muted text-uppercase fw-bold">Sesi</span>
                      <span className="h3 fw-bold text-primary mb-0">{session.sesi_ke}</span>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">{formatDate(session.tanggal)}</h5>
                      <div className="d-flex flex-wrap gap-3 text-muted small">
                         <span><i className="bi bi-clock me-1"></i> {session.waktu_mulai} - {session.waktu_selesai}</span>
                         <span><i className="bi bi-geo-alt me-1"></i> {session.ruangan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <Link 
                    to={`/mahasiswa/kelas/${id_praktikum}/session/${session.id_pertemuan}`} 
                    className="btn btn-outline-primary fw-bold"
                  >
                    Lihat Detail <i className="bi bi-arrow-right ms-2"></i>
                  </Link>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JadwalMhs;