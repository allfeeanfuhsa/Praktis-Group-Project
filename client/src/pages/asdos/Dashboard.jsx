import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const DashboardAsdos = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, pendingGrading: 0 });
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/users/asdos-dashboard');
        
        // === FIX 1: MATCH CONTROLLER KEYS ===
        // Controller sends: { stats: {...}, classes: [...] }
        setStats(res.data.stats || { totalClasses: 0, totalStudents: 0, pendingGrading: 0 });
        
        // === FIX 2: HANDLE UNDEFINED DATA ===
        // The key from controller is 'classes', not 'myClasses'
        setMyClasses(res.data.classes || []);

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
                  {stats.totalClasses}
                </h2>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                <i className="bi bi-journal-bookmark-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Mahasiswa (Placeholder) */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Total Mahasiswa</h5>
                <h2 className="mb-0 fw-bold text-success">
                  {/* Backend logic for student count not yet implemented, defaulting to 0 */}
                  {stats.totalStudents || 0}
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
                  {stats.pendingGrading || 0}
                </h2>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                <i className="bi bi-pencil-square fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KELAS AKTIF --- */}
      <h5 className="fw-bold mb-3">Daftar Kelas Praktikum</h5>

      {loading ? (
        <div className="text-center py-5">Loading data kelas...</div>
      ) : !myClasses || myClasses.length === 0 ? (
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
                      {/* Controller returns 'kode', not 'kode_kelas' */}
                      Kelas {cls.kode || cls.kode_kelas || 'A'}
                    </span>
                    <small className="text-muted fw-bold">
                        {/* Fallback if semester/year isn't in API yet */}
                        {cls.tahun_pelajaran || '2023/2024'}
                    </small>
                  </div>

                  {/* Controller returns 'nama_praktikum', not 'mata_kuliah' */}
                  <h5 className="fw-bold mb-1 text-truncate" title={cls.nama_praktikum}>
                    {cls.nama_praktikum || cls.mata_kuliah || "Nama Kelas"}
                  </h5>

                  <p className="text-muted small mb-3">
                    <i className="bi bi-clock me-1"></i> {cls.jadwal || 'Jadwal belum set'} <br />
                    <i className="bi bi-geo-alt me-1"></i> {cls.ruangan || 'Online'}
                  </p>

                  <div className="d-grid gap-2 border-top pt-3">
                    {/* Link to Manage Schedule */}
                    <Link to={`/asdos/kelas/${cls.id_praktikum}/jadwal`} className="btn btn-primary btn-sm fw-bold">
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

export default DashboardAsdos;