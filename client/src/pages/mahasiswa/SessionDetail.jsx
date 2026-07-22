import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const SessionDetailMhs = () => {
  const { id_praktikum, id_session } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Get Session Info
        const sessRes = await api.get(`/api/content/session/${id_session}`);
        setSession(sessRes.data);

        // 2. Get Materials
        try {
            const matRes = await api.get(`/api/content/materi/session/${id_session}`);
            setMaterials(matRes.data || []);
        } catch(e) { setMaterials([]); }

        // 3. Get Tasks
        try {
            const taskRes = await api.get(`/api/content/tugas/session/${id_session}`);
            setTasks(taskRes.data || []);
        } catch(e) { setTasks([]); }

      } catch (err) {
        console.error("Error loading session detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id_session]);

  const handleShowDetailModal = (item) => {
    setModalItem(item);
    setShowDetailModal(true);
  };

  const getFileIcon = (mimetype) => {
    if (!mimetype) return 'bi-file-earmark';
    if (mimetype.includes('pdf')) return 'bi-file-earmark-pdf text-danger';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'bi-file-earmark-word text-primary';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'bi-file-earmark-excel text-success';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'bi-file-earmark-ppt text-warning';
    if (mimetype.includes('image')) return 'bi-file-earmark-image text-info';
    return 'bi-file-earmark';
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
          <span className="visually-hidden">Loading detail...</span>
        </div>
        <p className="opacity-75 mt-3 small">Memuat detail sesi pertemuan...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="glass-card static rounded-4 p-4 text-white text-center">
        <i className="bi bi-exclamation-circle fs-1 d-block mb-3 text-danger"></i>
        Sesi tidak ditemukan
      </div>
    );
  }

  const baseURL = api.defaults.baseURL || 'http://localhost:5000';

  return (
    <div className="container-fluid px-0">
      
      {/* HEADER / NAV */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
        <button onClick={() => navigate(`/mahasiswa/kelas/${id_praktikum}/jadwal`)} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
          <i className="bi bi-arrow-left me-2"></i>Kembali ke Jadwal
        </button>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)' }}>
            Sesi {session.sesi_ke}
          </span>
          <h3 className="fw-bold text-white mb-0">Detail Pertemuan Praktikum</h3>
        </div>
      </motion.div>

      {/* TOP SESSION INFO CARD */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card static rounded-4 p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <small className="text-light opacity-75 d-block text-uppercase tracking-wider fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Tanggal Pertemuan</small>
            <div className="fw-bold text-white fs-5">
              {new Date(session.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="col-md-4">
            <small className="text-light opacity-75 d-block text-uppercase tracking-wider fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Waktu Pelaksanaan</small>
            <div className="fw-bold text-white fs-5"><i className="bi bi-clock me-2 text-info"></i>{session.waktu_mulai} - {session.waktu_selesai}</div>
          </div>
          <div className="col-md-4">
            <small className="text-light opacity-75 d-block text-uppercase tracking-wider fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Ruangan Praktikum</small>
            <div className="fw-bold text-white fs-5"><i className="bi bi-geo-alt me-2 text-warning"></i>{session.ruangan}</div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
        {/* LEFT COLUMN: Materials */}
        <motion.div variants={itemVariants} className="col-lg-8">
           <h5 className="fw-bold text-white mb-3 d-flex align-items-center">
             <i className="bi bi-journal-text me-2 text-info"></i>Materi Pembelajaran
           </h5>

           {materials.length === 0 ? (
               <div className="glass-card static rounded-4 p-4 text-center text-light opacity-75">
                 Belum ada materi yang diunggah untuk sesi ini.
               </div>
           ) : (
               materials.map(mat => (
                   <div key={mat._id} className="glass-card rounded-4 p-4 mb-3">
                       <div className="d-flex justify-content-between align-items-start mb-2">
                           <h5 className="fw-bold text-white mb-1">{mat.judul}</h5>
                           <button onClick={() => handleShowDetailModal(mat)} className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold">
                               <i className="bi bi-eye me-1"></i>Detail
                           </button>
                       </div>
                       <p className="text-light opacity-75 small mb-3" style={{ whiteSpace: 'pre-wrap' }}>{mat.deskripsi}</p>
                       
                       {/* Attachments */}
                       {mat.attachments && mat.attachments.length > 0 && (
                           <div className="d-flex flex-wrap gap-2 pt-2 border-top border-light border-opacity-10">
                               {mat.attachments.map((file, idx) => (
                                   <a 
                                     key={idx}
                                     href={`${baseURL}/api/content/materi/${mat._id}/download/${idx}?view=true`}
                                     target="_blank" rel="noopener noreferrer"
                                     className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none d-inline-flex align-items-center gap-2 hover-opacity-100"
                                   >
                                      <i className={`bi ${getFileIcon(file.mimetype)}`}></i>
                                      <span>{file.filename}</span>
                                      <i className="bi bi-box-arrow-up-right small"></i>
                                   </a>
                               ))}
                           </div>
                       )}
                   </div>
               ))
           )}
        </motion.div>

        {/* RIGHT COLUMN: Tasks */}
        <motion.div variants={itemVariants} className="col-lg-4">
           <h5 className="fw-bold text-white mb-3 d-flex align-items-center">
             <i className="bi bi-clipboard-check me-2 text-warning"></i>Tugas Sesi Ini
           </h5>

           {tasks.length === 0 ? (
               <div className="glass-card static rounded-4 p-4 text-center text-light opacity-75">
                   <i className="bi bi-clipboard-check fs-1 mb-2 d-block opacity-50"></i>
                   <p className="small mb-0">Tidak ada tugas pada sesi ini.</p>
               </div>
           ) : (
               tasks.map(task => {
                   const isClosed = new Date() > new Date(task.tenggat_waktu);

                   return (
                       <div key={task._id} className="glass-card rounded-4 p-4 mb-3">
                           <div className="d-flex justify-content-between align-items-start mb-2">
                               <h6 className="fw-bold text-white mb-0 text-truncate" style={{maxWidth: '70%'}}>{task.judul}</h6>
                               {isClosed ? (
                                 <span className="badge bg-danger text-white border border-danger px-2.5 py-1 rounded-pill small">Closed</span>
                               ) : (
                                 <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small">Open</span>
                               )}
                           </div>
                           <p className="text-light opacity-75 small mb-3">
                              <i className="bi bi-clock me-1"></i>Deadline: {new Date(task.tenggat_waktu).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           </p>
                           <Link 
                             to={`/mahasiswa/kelas/${id_praktikum}/tugas/${task._id}`} 
                             className="btn btn-light shadow-sm rounded-pill fw-bold w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                           >
                             <span>Lihat & Kumpulkan</span>
                             <i className="bi bi-arrow-right"></i>
                           </Link>
                       </div>
                   );
               })
           )}
        </motion.div>
      </motion.div>

      {/* DETAIL MODAL (Rendered via Portal to document.body) */}
      {showDetailModal && modalItem && createPortal(
        <div 
          className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100" 
          tabIndex="-1" 
          style={{ 
            zIndex: 99999, 
            background: 'rgba(0, 0, 0, 0.75)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            overflowY: 'auto',
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetailModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 100000, pointerEvents: 'auto' }}>
            <div 
              className="glass-card static rounded-4 shadow-lg p-0 text-white w-100 overflow-hidden" 
              style={{ 
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}
            >
              <div className="p-4 border-bottom border-light border-opacity-10 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold text-white mb-0">{modalItem.judul}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="p-4">
                <h6 className="fw-bold text-light opacity-75 mb-2">Deskripsi:</h6>
                <div className="glass-card static p-3 rounded-3 mb-4 text-light" style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.05)' }}>
                  {modalItem.deskripsi || 'Tidak ada deskripsi.'}
                </div>

                {modalItem.attachments && modalItem.attachments.length > 0 && (
                  <div>
                    <h6 className="fw-bold text-light opacity-75 mb-2">Berkas Lampiran:</h6>
                    <div className="d-flex flex-column gap-2">
                      {modalItem.attachments.map((file, idx) => (
                        <a
                          key={idx}
                          href={`${baseURL}/api/content/materi/${modalItem._id}/download/${idx}?view=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-card static rounded-3 p-3 text-white text-decoration-none d-flex justify-content-between align-items-center hover-opacity-100"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <i className={`bi ${getFileIcon(file.mimetype)} fs-4`}></i>
                            <span className="fw-bold">{file.filename}</span>
                          </div>
                          <span className="badge bg-light bg-opacity-25 text-white rounded-pill px-3 py-1.5">
                            Buka File <i className="bi bi-box-arrow-up-right ms-1"></i>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-top border-light border-opacity-10 text-end">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SessionDetailMhs;