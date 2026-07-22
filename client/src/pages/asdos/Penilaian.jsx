import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const PenilaianAsdos = () => {
  const { id_praktikum, id_tugas } = useParams();
  const navigate = useNavigate();

  // State
  const [taskTitle, setTaskTitle] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temporary state for grade inputs and save indicators
  const [inputGrades, setInputGrades] = useState({});
  const [saveStatus, setSaveStatus] = useState({}); // sub._id -> 'saving' | 'saved' | null
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [commentText, setCommentText] = useState("");

  // 1. Fetch Submissions
  useEffect(() => {
    let isMounted = true;
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/submission/task/${id_tugas}`);

        if (isMounted) {
          setTaskTitle(res.data.task_title || 'Tugas');
          const subs = res.data.submissions || [];
          setSubmissions(subs);

          // Initialize input states with existing grades
          const initialGrades = {};
          subs.forEach(sub => {
            if (sub.nilai !== null && sub.nilai !== undefined) {
              initialGrades[sub._id] = sub.nilai;
            }
          });
          setInputGrades(initialGrades);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
        if (isMounted) setError("Gagal memuat data pengumpulan tugas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id_tugas) {
      fetchSubmissions();
    }

    return () => {
      isMounted = false;
    };
  }, [id_tugas]);

  // 2. Handle Grade Input Change
  const handleInputChange = (submissionId, value) => {
    setInputGrades(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  // 3. Save Grade to Backend
  const handleSaveGrade = async (submissionId) => {
    const gradeValue = inputGrades[submissionId];

    // Simple validation
    if (gradeValue === '' || gradeValue === undefined || gradeValue < 0 || gradeValue > 100) {
      alert("Nilai harus berada di rentang 0 - 100");
      return;
    }

    try {
      setSaveStatus(prev => ({ ...prev, [submissionId]: 'saving' }));

      await api.put(`/api/submission/${submissionId}/grade`, {
        nilai: Number(gradeValue)
      });

      setSubmissions(prev => prev.map(sub =>
        sub._id === submissionId ? { ...sub, nilai: Number(gradeValue) } : sub
      ));

      setSaveStatus(prev => ({ ...prev, [submissionId]: 'saved' }));

      // Clear saved indicator after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [submissionId]: null }));
      }, 2000);

    } catch (err) {
      console.error("Error grading:", err);
      setSaveStatus(prev => ({ ...prev, [submissionId]: null }));
      alert("Gagal menyimpan nilai.");
    }
  };

  // 5. Discussion / Comments logic
  const openComments = (sub) => {
    setSelectedSubmission(sub);
    setShowOffcanvas(true);
  };

  const handleSendCommentAsdos = async () => {
    if (!commentText.trim() || !selectedSubmission) return;

    try {
      const res = await api.post(
        `/api/submission/${selectedSubmission._id}/comment`,
        { text: commentText }
      );

      setCommentText("");

      const updatedDoc = res.data.data;

      setSubmissions(prev =>
        prev.map(sub =>
          sub._id === selectedSubmission._id 
            ? { 
                ...updatedDoc, 
                student_name: sub.student_name, 
                student_nim: sub.student_nim 
              } 
            : sub
        )
      );

      setSelectedSubmission(prev => ({
        ...updatedDoc,
        student_name: prev?.student_name,
        student_nim: prev?.student_nim
      }));

    } catch (err) {
      console.error("Error comment:", err);
      alert("Gagal mengirim komentar.");
    }
  };

  // Helper: Open file in a new tab with JWT Auth headers
  const handleViewFile = async (endpoint) => {
    try {
      const res = await api.get(endpoint, { responseType: 'blob' });
      const contentType = res.headers['content-type'] || 'application/pdf';
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error("View file error:", err);
      alert("Gagal membuka berkas. Silakan coba lagi.");
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // Stat Calculations
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.nilai !== null && s.nilai !== undefined).length;
  const pendingSubmissions = totalSubmissions - gradedSubmissions;
  const averageGrade = gradedSubmissions > 0
    ? (submissions.reduce((acc, curr) => acc + (Number(curr.nilai) || 0), 0) / gradedSubmissions).toFixed(1)
    : '0';

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

  const baseURL = api.defaults.baseURL || 'http://localhost:5000';

  if (loading) {
    return (
      <div className="text-center py-5 text-light">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="opacity-75 mt-3">Memuat lembar penilaian...</p>
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
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
        <button onClick={() => navigate(`/asdos/kelas/${id_praktikum}/tugas`)} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
          <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar Tugas
        </button>
        <h3 className="fw-bold text-white mb-2">Penilaian: {taskTitle}</h3>
        <p className="text-light opacity-75 small">Kelola dan berikan nilai untuk hasil pengumpulan mahasiswa.</p>
      </motion.div>

      {/* QUICK STATS BAR */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
            <div className="bg-primary bg-opacity-25 p-3 rounded-4 text-white me-3">
              <i className="bi bi-people fs-4"></i>
            </div>
            <div>
              <small className="text-light opacity-75 d-block">Pengumpulan</small>
              <h4 className="fw-bold text-white mb-0">{totalSubmissions}</h4>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
            <div className="bg-success bg-opacity-25 p-3 rounded-white me-3">
              <i className="bi bi-check2-circle fs-4 text-success"></i>
            </div>
            <div>
              <small className="text-light opacity-75 d-block">Sudah Dinilai</small>
              <h4 className="fw-bold text-white mb-0">{gradedSubmissions}</h4>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
            <div className="bg-warning bg-opacity-25 p-3 rounded-white me-3">
              <i className="bi bi-hourglass-split fs-4 text-warning"></i>
            </div>
            <div>
              <small className="text-light opacity-75 d-block">Belum Dinilai</small>
              <h4 className="fw-bold text-white mb-0">{pendingSubmissions}</h4>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
            <div className="bg-info bg-opacity-25 p-3 rounded-white me-3">
              <i className="bi bi-award fs-4 text-info"></i>
            </div>
            <div>
              <small className="text-light opacity-75 d-block">Rata-Rata Nilai</small>
              <h4 className="fw-bold text-white mb-0">{averageGrade}</h4>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SUBMISSIONS TABLE */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card static rounded-4 overflow-hidden p-0 mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0 bg-transparent">
            <thead>
              <tr className="border-bottom border-light border-opacity-10 text-uppercase tracking-wider small text-light opacity-75">
                <th className="px-4 py-3 bg-transparent">Mahasiswa</th>
                <th className="py-3 bg-transparent">Waktu Pengumpulan</th>
                <th className="py-3 bg-transparent">Berkas Tugas</th>
                <th className="py-3 bg-transparent" style={{ width: '160px' }}>Nilai (0-100)</th>
                <th className="py-3 px-4 bg-transparent text-end" style={{ width: '160px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-light opacity-50 bg-transparent">
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                    Belum ada mahasiswa yang mengumpulkan tugas ini.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isGraded = sub.nilai !== null && sub.nilai !== undefined;
                  const currentStatus = saveStatus[sub._id];

                  return (
                    <motion.tr variants={itemVariants} key={sub._id} className="border-bottom border-light border-opacity-10">
                      {/* Mahasiswa info */}
                      <td className="px-4 bg-transparent">
                        <div className="fw-bold text-white">{sub.student_name || 'Nama Tidak Dikenal'}</div>
                        <small className="text-light opacity-50">{sub.student_nim || '-'}</small>
                      </td>

                      {/* Submitted time */}
                      <td className="bg-transparent">
                        <small className="text-light opacity-75">
                          <i className="bi bi-clock me-2 opacity-50"></i>{formatDate(sub.submitted_at)}
                        </small>
                      </td>

                      {/* File Link */}
                      <td className="bg-transparent">
                        {sub.file ? (
                          <button
                            type="button"
                            onClick={() => handleViewFile(`/api/submission/${sub._id}/download?view=true`)}
                            className="badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-3 py-2 rounded-pill text-decoration-none hover-opacity-100 d-inline-flex align-items-center"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <i className="bi bi-file-earmark-text me-2"></i>
                            {sub.file.filename || 'Buka Berkas'}
                          </button>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-25 text-light opacity-50 rounded-pill">Tanpa Berkas</span>
                        )}
                      </td>

                      {/* Grade Input */}
                      <td className="bg-transparent">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="number"
                            className="form-control form-control-sm text-center fw-bold bg-dark text-white border-light border-opacity-25 rounded-3"
                            value={inputGrades[sub._id] !== undefined ? inputGrades[sub._id] : ''}
                            onChange={(e) => handleInputChange(sub._id, e.target.value)}
                            placeholder="0"
                            min="0"
                            max="100"
                            style={{ width: '80px' }}
                          />
                          {isGraded && (
                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 rounded-pill px-2 py-1" title="Sudah Dinilai">
                              <i className="bi bi-check-lg"></i>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 bg-transparent text-end">
                        <div className="d-flex gap-2 justify-content-end align-items-center">
                          <button
                            className={`btn btn-sm ${currentStatus === 'saved' ? 'btn-success' : 'btn-primary'} rounded-3 px-3 fw-bold transition-all`}
                            onClick={() => handleSaveGrade(sub._id)}
                            disabled={currentStatus === 'saving'}
                            title="Simpan Nilai"
                          >
                            {currentStatus === 'saving' ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : currentStatus === 'saved' ? (
                              <>
                                <i className="bi bi-check2 me-1"></i> Tersimpan
                              </>
                            ) : (
                              <>
                                <i className="bi bi-save me-1"></i> Simpan
                              </>
                            )}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-light rounded-3 px-3"
                            onClick={() => openComments(sub)}
                            title="Diskusi / Komentar"
                          >
                            <i className="bi bi-chat-dots-fill"></i>
                            {sub.comments && sub.comments.length > 0 && (
                              <span className="badge bg-danger rounded-circle ms-1" style={{ fontSize: '0.65rem' }}>
                                {sub.comments.length}
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* DISCUSSIONS / COMMENTS DRAWER */}
      {showOffcanvas && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backdropFilter: 'blur(15px)', backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowOffcanvas(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content glass-card border-light border-opacity-25 shadow-lg rounded-4 overflow-hidden">
              
              <div className="modal-header border-bottom border-light border-opacity-10 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h4 className="modal-title fw-bold text-white d-flex align-items-center m-0">
                  <div className="p-2 rounded-circle me-3 bg-info text-white bg-opacity-25">
                    <i className="bi bi-chat-dots-fill fs-4"></i>
                  </div>
                  Diskusi Tugas — {selectedSubmission?.student_name || 'Mahasiswa'}
                </h4>
                <button type="button" className="btn-close btn-close-white opacity-75 hover-opacity-100" onClick={() => setShowOffcanvas(false)}></button>
              </div>

              <div className="modal-body text-white p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {selectedSubmission?.comments?.length > 0 ? (
                  selectedSubmission.comments.map((comment, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="fw-bold text-info">{comment.senderName || "User"}</small>
                        <small className="text-light opacity-50" style={{ fontSize: '0.7rem' }}>
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString("id-ID") : ""}
                        </small>
                      </div>
                      <div className="p-3 rounded-4 bg-light bg-opacity-10 border border-light border-opacity-10 text-white" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 text-light opacity-50">
                    <i className="bi bi-chat-square-text fs-1 d-block mb-3 opacity-50"></i>
                    Belum ada diskusi atau komentar untuk pengumpulan ini.
                  </div>
                )}
              </div>

              <div className="modal-footer border-top border-light border-opacity-10 p-4">
                <div className="d-flex gap-2 w-100">
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-light border-opacity-25 rounded-pill px-4 py-2"
                    placeholder="Tulis balasan pesan..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCommentAsdos()}
                  />
                  <button
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    onClick={handleSendCommentAsdos}
                    disabled={!commentText.trim()}
                  >
                    <i className="bi bi-send-fill me-1"></i> Kirim
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenilaianAsdos;