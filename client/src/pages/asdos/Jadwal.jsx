import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

import ClassHeaderBanner from '../../components/ClassHeaderBanner';

const JadwalAsdos = () => {
  const { id_praktikum } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Editing
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    ruangan: ''
  });

  // Fetch Data
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/content/session/list/${id_praktikum}`);
      const rawSessions = response.data || [];

      // Enrich sessions with uploaded material and task counts
      const enrichedSessions = await Promise.all(rawSessions.map(async (session) => {
        let materiCount = 0;
        let tugasCount = 0;

        try {
          const [matRes, tugRes] = await Promise.all([
            api.get(`/api/content/materi/session/${session.id_pertemuan}`).catch(() => ({ data: [] })),
            api.get(`/api/content/tugas/session/${session.id_pertemuan}`).catch(() => ({ data: [] }))
          ]);
          materiCount = (matRes.data || []).length;
          tugasCount = (tugRes.data || []).length;
        } catch (e) {
          // Ignore error
        }

        return {
          ...session,
          materiCount,
          tugasCount
        };
      }));

      const sorted = enrichedSessions.sort((a, b) => a.sesi_ke - b.sesi_ke);
      setSessions(sorted);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_praktikum) fetchSessions();
  }, [id_praktikum]);

  // --- HANDLERS ---
  const handleEditClick = (session) => {
    setEditingSession(session);
    setFormData({
      tanggal: session.tanggal.split('T')[0],
      waktu_mulai: session.waktu_mulai,
      waktu_selesai: session.waktu_selesai,
      ruangan: session.ruangan
    });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/content/session/${editingSession.id_pertemuan}`, formData);
      alert("Jadwal berhasil diperbarui!");
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      console.error("Update error:", err);
      alert("Gagal memperbarui jadwal.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
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

  if (loading) return <div className="text-center py-5">Loading jadwal...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid px-0">

      {/* HEADER BANNER */}
      <ClassHeaderBanner 
        id_praktikum={id_praktikum} 
        activeTab="Manajemen Jadwal & Sesi" 
        backUrl={`/asdos/kelas/${id_praktikum}`} 
        backLabel="Kembali ke Class Hub" 
      />

      {/* SESSION LIST */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
        {sessions.map((session) => (
          <motion.div variants={itemVariants} key={session.id_pertemuan} className="col-md-6 col-lg-4">
            <div className="glass-card rounded-4 h-100 d-flex flex-column p-4">

              {/* Top: Info */}
              <div className="d-flex flex-column mb-3 flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                    Sesi {session.sesi_ke}
                  </span>

                  <div className="d-flex gap-1.5 flex-wrap">
                    <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-25 px-2.5 py-1.5 rounded-pill small" title={`${session.materiCount || 0} Materi Uploaded`}>
                      <i className="bi bi-file-earmark-text me-1"></i>{session.materiCount || 0} Materi
                    </span>
                    <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25 px-2.5 py-1.5 rounded-pill small" title={`${session.tugasCount || 0} Tugas Uploaded`}>
                      <i className="bi bi-clipboard-check me-1"></i>{session.tugasCount || 0} Tugas
                    </span>
                  </div>
                </div>

                <h4 className="fw-bold text-white mb-3">
                  {formatDate(session.tanggal)}
                </h4>

                <div className="glass-card static p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-clock me-3 text-light opacity-75"></i>
                    <span className="fw-bold text-white">{session.waktu_mulai} - {session.waktu_selesai}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt me-3 text-light opacity-75"></i>
                    <span className="fw-bold text-white">{session.ruangan}</span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <hr className="border-light opacity-25 my-3" />

              {/* Bottom: Actions */}
              <div className="d-grid gap-2">
                <Link
                  to={`/asdos/kelas/${id_praktikum}/session/${session.id_pertemuan}`}
                  className="btn btn-primary fw-bold"
                >
                  <i className="bi bi-folder-plus me-2"></i>Kelola Konten
                </Link>
                <button
                  onClick={() => handleEditClick(session)}
                  className="btn btn-light fw-bold"
                >
                  <i className="bi bi-pencil me-2"></i>Edit Waktu
                </button>
              </div>

            </div>
          </motion.div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-muted py-5">
            Belum ada sesi yang dibuat untuk kelas ini. Hubungi Admin.
          </div>
        )}
      </motion.div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-0 shadow-lg bg-light">
              <div className="modal-header border-bottom border-light border-opacity-25">
                <h5 className="modal-title fw-bold text-light">Ubah Jadwal Sesi {editingSession?.sesi_ke}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSaveChanges}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light opacity-75">Tanggal</label>
                    <input type="date" className="form-control" name="tanggal"
                      value={formData.tanggal} onChange={handleModalChange} required />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold text-light opacity-75">Mulai</label>
                      <input type="time" className="form-control" name="waktu_mulai"
                        value={formData.waktu_mulai} onChange={handleModalChange} required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold text-light opacity-75">Selesai</label>
                      <input type="time" className="form-control" name="waktu_selesai"
                        value={formData.waktu_selesai} onChange={handleModalChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light opacity-75">Ruangan</label>
                    <select className="form-select" name="ruangan"
                      value={formData.ruangan} onChange={handleModalChange} required>
                      <option value="" disabled>-- Pilih Ruangan --</option>
                      <option value="Lab B">Lab B</option>
                      <option value="Lab C">Lab C</option>
                      <option value="Lab D">Lab D</option>
                      <option value="Lab Cisco">Lab Cisco</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary fw-bold">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalAsdos;