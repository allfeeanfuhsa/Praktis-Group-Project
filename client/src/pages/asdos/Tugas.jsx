import React from 'react';
import { Link } from 'react-router-dom';

const Tugas = () => {
  // Simulasi Data Tugas
  const tugasList = [
    {
      id: 1,
      judul: "Tugas 1: Analisis SWOT",
      deskripsi: "Mahasiswa mengumpulkan file PDF analisis.",
      deadline: "Besok",
      isUrgent: true, // Untuk menandai warna merah
      masuk: 12
    },
    {
      id: 2,
      judul: "Tugas 2: Landing Page HTML",
      deskripsi: "Membuat struktur dasar website profile.",
      deadline: "20 Okt 2025",
      isUrgent: false,
      masuk: 0
    }
  ];

  return (
    <>
      {/* HEADER & TOMBOL BUAT TUGAS */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">Daftar Tugas</h3>
        <Link to="/asdos/tugas/input" className="btn btn-primary shadow-sm fw-bold">
          <i className="bi bi-plus-lg me-2"></i>Buat Tugas
        </Link>
      </div>

      {/* LIST TUGAS */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="list-group list-group-flush rounded-3">
          
          {/* Looping Data Tugas */}
          {tugasList.map((item) => (
            <div className="list-group-item p-4 border-bottom" key={item.id}>
              
              {/* Bagian Atas: Judul & Deadline */}
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1 fw-bold text-dark">{item.judul}</h5>
                  <p className="mb-1 text-muted small">{item.deskripsi}</p>
                </div>
                
                {/* Logika Badge Deadline (Merah/Abu) */}
                {item.isUrgent ? (
                    <small className="fw-bold text-danger bg-danger bg-opacity-10 px-2 py-1 rounded">
                        Deadline: {item.deadline}
                    </small>
                ) : (
                    <small className="fw-bold text-muted bg-light px-2 py-1 rounded border">
                        Deadline: {item.deadline}
                    </small>
                )}
              </div>
              
              {/* Bagian Bawah: Tombol Aksi */}
              <div className="mt-3 d-flex gap-2">
                {/* Tombol Nilai */}
                <Link 
                    to="/asdos/penilaian" 
                    className={`btn btn-sm fw-bold ${item.masuk > 0 ? 'btn-outline-success' : 'btn-outline-primary'}`}
                >
                  <i className="bi bi-check-circle me-1"></i> Nilai ({item.masuk} Masuk)
                </Link>
                
                {/* Tombol Edit */}
                {/* Kita kirim ID di URL agar nanti form input tahu tugas mana yang diedit */}
                <Link to={`/asdos/tugas/input`} className="btn btn-sm btn-light border fw-bold text-secondary">
                  <i className="bi bi-pencil me-1"></i> Edit
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
};

export default Tugas;