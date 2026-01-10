import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const TugasUpload = () => {
  const { id_praktikum, id_tugas } = useParams();
  
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Task
      const taskRes = await api.get(`/api/content/tugas/${id_tugas}`); 
      setTask(taskRes.data);

      // Fetch Submission
      const subRes = await api.get(`/api/submission/me/${id_tugas}`);
      setSubmission(subRes.data);

    } catch (err) {
      if (err.response && err.response.status !== 404) {
          console.error("Error loading data", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id_tugas]);

  // 2. Handlers
  const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Pilih file dahulu!");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('tugas_id', id_tugas);
      formData.append('file', selectedFile);

      await api.post('/api/submission', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Tugas berhasil dikumpulkan!');
      setSelectedFile(null);
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  // NEW: Download My Own Submission
  const handleDownloadMyFile = async () => {
      if (!submission) return;
      try {
          // We assume this endpoint exists (we will add it in Step 2)
          const response = await api.get(`/api/submission/download/${submission._id}`, {
              responseType: 'blob'
          });
          
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          // Use filename from DB or fallback
          link.setAttribute('download', submission.file.filename || 'tugas_saya.pdf'); 
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (err) {
          alert("Gagal mendownload file.");
      }
  };

  // Helper: Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!task) return <div className="alert alert-danger">Tugas tidak ditemukan.</div>;

  return (
    <div className="container-fluid px-0">
      
      {/* HEADER */}
      <div className="mb-4">
        <Link to={`/mahasiswa/kelas/${id_praktikum}/tugas`} className="text-decoration-none text-muted mb-2 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar
        </Link>
        <h3 className="fw-bold">{task.judul}</h3>
      </div>

      <div className="row">
        {/* LEFT COLUMN: Task Details */}
        <div className="col-md-7 mb-4">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Instruksi Tugas</h5>
              <p className="text-secondary" style={{whiteSpace: 'pre-line'}}>
                {task.deskripsi || "Tidak ada deskripsi."}
              </p>
              
              <div className="d-flex align-items-center gap-3 mt-4 p-3 bg-light rounded-3 border">
                <i className="bi bi-clock-history fs-4 text-warning"></i>
                <div>
                  <small className="text-muted d-block fw-bold text-uppercase">Batas Waktu</small>
                  <span className="fw-bold">{formatDate(task.tenggat_waktu)}</span>
                </div>
              </div>

              {/* Attachments from Asdos */}
              {task.attachments && task.attachments.length > 0 && (
                 <div className="mt-4">
                    <h6 className="fw-bold small text-muted text-uppercase">Lampiran Soal</h6>
                    {task.attachments.map((file, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 mt-2">
                         <i className="bi bi-paperclip text-primary"></i>
                         <span className="text-dark">{file.filename}</span>
                      </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Submission Area */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h5 className="mb-0 fw-bold">Status Pengumpulan</h5>
            </div>
            <div className="card-body p-4">
              
              {/* === STATE: SUBMITTED === */}
              {submission ? (
                <div className="text-center">
                   
                   {/* 1. Status Badge */}
                   <div className="mb-4">
                      <span className={`badge rounded-pill px-3 py-2 ${submission.status === 'terlambat' ? 'bg-danger' : 'bg-success'}`}>
                          {submission.status === 'terlambat' ? 'Terlambat Mengumpulkan' : 'Diserahkan Tepat Waktu'}
                      </span>
                      <p className="text-muted small mt-2 mb-0">
                        Diserahkan pada: {formatDate(submission.submitted_at)}
                      </p>
                   </div>

                   {/* 2. File Receipt Card (The UX Improvement) */}
                   <div className="card border bg-light mb-4 text-start">
                      <div className="card-body d-flex align-items-center">
                          <i className="bi bi-file-earmark-pdf-fill text-danger fs-1 me-3"></i>
                          <div className="overflow-hidden">
                              <h6 className="fw-bold mb-0 text-truncate">{submission.file.filename}</h6>
                              <small className="text-muted">
                                  {/* Using submission.file structure from your model */}
                                  {(submission.file.size / 1024).toFixed(1)} KB
                              </small>
                          </div>
                          <button 
                              onClick={handleDownloadMyFile}
                              className="btn btn-sm btn-outline-secondary ms-auto"
                              title="Download file saya"
                          >
                              <i className="bi bi-download"></i>
                          </button>
                      </div>
                   </div>

                   {/* 3. Grading Result */}
                   {submission.nilai !== undefined && submission.nilai !== null ? (
                     <div className="text-start border-top pt-3">
                        <h6 className="fw-bold small text-muted text-uppercase">Nilai & Feedback</h6>
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <h2 className="fw-bold text-primary mb-0">{submission.nilai}/100</h2>
                        </div>
                        {submission.feedback && (
                          <div className="alert alert-info d-flex gap-2">
                             <i className="bi bi-info-circle-fill mt-1"></i>
                             <div>{submission.feedback}</div>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="alert alert-warning d-flex align-items-center gap-2 text-start small">
                        <i className="bi bi-hourglass-split"></i>
                        <div>Menunggu penilaian dari Asisten Dosen.</div>
                     </div>
                   )}

                </div>
              ) : (
                
                /* === STATE: NOT SUBMITTED === */
                <form onSubmit={handleUpload}>
                   <div className="text-center mb-4">
                      <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted">
                          <i className="bi bi-cloud-upload fs-1"></i>
                      </div>
                      <p className="text-muted small">Belum ada file yang dikumpulkan.</p>
                   </div>

                   <div className="mb-3">
                      <label className="form-label fw-bold small">Upload File Jawaban</label>
                      <input 
                        type="file" 
                        className="form-control"
                        onChange={handleFileChange}
                        required
                      />
                   </div>

                   <button 
                     type="submit" 
                     className="btn btn-primary w-100 fw-bold py-2 rounded-3"
                     disabled={uploading}
                   >
                      {uploading ? 'Sedang Mengupload...' : <><i className="bi bi-send-fill me-2"></i>Kumpulkan Tugas</>}
                   </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TugasUpload;