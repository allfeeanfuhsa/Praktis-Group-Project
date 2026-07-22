import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const Tugas = () => {
  const { id_praktikum } = useParams();
  const navigate = useNavigate();
  
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleShowDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!id_praktikum) return;

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Sessions first (SQL)
        const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sessions = sessionRes.data || [];

        // 2. Fetch Tasks for each Session (NoSQL)
        const allTasks = [];
        
        await Promise.all(sessions.map(async (session) => {
          try {
            const taskRes = await api.get(`/api/content/tugas/session/${session.id_pertemuan}`);
            const rawTasks = taskRes.data || [];
            
            const enrichedTasks = await Promise.all(rawTasks.map(async (t) => {
              let pendingCount = 0;
              let totalSubmissions = 0;

              try {
                const subRes = await api.get(`/api/submission/task/${t._id}`);
                const subs = subRes.data?.submissions || [];
                totalSubmissions = subs.length;
                pendingCount = subs.filter(s => s.nilai === null || s.nilai === undefined).length;
              } catch (e) {
                // Ignore if no submissions
              }

              return {
                ...t,
                session_name: `Sesi ${session.sesi_ke}`,
                session_id: session.id_pertemuan,
                pendingCount,
                totalSubmissions
              };
            }));

            allTasks.push(...enrichedTasks);
          } catch (err) {
            console.error(`No tasks for session ${session.id_pertemuan}`);
          }
        }));

        // Sort by deadline (closest first)
        allTasks.sort((a, b) => new Date(a.tenggat_waktu) - new Date(b.tenggat_waktu));
        
        if (isMounted) setTaskList(allTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        if (isMounted) setError("Gagal memuat daftar tugas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id_praktikum]);

  // Helper: Check if deadline is passed or within 24 hours
  const checkUrgency = (deadlineString) => {
    if (!deadlineString) return false;
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 1 && diffDays >= 0; // True if due today or tomorrow
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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

  const baseURL = api.defaults.baseURL || 'http://localhost:5000';

  if (loading) {
    return (
      <div className="text-center py-5 text-light">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="opacity-75 mt-3">Memuat daftar tugas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card static rounded-4 p-4 text-white text-center">
        <i className="bi bi-exclamation-circle fs-1 d-block mb-3 text-danger"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
        <button onClick={() => navigate(`/asdos/kelas/${id_praktikum}`)} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
          <i className="bi bi-arrow-left me-2"></i>Kembali ke Kelas Hub
        </button>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h3 className="fw-bold text-white mb-2">Daftar Tugas</h3>
            <p className="text-light opacity-75 small mb-0">Total {taskList.length} tugas terdaftar</p>
          </div>
        </div>
      </motion.div>

      {/* LIST TUGAS */}
      {taskList.length === 0 ? (
        <div className="glass-card static rounded-4 p-5 text-center text-white">
          <i className="bi bi-clipboard-x fs-1 d-block mb-3 opacity-50"></i>
          <h5 className="fw-bold mb-2">Belum Ada Tugas</h5>
          <p className="text-light opacity-75 mb-0">Tugas praktikum belum dibuat untuk kelas ini.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
          {taskList.map((item) => {
            const isUrgent = checkUrgency(item.tenggat_waktu);
            const hasAttachment = item.attachments && item.attachments.length > 0;
            const attachment = hasAttachment ? item.attachments[0] : null;
            const targetSessionId = item.session_id || item.id_pertemuan;

            return (
              <motion.div variants={itemVariants} className="col-md-6 col-lg-4" key={item._id}>
                <div 
                  className="glass-card rounded-4 h-100 d-flex flex-column p-4 justify-content-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleShowDetail(item)}
                >
                  <div>
                    {/* Top: Session Badge & Deadline Badge */}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                        <i className="bi bi-calendar-event me-2"></i>{item.session_name}
                      </span>
                      <small className={`fw-bold px-3 py-1.5 rounded-pill border ${
                        isUrgent 
                          ? 'text-danger bg-danger bg-opacity-25 border-danger' 
                          : 'text-warning border-warning'
                      }`} style={!isUrgent ? { background: 'rgba(255,193,7,0.1)' } : {}}>
                        <i className="bi bi-clock me-1"></i>{formatDate(item.tenggat_waktu)}
                      </small>
                    </div>

                    {/* Content Header */}
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-warning bg-opacity-25 p-3 rounded-4 text-white me-3 shadow-sm position-relative">
                        <i className="bi bi-clipboard-check fs-3"></i>
                        {item.pendingCount > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" title={`${item.pendingCount} Menunggu Penilaian`}>
                            {item.pendingCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <h5 className="fw-bold text-white mb-0 text-truncate">{item.judul}</h5>
                          {item.pendingCount > 0 ? (
                            <span className="badge bg-danger text-white border border-danger px-2.5 py-1 rounded-pill small">
                              <i className="bi bi-exclamation-circle me-1"></i>{item.pendingCount} Menunggu
                            </span>
                          ) : item.totalSubmissions > 0 ? (
                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small">
                              <i className="bi bi-check-circle me-1"></i>Selesai Dinilai
                            </span>
                          ) : null}
                        </div>
                        {attachment && (
                          <small className="text-light opacity-75 d-block text-truncate">
                            {attachment.filename}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Attachment Link */}
                    {attachment && (
                      <div className="mb-3">
                        <a
                          href={`${baseURL}/api/content/tugas/${item._id}/download/0?view=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none d-inline-block hover-opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="bi bi-paperclip me-2"></i>{attachment.filename}
                        </a>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 pt-2 border-top border-light border-opacity-10">
                      <Link 
                        to={`/asdos/kelas/${id_praktikum}/tugas/${item._id}/grade`} 
                        className="btn btn-primary btn-sm fw-bold rounded-pill px-3 flex-grow-1 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="bi bi-check-circle me-1"></i> Lihat Pengumpulan
                      </Link>
                      
                      {/* Updated Edit Button -> Links to SessionDetail.jsx */}
                      {targetSessionId && (
                        <Link 
                          to={`/asdos/kelas/${id_praktikum}/session/${targetSessionId}`}
                          className="btn btn-light btn-sm fw-bold rounded-pill px-3"
                          onClick={(e) => e.stopPropagation()}
                          title="Edit di Pertemuan"
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedItem && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backdropFilter: 'blur(15px)' }} onClick={() => setShowDetailModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content glass-card border-light border-opacity-25 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom border-light border-opacity-10 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h4 className="modal-title fw-bold text-white d-flex align-items-center m-0">
                  <div className="p-2 rounded-circle me-3 bg-warning text-white bg-opacity-25">
                    <i className="bi bi-clipboard-check fs-4"></i>
                  </div>
                  {selectedItem.judul}
                </h4>
                <button type="button" className="btn-close btn-close-white opacity-75 hover-opacity-100" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body text-white p-4">
                <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
                  <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <i className="bi bi-calendar-event me-2"></i>{selectedItem.session_name}
                  </span>
                  <span className="badge border border-warning text-warning px-3 py-2 rounded-pill" style={{ background: 'rgba(255,193,7,0.1)' }}>
                    <i className="bi bi-clock me-2"></i>Deadline: {formatDate(selectedItem.tenggat_waktu)}
                  </span>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-info mb-3 text-uppercase tracking-wider small">Instruksi Tugas</h6>
                  <div className="fs-5 opacity-75" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {selectedItem.deskripsi || "Tidak ada deskripsi."}
                  </div>
                </div>

                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                  <div className="mb-2">
                    <h6 className="fw-bold text-info mb-3 text-uppercase tracking-wider small">Lampiran Soal</h6>
                    <a
                      href={`${baseURL}/api/content/tugas/${selectedItem._id}/download/0?view=true`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center"
                    >
                      <i className="bi bi-eye me-2 fs-5"></i> Buka & View {selectedItem.attachments[0].filename}
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 p-4 justify-content-between">
                <div>
                  {(selectedItem.session_id || selectedItem.id_pertemuan) && (
                    <Link
                      to={`/asdos/kelas/${id_praktikum}/session/${selectedItem.session_id || selectedItem.id_pertemuan}`}
                      className="btn btn-outline-light fw-bold rounded-pill px-4 me-2"
                    >
                      <i className="bi bi-pencil me-2"></i>Edit di Pertemuan
                    </Link>
                  )}
                  <Link
                    to={`/asdos/kelas/${id_praktikum}/tugas/${selectedItem._id}/grade`}
                    className="btn btn-primary fw-bold rounded-pill px-4"
                  >
                    <i className="bi bi-check-circle me-2"></i>Lihat Pengumpulan
                  </Link>
                </div>
                <button type="button" className="btn btn-light fw-bold rounded-pill px-5" onClick={() => setShowDetailModal(false)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tugas;