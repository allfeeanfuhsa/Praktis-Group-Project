import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';

const MateriMhs = () => {
  const { id_praktikum } = useParams();
  const [library, setLibrary] = useState([]); // Array of { session, materials: [] }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        // 1. Get All Sessions
        const sessionRes = await api.get(`/api/content/session/list/${id_praktikum}`);
        const sessions = sessionRes.data.sort((a, b) => a.sesi_ke - b.sesi_ke);

        // 2. Get Materials for each Session
        const promises = sessions.map(async (sess) => {
            try {
                const matRes = await api.get(`/api/content/materi/session/${sess.id_pertemuan}`);
                return { session: sess, materials: matRes.data };
            } catch (e) {
                return { session: sess, materials: [] };
            }
        });

        const results = await Promise.all(promises);
        // Filter out sessions that have no materials
        const withMaterials = results.filter(item => item.materials.length > 0);
        setLibrary(withMaterials);

      } catch (err) {
        console.error("Library error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id_praktikum) fetchLibrary();
  }, [id_praktikum]);

  // Reusing download logic
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

  if (loading) return <div className="text-center py-5">Loading materi...</div>;

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-dark">Bank Materi</h3>
        <p className="text-muted small">Kumpulan modul dan bahan ajar praktikum.</p>
      </div>

      <div className="row">
         {library.length === 0 ? (
             <div className="col-12 text-center py-5 text-muted bg-light rounded">
                 Belum ada materi yang diunggah untuk kelas ini.
             </div>
         ) : (
             <div className="col-12">
                 {library.map((item) => (
                     <div key={item.session.id_pertemuan} className="mb-4">
                         {/* Session Header */}
                         <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-2">
                             <span className="badge bg-primary rounded-pill">Sesi {item.session.sesi_ke}</span>
                             <h5 className="fw-bold mb-0 text-secondary">
                                {new Date(item.session.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month:'long'})}
                             </h5>
                         </div>

                         {/* Materials Grid */}
                         <div className="row g-3">
                             {item.materials.map(mat => (
                                 <div key={mat._id} className="col-md-6 col-lg-4">
                                     <div className="card h-100 border-0 shadow-sm rounded-3">
                                         <div className="card-body">
                                             <div className="d-flex align-items-start justify-content-between mb-2">
                                                <i className="bi bi-journal-text fs-3 text-primary opacity-50"></i>
                                                <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                    {mat.attachments.length} file
                                                </small>
                                             </div>
                                             <h6 className="fw-bold">{mat.judul}</h6>
                                             <p className="text-muted small text-truncate">{mat.deskripsi}</p>
                                             
                                             <div className="d-grid gap-1 mt-3">
                                                {mat.attachments.map((file, idx) => (
                                                    <button 
                                                      key={idx}
                                                      onClick={() => handleDownload(mat._id, idx, file.filename)}
                                                      className="btn btn-sm btn-light text-start text-truncate"
                                                      title={file.filename}
                                                    >
                                                        <i className="bi bi-download me-2 text-primary"></i>
                                                        {file.filename}
                                                    </button>
                                                ))}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default MateriMhs;