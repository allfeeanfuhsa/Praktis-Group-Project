import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const TugasMhs = () => {
  const { id_praktikum } = useParams();
  const navigate = useNavigate();

  const [taskList, setTaskList] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 1. Get Sessions
        const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sessions = sessionRes.data || [];

        // 2. Get Tasks
        const allTasks = [];
        await Promise.all(sessions.map(async (session) => {
          try {
            const taskRes = await api.get(`/api/content/tugas/session/${session.id_pertemuan}`);
            const tasksWithSession = (taskRes.data || []).map(t => ({
              ...t,
              session_info: `Sesi ${session.sesi_ke}`
            }));
            allTasks.push(...tasksWithSession);
          } catch (err) { }
        }));

        // Sort by deadline
        allTasks.sort((a, b) => new Date(a.tenggat_waktu) - new Date(b.tenggat_waktu));
        setTaskList(allTasks);

        // 3. FETCH SUBMISSION STATUS BULK
        if (allTasks.length > 0) {
            const taskIds = allTasks.map(t => t._id);
            const statusRes = await api.post('/api/submission/me/bulk-check', { taskIds });
            setSubmissionStatus(statusRes.data || {});
        }

      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id_praktikum) fetchTasks();
  }, [id_praktikum]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getTimeStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffHours = (due - now) / 36e5;

    if (diffHours < 0) return { text: 'Closed', isUrgent: true };
    if (diffHours < 24) return { text: 'Segera', isUrgent: true };
    return { text: 'Open', isUrgent: false };
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
          <span className="visually-hidden">Loading tugas...</span>
        </div>
        <p className="opacity-75 mt-3 small">Memuat daftar tugas...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
        <button onClick={() => navigate('/mahasiswa/dashboard')} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
          <i className="bi bi-arrow-left me-2"></i>Kembali ke Dashboard
        </button>
        <h3 className="fw-bold text-white mb-1">Daftar Tugas Praktikum</h3>
        <p className="text-light opacity-75 small mb-0">Kerjakan dan kumpulkan berkas tugas sebelum tenggat waktu yang ditentukan.</p>
      </motion.div>

      {/* TASK LIST GRID */}
      {taskList.length === 0 ? (
        <div className="glass-card static rounded-4 p-5 text-center text-white">
          <i className="bi bi-clipboard-x fs-1 d-block mb-3 opacity-50 text-warning"></i>
          <h5 className="fw-bold mb-2">Tidak Ada Tugas</h5>
          <p className="text-light opacity-75 mb-0">Tidak ada tugas aktif yang perlu dikumpulkan saat ini.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4">
          {taskList.map((task) => {
            const timeStatus = getTimeStatus(task.tenggat_waktu);
            const mySub = submissionStatus[task._id];
            
            let statusBadge = <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary px-3 py-1.5 rounded-pill">Belum Dikerjakan</span>;

            if (mySub) {
                if (mySub.status === 'dinilai') {
                    statusBadge = <span className="badge bg-primary text-white border border-primary px-3 py-1.5 rounded-pill fw-bold">Nilai: {mySub.nilai}/100</span>;
                } else if (mySub.status === 'terlambat') {
                    statusBadge = <span className="badge bg-warning text-dark border border-warning px-3 py-1.5 rounded-pill fw-bold">Terlambat</span>;
                } else {
                    statusBadge = <span className="badge bg-success text-white border border-success px-3 py-1.5 rounded-pill fw-bold">Sudah Dikumpulkan</span>;
                }
            } else if (timeStatus.text === 'Closed') {
                 statusBadge = <span className="badge bg-danger text-white border border-danger px-3 py-1.5 rounded-pill">Tidak Mengumpulkan</span>;
            }

            return (
              <motion.div variants={itemVariants} key={task._id} className="col-12">
                <Link 
                  to={`/mahasiswa/kelas/${id_praktikum}/tugas/${task._id}`} 
                  className="text-decoration-none"
                >
                  <div className="glass-card rounded-4 p-4 d-flex justify-content-between align-items-center flex-wrap gap-3 hover-opacity-100">
                    
                    {/* Left Info */}
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <span className="badge border border-light text-light px-3 py-1 rounded-pill" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}>
                          {task.session_info}
                        </span>
                        
                        {statusBadge}

                        {!mySub && (
                            <span className={`badge px-2.5 py-1 rounded-pill ${timeStatus.isUrgent ? 'bg-danger text-white border border-danger' : 'bg-success bg-opacity-25 text-success border border-success'}`}>
                              {timeStatus.text}
                            </span>
                        )}
                      </div>

                      <h5 className="fw-bold text-white mb-2 text-truncate">{task.judul}</h5>
                      <p className="text-light opacity-75 small mb-0">
                        <i className="bi bi-clock me-2 text-warning"></i> 
                        Deadline: {formatDate(task.tenggat_waktu)}
                      </p>
                    </div>

                    {/* Right Arrow */}
                    <div className="d-flex align-items-center gap-2 text-white">
                      <span className="fw-bold small d-none d-md-inline">Buka Tugas</span>
                      <i className="bi bi-chevron-right fs-4 text-light opacity-75"></i>
                    </div>

                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default TugasMhs;