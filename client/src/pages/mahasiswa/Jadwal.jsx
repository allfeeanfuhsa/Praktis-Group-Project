import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import ClassHeaderBanner from '../../components/ClassHeaderBanner';

const JadwalMhs = () => {
  const { id_praktikum } = useParams();
  const navigate = useNavigate();
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
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
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
          <span className="visually-hidden">Loading jadwal...</span>
        </div>
        <p className="opacity-75 mt-3 small">Memuat jadwal praktikum...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* HEADER BANNER */}
      <ClassHeaderBanner 
        id_praktikum={id_praktikum} 
        activeTab="Jadwal Sesi Pertemuan" 
        backUrl="/mahasiswa/dashboard" 
        backLabel="Kembali ke Dashboard" 
      />

      {/* SESSION CARDS GRID */}
      {sessions.length === 0 ? (
        <div className="glass-card static rounded-4 p-5 text-center text-white">
          <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50 text-warning"></i>
          <h5 className="fw-bold mb-2">Belum Ada Sesi</h5>
          <p className="text-light opacity-75 mb-0">Belum ada sesi praktikum yang dirilis untuk kelas ini.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
          {sessions.map((session) => (
            <motion.div variants={itemVariants} key={session.id_pertemuan} className="col-12">
              <div className="glass-card rounded-4 p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                
                {/* Session Info */}
                <div className="d-flex align-items-center gap-4">
                  <div className="glass-card static rounded-4 p-3 text-center border-light border-opacity-25" style={{ minWidth: '90px' }}>
                    <span className="d-block small text-light opacity-75 text-uppercase tracking-wider fw-bold">Sesi</span>
                    <span className="h2 fw-bold text-white mb-0">{session.sesi_ke}</span>
                  </div>

                  <div>
                    <h5 className="fw-bold text-white mb-2">{formatDate(session.tanggal)}</h5>
                    <div className="d-flex flex-wrap gap-3 text-light opacity-75 small">
                       <span><i className="bi bi-clock me-1 text-info"></i> {session.waktu_mulai} - {session.waktu_selesai}</span>
                       <span><i className="bi bi-geo-alt me-1 text-warning"></i> {session.ruangan}</span>
                    </div>
                  </div>
                </div>

                {/* Action Link */}
                <div>
                  <Link 
                    to={`/mahasiswa/kelas/${id_praktikum}/session/${session.id_pertemuan}`} 
                    className="btn btn-light shadow-sm rounded-pill px-4 py-2.5 fw-bold d-inline-flex align-items-center gap-2"
                  >
                    <span>Lihat Detail Sesi</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default JadwalMhs;