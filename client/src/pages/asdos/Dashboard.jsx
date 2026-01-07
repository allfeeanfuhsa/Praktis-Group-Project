import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <>
      {/* --- BAGIAN JUDUL & TOMBOL --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fs-3 fw-bold text-dark mb-0">Dashboard Asisten</h2>
          <p className="text-muted small mb-0">Kelola kegiatan praktikum kamu di sini.</p>
        </div>
        
        {/* Tombol Trigger Modal */}
        <button 
            className="btn btn-primary shadow-sm fw-bold px-3 py-2 rounded-3" 
            data-bs-toggle="modal" 
            data-bs-target="#modalBuatKelas"
        >
          <i className="bi bi-plus-lg me-2"></i>Buat Kelas Baru
        </button>
      </div>

      {/* --- BAGIAN KARTU STATISTIK --- */}
      <div className="row g-3 mb-4">
        {/* Card 1: Mahasiswa */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Mahasiswa</h5>
                <h2 className="mb-0 fw-bold text-primary">120</h2>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                <i className="bi bi-people-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card 2: Tugas Masuk */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Tugas Masuk</h5>
                <h2 className="mb-0 fw-bold text-success">45</h2>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                <i className="bi bi-file-earmark-check-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Jadwal Lab */}
        <div className="col-md-4">
          <div className="card p-3 bg-white border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 text-muted small text-uppercase fw-bold">Jadwal Lab</h5>
                <h2 className="mb-0 fw-bold text-warning">3 Sesi</h2>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                <i className="bi bi-calendar-week-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BAGIAN KELAS AKTIF --- */}
      <h5 className="fw-bold mb-3">Kelas Aktif</h5>
      <div className="row g-3">
        {/* Contoh Satu Kelas (Nanti bisa di-looping pakai .map) */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 hover-shadow transition-all">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">TIF-51</span>
                <i className="bi bi-three-dots-vertical text-muted" style={{ cursor: 'pointer' }}></i>
              </div>
              <h5 className="fw-bold mb-1">E-Business & Web Development</h5>
              <p className="text-muted small mb-3">Senin, 08:00 - 10:00 | Lab Komputer 2</p>
              
              <div className="d-flex gap-2 border-top pt-3">
                {/* Ganti <a> dengan <Link> React Router */}
                <Link to="/asdos/jadwal" className="btn btn-light btn-sm flex-fill fw-bold text-secondary">
                    Jadwal
                </Link>
                <Link to="/asdos/tugas" className="btn btn-light btn-sm flex-fill fw-bold text-secondary">
                    Tugas
                </Link>
                <Link to="/asdos/materi" className="btn btn-light btn-sm flex-fill fw-bold text-secondary">
                    Materi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL BUAT KELAS --- */}
      <div className="modal fade" id="modalBuatKelas" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Tambah Kelas Baru</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body pt-4">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Nama Mata Kuliah</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="Contoh: Pemrograman Mobile" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Kode Kelas</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="Contoh: TIF-52" />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold small text-muted">Hari</label>
                    <select className="form-select bg-light border-0">
                      <option>Senin</option>
                      <option>Selasa</option>
                      <option>Rabu</option>
                      <option>Kamis</option>
                      <option>Jumat</option>
                    </select>
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold small text-muted">Jam</label>
                    <input type="time" className="form-control bg-light border-0" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">Ruangan</label>
                  <select className="form-select bg-light border-0">
                    <option>Lab Komputer 1</option>
                    <option>Lab Komputer 2</option>
                    <option>Lab Jaringan</option>
                  </select>
                </div>
                <div className="d-grid">
                  <button type="button" className="btn btn-primary fw-bold py-2" data-bs-dismiss="modal">
                    Simpan Kelas
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;