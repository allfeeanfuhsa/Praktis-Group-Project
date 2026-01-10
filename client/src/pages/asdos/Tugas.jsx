import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api'; // Ensure you have your axios instance

const Tugas = () => {
  const { id_praktikum } = useParams();
  
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Sessions first (SQL)
        const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sessions = sessionRes.data;

        // 2. Fetch Tasks for each Session (NoSQL)
        const allTasks = [];
        
        // We use Promise.all to fetch them in parallel for speed
        await Promise.all(sessions.map(async (session) => {
          try {
            const taskRes = await api.get(`/api/content/tugas/session/${session.id_pertemuan}`);
            const tasks = taskRes.data.map(t => ({
              ...t,
              // Attach session info so we know which session this task belongs to
              session_name: `Sesi ${session.sesi_ke}` 
            }));
            allTasks.push(...tasks);
          } catch (err) {
            console.error(`No tasks for session ${session.id_pertemuan}`);
          }
        }));

        // Sort by deadline (closest first)
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
      fetchData();
    }
  }, [id_praktikum]);

  // Helper: Check if deadline is passed or within 24 hours
  const checkUrgency = (deadlineString) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 1 && diffDays >= 0; // True if due today or tomorrow
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) return <div className="text-center py-5">Loading tasks...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      {/* HEADER & TOMBOL BUAT TUGAS */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h3 className="fw-bold text-dark">Daftar Tugas</h3>
           <p className="text-muted small">Kelola tugas untuk kelas ini</p>
        </div>
      </div>

      {/* LIST TUGAS */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="list-group list-group-flush rounded-3">
          
          {taskList.length === 0 ? (
             <div className="p-5 text-center text-muted">Belum ada tugas yang dibuat.</div>
          ) : (
            taskList.map((item) => {
              const isUrgent = checkUrgency(item.tenggat_waktu);
              
              return (
                <div className="list-group-item p-4 border-bottom" key={item._id}>
                  
                  {/* Bagian Atas: Judul & Deadline */}
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                            {item.session_name}
                          </span>
                          <h5 className="mb-0 fw-bold text-dark">{item.judul}</h5>
                      </div>
                      <p className="mb-1 text-muted small">{item.deskripsi || "Tidak ada deskripsi"}</p>
                    </div>
                    
                    {/* Logika Badge Deadline */}
                    <small className={`fw-bold px-2 py-1 rounded border ${
                        isUrgent ? 'text-danger bg-danger bg-opacity-10' : 'text-muted bg-light'
                    }`}>
                        Deadline: {formatDate(item.tenggat_waktu)}
                    </small>
                  </div>
                  
                  {/* Bagian Bawah: Tombol Aksi */}
                  <div className="mt-3 d-flex gap-2">
                    
                    {/* === UPDATED LINK FOR GRADING === */}
                    <Link 
                        to={`/asdos/kelas/${id_praktikum}/tugas/${item._id}/grade`} 
                        className="btn btn-sm btn-outline-primary fw-bold"
                    >
                      <i className="bi bi-check-circle me-1"></i> Lihat Pengumpulan
                    </Link>
                    
                    {/* Tombol Edit (Optional implementation) */}
                    <button className="btn btn-sm btn-light border fw-bold text-secondary">
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Tugas;