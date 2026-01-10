import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const TugasMhs = () => {
  const { id_praktikum } = useParams();

  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 1. Get all sessions for this class (SQL)
        const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sessions = sessionRes.data;

        // 2. Get tasks for each session (NoSQL)
        const allTasks = [];
        await Promise.all(sessions.map(async (session) => {
          try {
            const taskRes = await api.get(`/api/content/tugas/session/${session.id_pertemuan}`);
            // Attach session info to the task for display
            const tasksWithSession = taskRes.data.map(t => ({
              ...t,
              session_info: `Sesi ${session.sesi_ke}`
            }));
            allTasks.push(...tasksWithSession);
          } catch (err) {
            // Ignore 404s (sessions with no tasks)
          }
        }));

        // Sort: Closest deadline first
        allTasks.sort((a, b) => new Date(a.tenggat_waktu) - new Date(b.tenggat_waktu));
        
        setTaskList(allTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Gagal memuat daftar tugas.");
      } finally {
        setLoading(false);
      }
    };

    if (id_praktikum) {
      fetchTasks();
    }
  }, [id_praktikum]);

  // Helper: Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper: Deadline Status
  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffHours = (due - now) / 36e5; // Difference in hours

    if (diffHours < 0) return { text: 'Terlewat', color: 'danger' };
    if (diffHours < 24) return { text: 'Segera', color: 'warning' };
    return { text: 'Aktif', color: 'success' };
  };

  if (loading) return <div className="text-center py-5">Loading tugas...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

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
            const status = getDeadlineStatus(task.tenggat_waktu);
            
            return (
              <div key={task._id} className="col-12 mb-3">
                <Link 
                  to={`/mahasiswa/kelas/${id_praktikum}/tugas/${task._id}`} 
                  className="text-decoration-none"
                >
                  <div className="card shadow-sm border-0 hover-effect h-100">
                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                      
                      {/* Left Side: Task Info */}
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">
                            {task.session_info}
                          </span>
                          <span className={`badge bg-${status.color} bg-opacity-10 text-${status.color} border border-${status.color} border-opacity-10`}>
                            {status.text}
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">{task.judul}</h5>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i> 
                          Deadline: {formatDate(task.tenggat_waktu)}
                        </p>
                      </div>

                      {/* Right Side: Arrow Icon */}
                      <div className="text-primary">
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
      
      {/* CSS for Hover Effect (Optional) */}
      <style>{`
        .hover-effect { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-effect:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
      `}</style>
    </div>
  );
};

export default TugasMhs;