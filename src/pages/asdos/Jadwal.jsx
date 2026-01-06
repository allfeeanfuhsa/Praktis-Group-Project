import React from 'react';
import { Link } from 'react-router-dom';

const Jadwal = () => {
  // Simulasi Data Jadwal (Nanti ini dari Database)
  const jadwalList = [
    {
      id: 1,
      matkul: "E-Business (TIF51)",
      sesi: "Sesi 1",
      hari: "Senin",
      waktu: "08:00 - 10:00",
      ruang: "Lab Komputer 2"
    },
    // Anda bisa coba tambah data dummy lain di sini
    // { id: 2, matkul: "Pemrograman Web (TIF52)", sesi: "Sesi 2", hari: "Selasa", waktu: "10:00 - 12:00", ruang: "Lab Jaringan" }
  ];

  const handleDelete = (id) => {
    // Logika hapus sementara (alert)
    if (window.confirm('Hapus jadwal ini?')) {
      alert('Data dengan ID ' + id + ' berhasil dihapus (Simulasi)');
    }
  };

  return (
    <>
      {/* HEADER & TOMBOL TAMBAH */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">Penjadwalan Lab</h3>
        {/* Link ke halaman input (Kita buat setelah ini) */}
        <Link to="/asdos/jadwal/input" className="btn btn-primary shadow-sm">
          <i className="bi bi-plus-lg me-2"></i>Buat Jadwal
        </Link>
      </div>

      {/* TABEL JADWAL */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3">Mata Kuliah</th>
                  <th>Sesi</th>
                  <th>Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* Looping Data */}
                {jadwalList.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4 fw-bold">{item.matkul}</td>
                    <td>
                      <span className="badge bg-primary">{item.sesi}</span>
                    </td>
                    <td>
                      {item.hari}, {item.waktu} <br /> 
                      <small className="text-muted">{item.ruang}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Tombol Edit */}
                        <Link to="/asdos/jadwal/input" className="btn btn-sm btn-light text-warning border">
                            <i className="bi bi-pencil"></i>
                        </Link>
                        
                        {/* Tombol Hapus */}
                        <button 
                            className="btn btn-sm btn-light text-danger border" 
                            onClick={() => handleDelete(item.id)}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Jadwal;