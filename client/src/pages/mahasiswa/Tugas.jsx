import React from 'react';
import { Link } from 'react-router-dom';

const Tugas = () => {
  // Simulasi Data Tugas (Database)
  const tugasList = [
    {
      id: 1,
      judul: "Tugas 1: Analisis Model Bisnis",
      deskripsi: "Silakan upload file PDF analisis kalian.",
      deadline: "Besok, 23:59",
      status: "Pending", // Status: Pending, Submitted, Graded
      nilai: null,
      feedback: null
    },
    {
      id: 2,
      judul: "Tugas 2: Landing Page HTML",
      deskripsi: "Membuat struktur landing page.",
      deadline: "20 Okt 2025", // Tanggal lewat tidak masalah kalau sudah dinilai
      status: "Graded", 
      nilai: 85,
      feedback: "Codingan rapi, mantap!"
    }
  ];

  return (
    <div className="container-fluid">
      <h2 className="fw-bold text-primary mb-4">Daftar Tugas</h2>

      {tugasList.map((item) => {
        // Logika Menentukan Warna & Tampilan berdasarkan Status
        const isGraded = item.status === 'Graded';
        const borderClass = isGraded ? 'border-success' : 'border-danger';
        
        return (
          <div 
            key={item.id} 
            className={`card border-0 shadow-sm mb-3 border-start border-4 ${borderClass}`}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold">{item.judul}</h5>
                
                {/* Tampilan Badge & Info Berbeda tiap status */}
                {isGraded ? (
                  // TAMPILAN SUDAH DINILAI (HIJAU)
                  <>
                    <span className="badge bg-success">Nilai: {item.nilai}/100</span>
                    <p className="text-success small mt-2 mb-0 fw-bold">
                      <i className="bi bi-check-circle me-1"></i> 
                      Feedback: {item.feedback}
                    </p>
                  </>
                ) : (
                  // TAMPILAN BELUM DIKERJAKAN (MERAH)
                  <>
                    <span className="badge bg-danger">Deadline: {item.deadline}</span>
                    <p className="text-muted small mt-2 mb-0">{item.deskripsi}</p>
                  </>
                )}
              </div>

              {/* Tombol Aksi */}
              {/* Kita arahkan ke halaman detail/upload dengan membawa ID tugas */}
              <Link 
                to={`/mahasiswa/tugas/upload?id=${item.id}`} 
                className={`btn px-4 ${isGraded ? 'btn-outline-success' : 'btn-primary'}`}
              >
                {isGraded ? 'Lihat Detail' : 'Kerjakan'}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Tugas;