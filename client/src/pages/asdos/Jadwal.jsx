import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const JadwalAsdos = () => {
  const { id_praktikum } = useParams();

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
      const sorted = response.data.sort((a, b) => a.sesi_ke - b.sesi_ke);
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

  if (loading) return <div className="text-center py-5">Loading jadwal...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid px-0">

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Manajemen Jadwal</h3>
        <p className="text-muted small">Atur waktu dan kelola materi untuk setiap pertemuan.</p>
      </div>

      {/* SESSION LIST */}
      <div className="row">
        {sessions.map((session) => (
          <div key={session.id_pertemuan} className="col-12 mb-3">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body d-flex flex-column flex-md-row align-items-center justify-content-between p-4 gap-3">

                {/* Left: Info */}
                <div className="d-flex align-items-center gap-4 w-100">
                  {/* Session Badge */}
                  <div className="text-center bg-light rounded p-3 border" style={{ minWidth: '80px' }}>
                    <span className="d-block small text-muted text-uppercase fw-bold">Sesi</span>
                    <span className="h3 fw-bold text-primary mb-0">{session.sesi_ke}</span>
                  </div>

                  {/* Details */}
                  <div>
                    <h5 className="fw-bold mb-1">
                      {formatDate(session.tanggal)}
                    </h5>
                    <div className="d-flex gap-3 text-muted small">
                      <span><i className="bi bi-clock me-1"></i> {session.waktu_mulai} - {session.waktu_selesai}</span>
                      <span><i className="bi bi-geo-alt me-1"></i> {session.ruangan}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="d-flex gap-2">
                  {/* 1. Edit Time/Room Button */}
                  <button
                    onClick={() => handleEditClick(session)}
                    className="btn btn-outline-secondary btn-sm fw-bold px-3 text-nowrap"
                  >
                    <i className="bi bi-pencil me-2"></i>Edit Waktu
                  </button>

                  {/* 2. NEW: Manage Content Button (Links to SessionDetail.jsx) */}
                  <Link
                    to={`/asdos/kelas/${id_praktikum}/session/${session.id_pertemuan}`}
                    className="btn btn-primary btn-sm fw-bold px-3 text-nowrap"
                  >
                    <i className="bi bi-folder-plus me-2"></i>Kelola Konten
                  </Link>
                </div>

              </div>
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-muted py-5">
            Belum ada sesi yang dibuat untuk kelas ini. Hubungi Admin.
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Ubah Jadwal Sesi {editingSession?.sesi_ke}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSaveChanges}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Tanggal</label>
                    <input type="date" className="form-control" name="tanggal"
                      value={formData.tanggal} onChange={handleModalChange} required />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold text-muted">Mulai</label>
                      <input type="time" className="form-control" name="waktu_mulai"
                        value={formData.waktu_mulai} onChange={handleModalChange} required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold text-muted">Selesai</label>
                      <input type="time" className="form-control" name="waktu_selesai"
                        value={formData.waktu_selesai} onChange={handleModalChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Ruangan</label>
                    <input type="text" className="form-control" name="ruangan"
                      value={formData.ruangan} onChange={handleModalChange} required />
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