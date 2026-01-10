import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const SessionDetail = () => {
  const { id_praktikum, id_session } = useParams();
  
  const [session, setSession] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Get Session Info (SQL)
        const sessRes = await api.get(`/api/content/session/${id_session}`);
        setSession(sessRes.data);

        // 2. Get Materials (NoSQL)
        // Note: Ignore 404s if empty
        try {
            const matRes = await api.get(`/api/content/materi/session/${id_session}`);
            setMaterials(matRes.data);
        } catch(e) { setMaterials([]); }

        // 3. Get Tasks (NoSQL)
        try {
            const taskRes = await api.get(`/api/content/tugas/session/${id_session}`);
            setTasks(taskRes.data);
        } catch(e) { setTasks([]); }

      } catch (err) {
        console.error("Error loading session detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id_session]);

  const handleDownload = async (matId, fileIndex, filename) => {
    try {
       const response = await api.get(`/api/content/materi/${matId}/download/${fileIndex}`, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', filename);
       document.body.appendChild(link);
       link.click();
       link.remove();
    } catch (err) {
       alert("Gagal download");
    }
  };

  if (loading) return <div className="text-center py-5">Loading detail sesi...</div>;
  if (!session) return <div className="alert alert-danger">Sesi tidak ditemukan</div>;

  return (
    <div className="container-fluid px-0">
      
      {/* Header / Nav */}
      <div className="mb-4">
         <Link to={`/mahasiswa/kelas/${id_praktikum}/jadwal`} className="text-muted text-decoration-none small fw-bold">
           <i className="bi bi-arrow-left me-1"></i> KEMBALI KE JADWAL
         </Link>
         <div className="d-flex align-items-center mt-2 gap-3">
            <span className="badge bg-primary fs-5">Sesi {session.sesi_ke}</span>
            <h3 className="fw-bold mb-0">Detail Pertemuan</h3>
         </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: Info & Materials */}
        <div className="col-lg-8">
           
           {/* Info Card */}
           <div className="card border-0 shadow-sm rounded-4 mb-4">
             <div className="card-body p-4">
                <div className="row">
                   <div className="col-md-4 mb-3 mb-md-0">
                      <small className="text-muted fw-bold text-uppercase">Tanggal</small>
                      <div className="fw-bold fs-5">
                        {new Date(session.tanggal).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}
                      </div>
                   </div>
                   <div className="col-md-4 mb-3 mb-md-0">
                      <small className="text-muted fw-bold text-uppercase">Waktu</small>
                      <div className="fw-bold fs-5">{session.waktu_mulai} - {session.waktu_selesai}</div>
                   </div>
                   <div className="col-md-4">
                      <small className="text-muted fw-bold text-uppercase">Ruangan</small>
                      <div className="fw-bold fs-5">{session.ruangan}</div>
                   </div>
                </div>
             </div>
           </div>

           {/* Materials Section */}
           <h5 className="fw-bold mb-3">Materi Pembelajaran</h5>
           {materials.length === 0 ? (
               <div className="alert alert-light border text-muted">Belum ada materi yang diunggah.</div>
           ) : (
               materials.map(mat => (
                   <div key={mat._id} className="card border-0 shadow-sm rounded-4 mb-3">
                       <div className="card-body p-4">
                           <h5 className="fw-bold text-primary">{mat.judul}</h5>
                           <p className="text-secondary small">{mat.deskripsi}</p>
                           
                           {/* Attachments */}
                           <div className="d-flex flex-wrap gap-2 mt-3">
                               {mat.attachments.map((file, idx) => (
                                   <button 
                                     key={idx}
                                     onClick={() => handleDownload(mat._id, idx, file.filename)}
                                     className="btn btn-sm btn-light border d-flex align-items-center gap-2"
                                   >
                                      <i className="bi bi-file-earmark-text text-danger"></i>
                                      {file.filename}
                                      <i className="bi bi-download small ms-1 text-muted"></i>
                                   </button>
                               ))}
                           </div>
                       </div>
                   </div>
               ))
           )}
        </div>

        {/* RIGHT COLUMN: Tasks */}
        <div className="col-lg-4">
           <h5 className="fw-bold mb-3">Tugas Sesi Ini</h5>
           {tasks.length === 0 ? (
               <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted">
                   <i className="bi bi-clipboard-check fs-1 mb-2 opacity-25"></i>
                   <p className="small mb-0">Tidak ada tugas.</p>
               </div>
           ) : (
               tasks.map(task => (
                   <div key={task._id} className="card border-0 shadow-sm rounded-4 mb-3">
                       <div className="card-body p-4">
                           <div className="d-flex justify-content-between align-items-start mb-2">
                               <h6 className="fw-bold mb-0 text-truncate" style={{maxWidth: '70%'}}>{task.judul}</h6>
                               {new Date() > new Date(task.tenggat_waktu) ? 
                                 <span className="badge bg-danger bg-opacity-10 text-danger" style={{fontSize: '0.65rem'}}>Closed</span> : 
                                 <span className="badge bg-success bg-opacity-10 text-success" style={{fontSize: '0.65rem'}}>Open</span>
                               }
                           </div>
                           <p className="text-muted small mb-3 line-clamp-2" style={{fontSize: '0.85rem'}}>
                              Deadline: {new Date(task.tenggat_waktu).toLocaleString('id-ID')}
                           </p>
                           <Link 
                             to={`/mahasiswa/kelas/${id_praktikum}/tugas/${task._id}`} 
                             className="btn btn-primary btn-sm w-100 fw-bold"
                           >
                             Lihat & Kumpulkan
                           </Link>
                       </div>
                   </div>
               ))
           )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;