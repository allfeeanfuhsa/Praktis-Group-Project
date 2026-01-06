import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <>
      {/* ALERT / WELCOME MESSAGE */}
      <div className="row">
        <div className="col-12">
          <div className="alert alert-primary d-flex align-items-center shadow-sm border-0" role="alert">
            <i className="bi bi-info-circle-fill me-3 fs-4"></i>
            <div>
              <strong>Selamat Datang!</strong> Jangan lupa cek tugas terbaru di menu E-Business.
            </div>
          </div>
        </div>
      </div>

      <h3 className="fw-bold mb-3 mt-2">Mata Kuliah Saya</h3>

      {/* GRID KARTU MATA KULIAH */}
      <div className="row g-4">
        
        {/* KARTU 1: E-Business */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span className="badge bg-primary">TIF-51</span>
                <i className="bi bi-laptop fs-4 text-primary"></i>
              </div>
              <h5 className="card-title fw-bold">E-Business & Web Dev</h5>
              <p className="card-text text-muted small">Asdos: Choi Ung</p>
              <hr />
              <div className="d-grid gap-2">
                {/* Ganti <a> jadi <Link> */}
                <Link to="/mahasiswa/jadwal" className="btn btn-outline-primary btn-sm">
                    Lihat Jadwal
                </Link>
                <Link to="/mahasiswa/tugas" className="btn btn-primary btn-sm">
                    Kerjakan Tugas
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 2: Pengantar AI */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span className="badge bg-info text-dark">TIF-51</span>
                <i className="bi bi-cpu fs-4 text-info"></i>
              </div>
              <h5 className="card-title fw-bold">Pengantar AI</h5>
              <p className="card-text text-muted small">Asdos: Yeonsu</p>
              <hr />
              <div className="d-grid gap-2">
                {/* Tombol Disabled (Tetap pakai <a> atau <button> boleh) */}
                <button className="btn btn-outline-secondary btn-sm" disabled>
                    Belum Ada Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;