import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, pendingGrading: 0 });
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from our new endpoint
        const res = await api.get('/api/users/asdos-dashboard');
        setStats(res.data.stats);
        setMyClasses(res.data.myClasses);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container-fluid p-4">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fs-3 fw-bold text-dark mb-0">Dashboard Asisten</h2>
          <p className="text-muted small mb-0">Selamat datang kembali! Berikut ringkasan kelasmu.</p>
        </div>
        {/* Removed "Buat Kelas" button because Asdos cannot do that */}
      </div>

      {/* --- STATS CARDS --- */}
      <div className="row g-3 mb-4">
        {/* Card 1: Kelas Diampu */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Kelas Diampu</h5>
                <h2 className="mb-0 fw-bold text-primary">
                  {loading ? "..." : stats.totalClasses}
                </h2>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                <i className="bi bi-journal-bookmark-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Mahasiswa (Placeholder for now) */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Total Mahasiswa</h5>
                <h2 className="mb-0 fw-bold text-success">
                  {loading ? "..." : stats.totalStudents}
                </h2>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                <i className="bi bi-people-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Grading (Placeholder) */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Perlu Dinilai</h5>
                <h2 className="mb-0 fw-bold text-warning">
                  {loading ? "..." : stats.pendingGrading}
                </h2>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                <i className="bi bi-pencil-square fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KELAS AKTIF (REAL DATA) --- */}
      <h5 className="fw-bold mb-3">Daftar Kelas Praktikum</h5>

      {loading ? (
        <div className="text-center py-5">Loading data kelas...</div>
      ) : myClasses.length === 0 ? (
        <div className="alert alert-info border-0 shadow-sm">
          <i className="bi bi-info-circle me-2"></i>
          Kamu belum ditugaskan ke kelas praktikum manapun. Hubungi Admin.
        </div>
      ) : (
        <div className="row g-3">
          {myClasses.map((cls) => (
            <div key={cls.id_praktikum} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 hover-shadow transition-all">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                      Kelas {cls.kode_kelas || 'A'}
                    </span>
                    <small className="text-muted fw-bold">{cls.tahun_pelajaran}</small>
                  </div>

                  <h5 className="fw-bold mb-1 text-truncate" title={cls.mata_kuliah}>
                    {cls.mata_kuliah}
                  </h5>

                  <p className="text-muted small mb-3">
                    <i className="bi bi-clock me-1"></i> {cls.jadwal || 'Jadwal belum set'} <br />
                    <i className="bi bi-geo-alt me-1"></i> {cls.ruangan || 'Online'}
                  </p>

                  <div className="d-grid gap-2 border-top pt-3">
                    {/* Link to the Module Manager we built earlier */}
                    {/* NOTE: Ideally, we pass the ID in the URL so the next page knows which one to open */}
                    <Link to="/asdos/modul-manager" className="btn btn-primary btn-sm fw-bold">
                      <i className="bi bi-gear-fill me-2"></i>Kelola Pertemuan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;