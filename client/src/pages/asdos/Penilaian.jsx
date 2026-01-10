import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const PenilaianAsdos = () => {
  const { id_praktikum, id_tugas } = useParams();

  // State
  const [taskTitle, setTaskTitle] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temporary state for grade inputs (so we can type before saving)
  const [inputGrades, setInputGrades] = useState({});

  // 1. Fetch Submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Call the endpoint we created in the previous step
        const res = await api.get(`/api/submission/task/${id_tugas}`);

        setTaskTitle(res.data.task_title);
        setSubmissions(res.data.submissions);

        // Initialize input states with existing grades
        const initialGrades = {};
        res.data.submissions.forEach(sub => {
          if (sub.nilai !== null) {
            initialGrades[sub._id] = sub.nilai;
          }
        });
        setInputGrades(initialGrades);

      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Gagal memuat data pengumpulan.");
      } finally {
        setLoading(false);
      }
    };

    if (id_tugas) {
      fetchSubmissions();
    }
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
    try {
      const gradeValue = inputGrades[submissionId];

      // Simple validation
      if (gradeValue === '' || gradeValue < 0 || gradeValue > 100) {
        alert("Nilai harus antara 0 - 100");
        return;
      }

      await api.put(`/api/submission/${submissionId}/grade`, {
        nilai: gradeValue
      });

      alert("Nilai berhasil disimpan!");

      // Optional: Refresh data or just update local state visually
      setSubmissions(prev => prev.map(sub =>
        sub._id === submissionId ? { ...sub, nilai: gradeValue } : sub
      ));

    } catch (err) {
      console.error("Error grading:", err);
      alert("Gagal menyimpan nilai.");
    }
  };

  // 4. Download Handler
  const handleDownload = async (submissionId, filename) => {
    try {
      const response = await api.get(`/api/submission/${submissionId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'tugas_mahasiswa');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Download error", err);
      alert("Gagal mengunduh file.");
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center py-5">Loading data...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="mb-4">
        <Link to={`/asdos/kelas/${id_praktikum}/tugas`} className="text-decoration-none text-muted mb-2 d-inline-block">
          <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar Tugas
        </Link>
        <h3 className="fw-bold">Penilaian: {taskTitle}</h3>
        <p className="text-muted">Daftar mahasiswa yang telah mengumpulkan tugas.</p>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Mahasiswa</th>
                  <th>Waktu Pengumpulan</th>
                  <th>File Tugas</th>
                  <th style={{ width: '150px' }}>Nilai (0-100)</th>
                  <th style={{ width: '100px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Belum ada mahasiswa yang mengumpulkan.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td className="px-4">
                        <div className="fw-bold">{sub.student_name || 'Nama Tidak Dikenal'}</div>
                        <div className="small text-muted">{sub.student_nim || '-'}</div>
                      </td>
                      <td>
                        {formatDate(sub.submitted_at)} {/* Changed from created_at to submitted_at */}
                      </td>
                      <td>
                        {/* === FIX IS HERE === */}
                        {/* OLD: sub.filename (undefined) */}
                        {/* NEW: sub.file.filename (correct) */}
                        <button
                          onClick={() => handleDownload(sub._id, sub.file ? sub.file.filename : 'tugas.pdf')}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-file-earmark-arrow-down me-1"></i>
                          Download
                        </button>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={inputGrades[sub._id] || ''}
                          onChange={(e) => handleInputChange(sub._id, e.target.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSaveGrade(sub._id)}
                        >
                          <i className="bi bi-save"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenilaianAsdos;