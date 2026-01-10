import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const TugasMhs = () => {
  const { id_praktikum } = useParams();

  const [taskList, setTaskList] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState({}); // Map of taskId -> statusObj
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 1. Get Sessions
        const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sessions = sessionRes.data;

        // 2. Get Tasks
        const allTasks = [];
        await Promise.all(sessions.map(async (session) => {
          try {
            const taskRes = await api.get(`/api/content/tugas/session/${session.id_pertemuan}`);
            const tasksWithSession = taskRes.data.map(t => ({
              ...t,
              session_info: `Sesi ${session.sesi_ke}`
            }));
            allTasks.push(...tasksWithSession);
          } catch (err) { }
        }));

        // Sort by deadline
        allTasks.sort((a, b) => new Date(a.tenggat_waktu) - new Date(b.tenggat_waktu));
        setTaskList(allTasks);

        // 3. FETCH SUBMISSION STATUS (The new logic)
        if (allTasks.length > 0) {
            const taskIds = allTasks.map(t => t._id);
            const statusRes = await api.post('/api/submission/me/bulk-check', { taskIds });
            setSubmissionStatus(statusRes.data);
        }

      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id_praktikum) fetchTasks();
  }, [id_praktikum]);

  // Helper: Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper: Deadline Status (Time based)
  const getTimeStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffHours = (due - now) / 36e5;

    if (diffHours < 0) return { text: 'Closed', color: 'secondary' }; // Expired
    if (diffHours < 24) return { text: 'Segera', color: 'danger' };
    return { text: 'Open', color: 'success' };
  };

  if (loading) return <div className="text-center py-5">Loading tugas...</div>;

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Daftar Tugas</h3>
        <p className="text-muted small">Kerjakan dan kumpulkan tugas sebelum tenggat waktu.</p>
      </div>

      <div className="row">
        {taskList.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted bg-light rounded">
            Tidak ada tugas aktif saat ini.
          </div>
        ) : (
          taskList.map((task) => {
            const timeStatus = getTimeStatus(task.tenggat_waktu);
            const mySub = submissionStatus[task._id]; // Check if we have a submission
            
            // Determine Card Border/Color based on submission
            let cardBorderClass = "border-start border-5 border-secondary"; // Default
            let statusBadge = <span className="badge bg-secondary">Belum Dikerjakan</span>;

            if (mySub) {
                if (mySub.status === 'dinilai') {
                    cardBorderClass = "border-start border-5 border-primary";
                    statusBadge = <span className="badge bg-primary">Nilai: {mySub.nilai}/100</span>;
                } else if (mySub.status === 'terlambat') {
                    cardBorderClass = "border-start border-5 border-warning";
                    statusBadge = <span className="badge bg-warning text-dark">Terlambat</span>;
                } else {
                    cardBorderClass = "border-start border-5 border-success";
                    statusBadge = <span className="badge bg-success">Sudah Dikumpulkan</span>;
                }
            } else if (timeStatus.text === 'Closed') {
                 statusBadge = <span className="badge bg-danger">Tidak Mengumpulkan</span>;
                 cardBorderClass = "border-start border-5 border-danger";
            }

            return (
              <div key={task._id} className="col-12 mb-3">
                <Link 
                  to={`/mahasiswa/kelas/${id_praktikum}/tugas/${task._id}`} 
                  className="text-decoration-none"
                >
                  <div className={`card shadow-sm border-0 hover-effect h-100 ${cardBorderClass}`}>
                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                      
                      {/* Left: Info */}
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {/* Session Badge */}
                          <small className="text-muted fw-bold text-uppercase me-2" style={{fontSize: '0.75rem'}}>
                            {task.session_info}
                          </small>
                          
                          {/* Submission Status Badge (The new feature) */}
                          {statusBadge}

                          {/* Time Status Badge */}
                          {!mySub && (
                              <span className={`badge bg-${timeStatus.color} bg-opacity-10 text-${timeStatus.color} border border-${timeStatus.color} border-opacity-10`}>
                                {timeStatus.text}
                              </span>
                          )}
                        </div>

                        <h5 className="fw-bold text-dark mb-1">{task.judul}</h5>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i> 
                          Deadline: {formatDate(task.tenggat_waktu)}
                        </p>
                      </div>

                      {/* Right: Arrow */}
                      <div className="text-primary opacity-50">
                        <i className="bi bi-chevron-right fs-4"></i>
                      </div>

                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TugasMhs;